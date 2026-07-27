import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    seed: 'node_modules/.bin/ts-node.CMD prisma/seed.ts',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});
