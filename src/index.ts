import { Elysia, t } from 'elysia';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { swagger } from '@elysiajs/swagger';
import { cors } from '@elysiajs/cors';

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

  // TODO: move to services
  // Folder Routes
  .group('/folders', (app) =>
    app
      // Get all root folders
      .get('/', async () => {
        return prisma.folder.findMany({
          where: { parentId: null },
          select: {
            id: true,
            name: true,
            description: true,
            _count: {
              select: { subfolders: true },
            },
          },
        });
      })

      // Get folder by ID with direct subfolders
      .get('/:id/subfolders', async ({ params: { id } }) => {
        return prisma.folder.findMany({
          where: { parentId: id },
          select: {
            id: true,
            name: true,
            description: true,
            _count: {
              select: { subfolders: true },
            },
          },
        });
      })

      // Get full folder tree (recursive)
      .get('/:id/tree', async ({ params: { id } }) => {
        async function getFolderTree(folderId: string) {
          const folder = await prisma.folder.findUnique({
            where: { id: folderId },
            include: {
              subfolders: {
                include: {
                  subfolders: true,
                },
              },
            },
          });

          return folder;
        }

        return getFolderTree(id);
      })

      // Create new folder
      .post(
        '/',
        async ({ body }) => {
          return prisma.folder.create({
            data: {
              id: uuidv4(),
              name: body.name,
              parentId: body.parentId || null,
              description: body.description || null,
            },
          });
        },
        {
          body: t.Object({
            name: t.String({ minLength: 1, maxLength: 255 }),
            parentId: t.Optional(t.String()),
            description: t.Optional(t.String()),
          }),
        }
      )

      // Update folder
      .patch(
        '/:id',
        async ({ params: { id }, body }) => {
          return prisma.folder.update({
            where: { id },
            data: {
              name: body.name,
              description: body.description,
            },
          });
        },
        {
          body: t.Object({
            name: t.Optional(t.String({ minLength: 1, maxLength: 255 })),
            description: t.Optional(t.String()),
          }),
        }
      )

      // Delete folder (with option to force delete or cascade)
      .delete('/:id', async ({ params: { id }, query: { force } }) => {
        if (force === 'true') {
          // Recursive deletion of all subfolders
          async function deleteWithSubfolders(folderId: string) {
            const subfolders = await prisma.folder.findMany({
              where: { parentId: folderId },
            });

            for (const subfolder of subfolders) {
              await deleteWithSubfolders(subfolder.id);
            }

            await prisma.folder.delete({
              where: { id: folderId },
            });
          }

          await deleteWithSubfolders(id);
          return { message: 'Folder and all subfolders deleted' };
        } else {
          // Only delete if no subfolders
          const subfolderCount = await prisma.folder.count({
            where: { parentId: id },
          });

          if (subfolderCount > 0) {
            throw new Error('Folder has subfolders. Use force=true to delete.');
          }

          await prisma.folder.delete({
            where: { id },
          });

          return { message: 'Folder deleted' };
        }
      })
  )

  // Server health check
  .get('/health', () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
  }))

  // Start the server
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);

export const server = app;
