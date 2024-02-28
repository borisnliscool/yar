interface RequestError {
	error: {
		code: number;
		message: string;
		stack?: string;
		details?: object;
	};
}

interface User {
	id: string;
	username: string;
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
}

type MediaType = 'IMAGE' | 'VIDEO';

interface Media {
	id: string;
	created_at: Date;
	updated_at: Date;
	mime_type: string;
	url?: string;
	type: MediaType;

	width?: number;
	height?: number;
	duration?: number;
}

export type { Media, MediaType, RequestError, User, Video };
