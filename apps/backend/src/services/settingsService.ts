import { setting_value_type } from '@repo/database';
import { Setting, SettingsKey } from '@repo/types';
import { Cache } from '../utility/cache';
import { database } from './databaseService';

const PUBLIC_SETTINGS: Array<SettingsKey> = [SettingsKey.ENABLE_REGISTRATION];

const DEFAULT_SETTINGS: Record<SettingsKey, Setting> = {
	[SettingsKey.ENABLE_REGISTRATION]: {
		value: true,
		type: 'BOOLEAN',
		label: 'Enable registration',
	},
	[SettingsKey.MOTD]: {
		value: 'Welcome to YAR! Change this message in settings.',
		type: 'STRING',
		label: 'MOTD (Message of the day)',
	},
};

export default class SettingsService {
	private static settingsCache = new Cache<Setting, SettingsKey>(DEFAULT_SETTINGS);

	static async getSettings() {
		const settings = await database.setting.findMany();
		this.settingsCache.clear();
		this.setDefaultSettings();

		for (const setting of settings) {
			this.settingsCache.set(setting.key as unknown as SettingsKey, {
				type: setting.value_type,
				value: setting.value as unknown as setting_value_type,
				label: setting.label ?? setting.key,
			});
		}

		return this.settingsCache.getAll() as Map<SettingsKey, Setting>;
	}

	static async getSetting(key: SettingsKey) {
		if (this.settingsCache.get(key)) {
			return this.settingsCache.get(key)!.value;
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
				label: setting.label ?? setting.key,
			});
			return setting.value;
		}

		return null;
	}

	static async setSetting(key: SettingsKey, value: string, _label?: string) {
		const label = _label ?? DEFAULT_SETTINGS[key].label ?? key;

		this.settingsCache.set(key, {
			type: this.getValueType(value),
			value: value as unknown as setting_value_type,
			label,
		});

		await database.setting.upsert({
			where: {
				key: key as unknown as string,
			},
			create: {
				key: key as unknown as string,
				value_type: this.getValueType(value),
				value: String(value),
				label,
			},
			update: {
				value_type: this.getValueType(value),
				value: String(value),
			},
		});

		return value;
	}

	static toObject(data: Map<Partial<SettingsKey>, Setting>) {
		const ret: Record<string, Setting> = {};
		for (const [key, value] of data.entries()) {
			ret[key as unknown as SettingsKey] = value;
		}
		return ret;
	}

	static isPublic(key: SettingsKey) {
		return PUBLIC_SETTINGS.includes(key);
	}

	private static setDefaultSettings() {
		for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
			this.settingsCache.set(key as unknown as SettingsKey, value);
		}
	}

	private static getValueType(value: string): setting_value_type {
		switch (typeof value) {
			case 'number':
				return 'INTEGER';
			case 'boolean':
				return 'BOOLEAN';
			case 'string':
			default:
				return 'STRING';
		}
	}
}
