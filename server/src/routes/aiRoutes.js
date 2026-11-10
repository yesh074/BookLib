import express from 'express';
import {
  summarizeBook,
  generateDiagram,
  generateQuiz,
  submitQuiz,
  getFlashcards,
  chatWithBook
} from '../controllers/aiController.js';

const router = express.Router();

router.post('/:id/summarize', summarizeBook);
router.post('/:id/diagram', generateDiagram);
router.post('/:id/quiz', generateQuiz);
router.post('/:id/quiz/submit', submitQuiz);
router.post('/:id/flashcards', getFlashcards);
router.post('/:id/chat', chatWithBook);

export default router;
