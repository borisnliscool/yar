import { PrismaClient } from '@prisma/client';

export const database = new PrismaClient({
	// eslint-disable-next-line turbo/no-undeclared-env-vars
	datasourceUrl: process.env.NODE_ENV === 'production' ? process.env.DATABASE_URL : undefined,
});

database.$connect().catch(console.error);
