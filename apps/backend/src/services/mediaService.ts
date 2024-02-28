import JwtService from './jwtService';

export default class MediaService {
	static getMediaUrl(mediaId: string): string {
		const token = JwtService.encodeToken({
			media: mediaId,
		});

		return `http://localhost:3000/media/${mediaId}?token=${token}`;
	}
}
