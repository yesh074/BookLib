import express from 'express';
import { upload } from '../middleware/uploadMiddleware.js';
import {
  createBook,
  getBooks,
  getBookById,
  updateBook,
  deleteBook,
  updateReadingProgress
} from '../controllers/bookController.js';

const router = express.Router();

router.post('/', upload.single('file'), createBook);
router.get('/', getBooks);
router.get('/:id', getBookById);
router.patch('/:id', updateBook);
router.delete('/:id', deleteBook);
router.patch('/:id/progress', updateReadingProgress);

export default router;
