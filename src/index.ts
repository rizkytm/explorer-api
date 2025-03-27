import { Elysia, t } from 'elysia';
import { PrismaClient } from '@prisma/client';
import { swagger } from '@elysiajs/swagger';
import { cors } from '@elysiajs/cors';
import { folderRoutes } from './routes/folder.route';

// Prisma Client for database interactions
const prisma = new PrismaClient();

const app = new Elysia()
  .use(cors())
  .use(swagger())
  // Global error handling
  .onError(({ code, error }) => {
    console.error(error);
    return {
      code,
      message: 'Error occured',
    };
  })

  // Folder Routes
  .use(folderRoutes)

  // Start the server
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);

export const server = app;
