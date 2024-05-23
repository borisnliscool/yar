import type { user } from '@prisma/client';
import { User, UserRole } from '@repo/types';
import Converter from '../classes/converter';

class UserConverter implements Converter<user, User> {
	convert(input: user): User {
		return {
			id: input.id,
			username: input.username,
			roles: input.roles.split(',') as UserRole[],
			created_at: input.created_at,
		};
	}
}

export default new UserConverter();
