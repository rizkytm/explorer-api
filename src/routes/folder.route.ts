import { Elysia, t } from 'elysia';
import { 
  getFolders, 
  getSubfolders, 
  getFolderTree, 
  createFolder, 
  updateFolder, 
  deleteFolder 
} from '../controllers/folder.controller'; // Adjust path as needed

export const folderRoutes = new Elysia({ prefix: '/folders' })
  // Get all root folders
  .get('/', getFolders)

  // Get folder by ID with direct subfolders
  .get('/:id/subfolders', getSubfolders)

  // Get full folder tree (recursive)
  .get('/:id/tree', getFolderTree)

  // Create new folder
  .post(
    '/',
    createFolder,
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
    updateFolder,
    {
      body: t.Object({
        name: t.Optional(t.String({ minLength: 1, maxLength: 255 })),
        description: t.Optional(t.String()),
      }),
    }
  )

  // Delete folder (with option to force delete or cascade)
  .delete('/:id', deleteFolder);