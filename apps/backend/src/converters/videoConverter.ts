import { media, user, video } from '@repo/database';
import { Video } from '@repo/types';
import Converter from '../classes/converter';
import MediaConverter from './mediaConverter';

type db_video = video & { author: user; thumbnail: media | null; media: media };

class VideoConverter implements Converter<db_video, Video> {
	convert(input: db_video): Video {
		const video: Video = {
			id: input.id,
			created_at: input.created_at,
			updated_at: input.updated_at,
			title: input.title,
			description: input.description ?? undefined,
			author: {
				id: input.author.id,
				username: input.author.username,
				created_at: input.author.created_at,
			},
			media: MediaConverter.convert(input.media),
			tags: input.tags
				.split(',')
				.map((t) => t.trim())
				.filter(Boolean),
		};

		if (input.thumbnail) video.thumbnail = MediaConverter.convert(input.thumbnail);

		return video;
	}
}

export default new VideoConverter();
