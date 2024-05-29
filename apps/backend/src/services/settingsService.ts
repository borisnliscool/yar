import type { setting_value_type } from '@prisma/client';
import { Setting, SettingsKey, SettingValueType } from '@repo/types';
import { Cache } from '../utility/cache';
import { database } from './databaseService';

const PUBLIC_SETTINGS: Array<SettingsKey> = [
	SettingsKey.ENABLE_REGISTRATION,
	SettingsKey.MIN_PASSWORD_LENGTH,
];

const DEFAULT_SETTINGS: Record<SettingsKey, Setting> = {
	[SettingsKey.ENABLE_REGISTRATION]: {
		value: true,
		type: 'BOOLEAN',
		label: 'Enable registration',
	},
	[SettingsKey.MIN_PASSWORD_LENGTH]: {
		value: 8,
		type: 'INTEGER',
		label: 'Minimum password length',
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
				value: this.parseValue(setting.value, setting.value_type),
				label: setting.label ?? setting.key,
			});
		}

		return this.settingsCache.getAll() as Map<SettingsKey, Setting>;
	}

	static async getSetting(key: SettingsKey): Promise<SettingValueType | null> {
		if (this.settingsCache.get(key)) {
			return this.settingsCache.get(key)!.value;
		}

		const setting = await database.setting.findUnique({
			where: {
				key: key as unknown as string,
			},
		});

		if (setting) {
			const parsed = this.parseValue(setting.value, setting.value_type);

			this.settingsCache.set(key, {
				type: setting.value_type,
				value: parsed,
				label: setting.label ?? setting.key,
			});

			return parsed;
		}

		return null;
	}

	static async setSetting(key: SettingsKey, value: string, _label?: string) {
		const label = _label ?? DEFAULT_SETTINGS[key].label ?? key;

		const valueType = this.getValueType(value);

		this.settingsCache.set(key, {
			type: valueType,
			value: this.parseValue(value, valueType),
			label,
		});

		await database.setting.upsert({
			where: {
				key: key as unknown as string,
			},
			create: {
				key: key as unknown as string,
				value_type: valueType,
				value: String(value),
				label,
			},
			update: {
				value_type: valueType,
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

	private static parseValue(value: string, type: setting_value_type) {
		switch (type) {
			case 'INTEGER':
				return parseInt(value);
			case 'BOOLEAN':
				return value === 'true';
			case 'STRING':
			default:
				return value;
		}
	}
}
