import { existsSync } from 'fs';
import path from 'path';
import YTDlpWrap from 'yt-dlp-wrap';
import { YtdlpVideo } from '../types';
import FileService from './fileService';

export default class YtdlpService {
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

		const data = await this.ytDlpWrap.getVideoInfo([url]);
		if (!data) throw Error('failed to fetch video info');

		return data as YtdlpVideo;
	}
}
