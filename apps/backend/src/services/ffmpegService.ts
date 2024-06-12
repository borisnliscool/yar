import ffmpeg, { FfprobeData } from 'fluent-ffmpeg';

import { path as ffmpegPath } from '@ffmpeg-installer/ffmpeg';
import { path as ffprobePath } from '@ffprobe-installer/ffprobe';

import fs, { Stats } from 'fs';
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

	static async convertFile(filePath: string, outputPath: string, outputOptions: string[] = []) {
		return new Promise<Stats>((resolve, reject) => {
			ffmpeg(filePath)
				.on('end', () => {
					return resolve(fs.statSync(outputPath));
				})
				.on('error', (err) => reject(err))
				.addOutputOptions(outputOptions)
				.output(outputPath)
				.run();
		});
	}
}
