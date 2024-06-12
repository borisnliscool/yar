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

	static async generateThumbnail(filePath: string, outputPath: string) {
		return new Promise<void>((resolve, reject) => {
			ffmpeg(filePath)
				.on('end', () => resolve())
				.on('error', (err) => reject(err))
				.addOutputOptions(['-ss 00:00:01.000', '-vf scale=720:-1', '-frames:v 1'])
				.output(outputPath)
				.run();
		});
	}
}
