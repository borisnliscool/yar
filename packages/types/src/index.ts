interface RequestError {
	error: {
		type: ErrorType;
		code: number;
		message: string;
		trace?: string;
		details?: object;
	};
}

enum UserRole {
	ADMIN = 'ROLE_ADMIN',
	USER = 'ROLE_USER',
}

interface User {
	id: string;
	username: string;
	roles: UserRole[];
	created_at: Date;
}

interface Video {
	id: string;
	created_at: Date;
	updated_at: Date;
	title: string;
	description?: string;
	source_url?: string;
	author: User;
	thumbnail?: Media;
	media: Media;
	tags: string[];
}

enum JwtTokenType {
	ACCESS = 'access',
	REFRESH = 'refresh',
	MEDIA = 'media',
}

enum ErrorType {
	UNKNOWN = 'UNKNOWN',
	INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
	TOTP_REQUIRED = 'TOTP_REQUIRED',
	TOTP_INVALID = 'TOTP_INVALID',
	MEDIA_NOT_FOUND = 'MEDIA_NOT_FOUND',
	INVALID_URL = 'INVALID_URL',
	INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
	MEDIA_NOT_PROCESSING = 'MEDIA_NOT_PROCESSING',
	UNAUTHORIZED = 'UNAUTHORIZED',
	INVALID_MEDIA = 'INVALID_MEDIA',
	ACCESS_TOKEN_EXPIRED = 'ACCESS_TOKEN_EXPIRED',
	INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
	NOT_FOUND = 'NOT_FOUND',
	USERNAME_TAKEN = 'USERNAME_TAKEN',
}

enum SettingsKey {
	ENABLE_REGISTRATION = 'ENABLE_REGISTRATION',
}

type SettingValueType = string | boolean | number;

interface Setting {
	type: string;
	value: SettingValueType;
	label: string;
}

type MediaType = 'IMAGE' | 'VIDEO';

interface Media {
	id: string;
	created_at: Date;
	updated_at: Date;
	mime_type: string;
	url?: string;
	type: MediaType;
	processing: boolean;

	width?: number;
	height?: number;
	duration?: number;
}

interface YtdlpFormat {
	ext: string;
	width?: number;
	height?: number;
	format_id: string;
	format: string;
	url: string;
	aspect_ratio?: string;
	video_ext: string;
	audio_ext: string;
	filesize?: number;
}

type YtdlpVideo = Record<string, any> & {
	id: string;
	title: string;
	thumbnail: string;
	webpage_url: string;
	original_url: string;
	url: string;
	display_id: string;
	fulltitle: string;
	epoch: number;
	ext: string;
	width?: number;
	height?: number;
	filename: string;
	filesize_approx?: number;
	duration?: number;

	formats: Array<YtdlpFormat>;

	thumbnails: Array<{
		id: string;
		url: string;
	}>;
};

interface SessionDisplay {
	id: string;
	device_name: string;
	created_at: Date;
}

export { ErrorType, JwtTokenType, SettingsKey, UserRole };
export type {
	Media,
	MediaType,
	RequestError,
	SessionDisplay,
	Setting,
	SettingValueType,
	User,
	Video,
	YtdlpFormat,
	YtdlpVideo,
};
