import { setting_value_type } from '@repo/database';
import { Setting, SettingsKey } from '@repo/types';
import { Cache } from '../utility/cache';
import { database } from './databaseService';

export default class SettingsService {
	private static settingsCache = new Cache<Setting, SettingsKey>();

	static async getSettings() {
		const settings = await database.setting.findMany();
		this.settingsCache.clear();

		for (const setting of settings) {
			this.settingsCache.set(setting.key as unknown as SettingsKey, {
				type: setting.value_type,
				value: setting.value as unknown as setting_value_type,
			});
		}

		return this.settingsCache.getAll();
	}

	static async getSetting(key: SettingsKey) {
		if (this.settingsCache.get(key)) {
			return this.settingsCache.get(key);
		}

		const setting = await database.setting.findUnique({
			where: {
				key: key as unknown as string,
			},
		});

		if (setting) {
			this.settingsCache.set(key, {
				type: setting.value_type,
				value: setting.value as unknown as setting_value_type,
			});
			return setting.value;
		}

		return null;
	}

	static async setSetting(key: SettingsKey, value: string) {
		this.settingsCache.set(key, {
			type: this.getValueType(value),
			value: value as unknown as setting_value_type,
		});

		await database.setting.upsert({
			where: {
				key: key as unknown as string,
			},
			create: {
				key: key as unknown as string,
				value_type: this.getValueType(value),
				value,
			},
			update: {
				value_type: this.getValueType(value),
				value,
			},
		});

		return value;
	}

	private static getValueType(value: string): setting_value_type {
		switch (typeof value) {
			case 'string':
				return 'STRING';
			case 'number':
				return 'INTEGER';
			case 'boolean':
				return 'BOOLEAN';
			default:
				return 'STRING';
		}
	}
}
