import express from 'express';
import {
  createFolder,
  getFolders,
  updateFolder,
  deleteFolder
} from '../controllers/folderController.js';

const router = express.Router();

router.post('/', createFolder);
router.get('/', getFolders);
router.patch('/:id', updateFolder);
router.delete('/:id', deleteFolder);

export default router;
