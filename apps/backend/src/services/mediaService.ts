import JwtService from './jwtService';

export default class MediaService {
	static getMediaUrl(mediaId: string): string {
		const token = JwtService.encodeToken(
			{
				mediaId,
			},
			'media'
		);

		return `http://localhost:3000/media/${mediaId}?token=${token}`; // todo hosted url here
	}
}
