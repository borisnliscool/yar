import { PrismaClient } from '@prisma/client';

export const database = new PrismaClient({
	datasourceUrl: process.env.NODE_ENV === 'production' ? process.env.DATABASE_URL : undefined,
});

database.$connect().catch(console.error);
