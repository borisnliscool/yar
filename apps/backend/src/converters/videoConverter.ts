import { media, user, video } from '@repo/database';
import { Video } from '@repo/types';
import Converter from '../classes/converter';
import MediaService from '../services/mediaService';

type db_video = video & { author: user; thumbnail: media | null };

class VideoConverter implements Converter<db_video, Video> {
	convert(input: db_video): Video {
		const video: Video = {
			id: input.id,
			created_at: input.created_at,
			updated_at: input.updated_at,
			title: input.title,
			author: {
				id: input.author.id,
				username: input.author.username,
				created_at: input.author.created_at,
			},
		};

		if (input.thumbnail) {
			video.thumbnail = {
				id: input.thumbnail.id,
				created_at: input.thumbnail.created_at,
				updated_at: input.thumbnail.updated_at,
				mime_type: input.thumbnail.mime_type,
				url: MediaService.getMediaUrl(input.thumbnail.id),
				type: input.thumbnail.type,
				height: input.thumbnail.height ?? undefined,
				width: input.thumbnail.width ?? undefined,
			};
		}

		return video;
	}
}

export default new VideoConverter();
