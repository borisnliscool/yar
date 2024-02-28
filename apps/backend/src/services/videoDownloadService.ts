import { existsSync } from 'fs';
import path from 'path';
import YTDlpWrap from 'yt-dlp-wrap';
import { YtdlpVideo } from '../types';
import FileService from './fileService';

export default class VideoDownloadService {
	static #executableName = 'yt-dlp.exe';

	static ytDlpPath = path.join(FileService.getDirectoryPath('utils'), this.#executableName);
	static ytDlpWrap = new YTDlpWrap();
	static ready = false;

	static {
		(async () => {
			if (!existsSync(this.ytDlpPath)) await YTDlpWrap.downloadFromGithub(this.ytDlpPath);
			this.ytDlpWrap.setBinaryPath(this.ytDlpPath);
			this.ready = true;
		})();
	}

	static async getUrlInformation(url: string): Promise<YtdlpVideo> {
		if (!this.ready) throw Error('ytdlp service was not ready');

		const data: YtdlpVideo = await this.ytDlpWrap.getVideoInfo([url]);
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
			})),

			thumbnails: data.thumbnails.map((thumbnail) => ({
				id: thumbnail.id,
				url: thumbnail.url,
			})),
		};
	}
}
