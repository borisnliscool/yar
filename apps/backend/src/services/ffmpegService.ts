import ffmpeg, { FfprobeData } from 'fluent-ffmpeg';

import { path as ffmpegPath } from '@ffmpeg-installer/ffmpeg';
import { path as ffprobePath } from '@ffprobe-installer/ffprobe';
import { promisify } from 'util';

export default class FFmpegService {
	static ready = false;

	static {
		(async () => {
			ffmpeg.setFfmpegPath(ffmpegPath);
			ffmpeg.setFfprobePath(ffprobePath);
			this.ready = true;
		})();
	}

	static async probe(filePath: string, throwError?: boolean): Promise<FfprobeData | undefined> {
		try {
			return (await promisify(ffmpeg.ffprobe)(filePath)) as Promise<FfprobeData>;
		} catch (err) {
			if (throwError ?? true) throw err;
			return undefined;
		}
	}
}
