import { YtdlpVideo } from '@repo/types';
import { existsSync } from 'fs';
import path from 'path';
import YTDlpWrap from 'yt-dlp-wrap';
import FileService from './fileService';

export default class VideoDownloadService {
	static ytdlp = new YTDlpWrap();
	static ready = false;

	static {
		(async () => {
			const executablePath = path.join(FileService.getDirectoryPath('utils'), 'yt-dlp.exe');
			if (!existsSync(executablePath)) await YTDlpWrap.downloadFromGithub(executablePath);

			this.ytdlp.setBinaryPath(executablePath);
			this.ready = true;
		})();
	}

	static async getVideoInformation(url: string): Promise<YtdlpVideo> {
		if (!this.ready) throw Error('ytdlp service was not ready');

		const data: YtdlpVideo = await this.ytdlp.getVideoInfo([url]);
		if (!data) throw Error('failed to fetch video info');

		return {
			id: data.id,
			title: data.title,
			thumbnail: data.thumbnail,
			webpage_url: data.webpage_url,
			original_url: data.original_url,
			url: data.url,
			display_id: data.display_id,
			fulltitle: data.fulltitle,
			epoch: data.epoch,
			ext: data.ext,
			width: data.width,
			height: data.height,
			filename: data.filename,
			filesize_approx: data.filesize_approx,
			duration: data.duration,

			formats: data.formats.map((format) => ({
				ext: format.ext,
				width: format.width,
				height: format.height,
				format_id: format.format_id,
				format: format.format,
				url: format.url,
				aspect_ratio: format.aspect_ratio,
				video_ext: format.video_ext,
				audio_ext: format.audio_ext,
				filesize: format.filesize,
			})),

			thumbnails: data.thumbnails.map((thumbnail) => ({
				id: thumbnail.id,
				url: thumbnail.url,
			})),
		};
	}

	static async download(url: string) {
		if (!this.ready) throw Error('ytdlp service was not ready');
		return this.ytdlp.execStream(['-f', 'best', url]);
	}

	static async thumbnail(url: string) {
		const response = await fetch(url);
		if (!response.ok) throw Error('failed to perform request');
		return Buffer.from(await response.arrayBuffer());
	}
}
