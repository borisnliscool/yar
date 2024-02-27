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

interface Media {
	id: string;
	created_at: Date;
	updated_at: Date;
	mime_type: string;
	url?: string;
}

export type { Media, RequestError, User, Video };
