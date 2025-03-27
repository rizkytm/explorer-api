import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

export const getFolders = async () => {
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
}

export const getSubfolders = async ({ params: { id } }) => {
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
}

export const getFolderTree = async ({ params: { id } }) => {
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
}

export const createFolder = async ({ body }) => {
	return prisma.folder.create({
		data: {
			id: uuidv4(),
			name: body.name,
			parentId: body.parentId || null,
			description: body.description || null,
		},
	});
}

export const updateFolder = async ({ params: { id }, body }) => {
	return prisma.folder.update({
		where: { id },
		data: {
			name: body.name,
			description: body.description,
		},
	});
}

export const deleteFolder = async ({ params: { id }, query: { force } }) => {
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
}