import { media } from '@repo/database';
import { Media } from '@repo/types';
import Converter from '../classes/converter';
import MediaService from '../services/mediaService';

class MediaConverter implements Converter<media, Media> {
	convert(input: media): Media {
		return {
			id: input.id,
			created_at: input.created_at,
			updated_at: input.updated_at,
			mime_type: input.mime_type,
			url: MediaService.getMediaUrl(input.id),
			type: input.type,
			height: input.height ?? undefined,
			width: input.width ?? undefined,
		};
	}
}

export default new MediaConverter();
