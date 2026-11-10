import express from 'express';
import { getBookNotes, saveBookNotes } from '../controllers/noteController.js';

const router = express.Router();

router.get('/:id/notes', getBookNotes);
router.post('/:id/notes', saveBookNotes);
router.patch('/:id/notes', saveBookNotes);

export default router;
