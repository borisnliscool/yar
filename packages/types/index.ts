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
	media: Media;
	tags: string[];
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

export type { Media, MediaType, RequestError, User, Video, YtdlpFormat, YtdlpVideo };
