import Folder from '../models/Folder.js';
import Book from '../models/Book.js';
import { inMemoryStore } from './bookController.js';

const isDbConnected = () => Folder.db && Folder.db.readyState === 1;

/**
 * Create Folder
 * POST /api/folders
 */
export const createFolder = async (req, res) => {
  try {
    const { name, parent, color, icon, description } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Folder name is required' });
    }

    if (isDbConnected()) {
      const folder = await Folder.create({
        name: name.trim(),
        parent: parent && parent !== 'null' && parent !== '' ? parent : null,
        color: color || '#3b82f6',
        icon: icon || '📁',
        description: description || ''
      });
      return res.status(201).json(folder);
    } else {
      const mockId = 'mem_fol_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
      const folder = {
        _id: mockId,
        id: mockId,
        name: name.trim(),
        parent: parent || null,
        color: color || '#3b82f6',
        icon: icon || '📁',
        description: description || '',
        createdAt: new Date().toISOString()
      };
      inMemoryStore.folders.push(folder);
      return res.status(201).json(folder);
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Get All Folders with subfolders & book counts
 * GET /api/folders
 */
export const getFolders = async (req, res) => {
  try {
    if (isDbConnected()) {
      const folders = await Folder.find().lean();
      const books = await Book.find({}, 'folder').lean();

      // Attach book counts to folders
      const foldersWithCounts = folders.map(f => {
        const bookCount = books.filter(b => b.folder && b.folder.toString() === f._id.toString()).length;
        return { ...f, bookCount };
      });

      return res.json(foldersWithCounts);
    } else {
      const folders = inMemoryStore.folders.map(f => {
        const bookCount = inMemoryStore.books.filter(b => b.folder === f._id || (b.folder && b.folder._id === f._id)).length;
        return { ...f, bookCount };
      });
      return res.json(folders);
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Update Folder
 * PATCH /api/folders/:id
 */
export const updateFolder = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (isDbConnected()) {
      const folder = await Folder.findByIdAndUpdate(id, updates, { new: true });
      if (!folder) return res.status(404).json({ error: 'Folder not found' });
      return res.json(folder);
    } else {
      const folder = inMemoryStore.folders.find(f => f._id === id || f.id === id);
      if (!folder) return res.status(404).json({ error: 'Folder not found' });
      Object.assign(folder, updates);
      return res.json(folder);
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Delete Folder
 * DELETE /api/folders/:id
 */
export const deleteFolder = async (req, res) => {
  try {
    const { id } = req.params;

    if (isDbConnected()) {
      await Folder.findByIdAndDelete(id);
      // Unlink books in this folder to root
      await Book.updateMany({ folder: id }, { folder: null });
      // Move subfolders to root
      await Folder.updateMany({ parent: id }, { parent: null });
    } else {
      const idx = inMemoryStore.folders.findIndex(f => f._id === id || f.id === id);
      if (idx !== -1) inMemoryStore.folders.splice(idx, 1);
      inMemoryStore.books.forEach(b => {
        if (b.folder === id) b.folder = null;
      });
      inMemoryStore.folders.forEach(f => {
        if (f.parent === id) f.parent = null;
      });
    }

    return res.json({ message: 'Folder deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
