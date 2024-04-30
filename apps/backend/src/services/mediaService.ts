import { media } from '@repo/database';
import FileService from './fileService';
import JwtService from './jwtService';

export default class MediaService {
	static getMediaUrl(mediaId: string): string {
		const token = JwtService.encodeToken(
			{
				mediaId,
			},
			'media'
		);

		return `${process.env.DOMAIN}/api/media/${mediaId}?token=${token}`;
	}

	static deleteMediaFile(media: media) {
		return FileService.deleteFile('media', media.id + '.' + media.extension);
	}
}
