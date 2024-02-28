declare global {
	namespace Express {
		interface Request {}

		interface Response {
			errorDetails?: object;
		}
	}

	namespace NodeJS {
		interface ProcessEnv {
			NODE_ENV?: string;
		}
	}
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

	formats: Array<YtdlpFormat>;

	thumbnails: Array<{
		url: string;
		id: string;
	}>;
};

export { YtdlpVideo };
