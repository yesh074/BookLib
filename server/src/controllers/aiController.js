import Book from '../models/Book.js';
import Summary from '../models/Summary.js';
import Quiz from '../models/Quiz.js';
import QuizAttempt from '../models/QuizAttempt.js';
import Flashcard from '../models/Flashcard.js';
import { inMemoryStore } from './bookController.js';
import {
  generateBookSummary,
  generateKnowledgeMap,
  generateTechnicalQuiz,
  generateFlashcards,
  askBookQuestion
} from '../services/geminiService.js';

const isDbConnected = () => Book.db && Book.db.readyState === 1;

/**
 * Fetch helper for book text
 */
const getBookData = async (id) => {
  if (isDbConnected()) {
    return await Book.findById(id);
  } else {
    return inMemoryStore.books.find(b => b._id === id || b.id === id);
  }
};

/**
 * AI Summarizer Endpoint
 * POST /api/books/:id/summarize
 */
export const summarizeBook = async (req, res) => {
  try {
    const { id } = req.params;
    const { mode = '5min', customPrompt = '' } = req.body;

    const book = await getBookData(id);
    if (!book) return res.status(404).json({ error: 'Book not found' });

    // Check cached summary only if no custom prompt is supplied
    if (!customPrompt && isDbConnected()) {
      const existing = await Summary.findOne({ book: id, mode });
      if (existing) return res.json(existing);
    }

    const summaryData = await generateBookSummary(book.extractedText, book.title, mode, customPrompt);

    if (isDbConnected() && !customPrompt) {
      const newSummary = await Summary.create({
        book: id,
        mode,
        shortSummary: summaryData.shortSummary || '',
        keyPoints: summaryData.keyPoints || [],
        importantConcepts: summaryData.importantConcepts || [],
        keyTakeaways: summaryData.keyTakeaways || [],
        revisionNotes: summaryData.revisionNotes || [],
        practicalApplications: summaryData.practicalApplications || []
      });
      return res.json(newSummary);
    } else {
      const mockSummary = {
        _id: 'mem_sum_' + Date.now(),
        book: id,
        mode,
        ...summaryData,
        createdAt: new Date().toISOString()
      };
      inMemoryStore.summaries.push(mockSummary);
      return res.json(mockSummary);
    }
  } catch (error) {
    console.error('[Summarize Error]:', error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Visual Knowledge Map Endpoint
 * POST /api/books/:id/diagram
 */
export const generateDiagram = async (req, res) => {
  try {
    const { id } = req.params;
    const { diagramType = 'concept_map' } = req.body;

    const book = await getBookData(id);
    if (!book) return res.status(404).json({ error: 'Book not found' });

    const diagramData = await generateKnowledgeMap(book.extractedText, book.title, diagramType);

    return res.json({
      bookId: id,
      diagramType,
      mermaidCode: diagramData.mermaidCode,
      description: diagramData.description || 'Visual Knowledge Map'
    });
  } catch (error) {
    console.error('[Diagram Error]:', error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Quiz Generator Endpoint
 * POST /api/books/:id/quiz
 */
export const generateQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const { numQuestions = 5, difficulty = 'medium' } = req.body;

    const book = await getBookData(id);
    if (!book) return res.status(404).json({ error: 'Book not found' });

    const quizData = await generateTechnicalQuiz(
      book.extractedText,
      book.title,
      parseInt(numQuestions, 10) || 5,
      difficulty
    );

    if (isDbConnected()) {
      const newQuiz = await Quiz.create({
        book: id,
        title: quizData.title || `${book.title} Quiz`,
        numQuestions: quizData.questions.length,
        difficulty,
        questions: quizData.questions
      });
      return res.json(newQuiz);
    } else {
      const mockQuiz = {
        _id: 'mem_quiz_' + Date.now(),
        book: id,
        title: quizData.title || `${book.title} Quiz`,
        numQuestions: quizData.questions.length,
        difficulty,
        questions: quizData.questions,
        createdAt: new Date().toISOString()
      };
      inMemoryStore.quizzes.push(mockQuiz);
      return res.json(mockQuiz);
    }
  } catch (error) {
    console.error('[Quiz Error]:', error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Submit Quiz & Evaluate
 * POST /api/books/:id/quiz/submit
 */
export const submitQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const { quizId, userAnswers } = req.body; // userAnswers: { q1: "Option A", q2: "True" }

    let quiz;
    if (isDbConnected()) {
      quiz = await Quiz.findById(quizId);
    } else {
      quiz = inMemoryStore.quizzes.find(q => q._id === quizId || q.id === quizId);
    }

    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

    let score = 0;
    const answerRecords = [];
    const topicMisses = {};

    quiz.questions.forEach(q => {
      const selected = userAnswers[q.id] || '';
      const isCorrect = selected.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
      if (isCorrect) {
        score += 1;
      } else {
        const topic = q.topic || 'General Concept';
        topicMisses[topic] = (topicMisses[topic] || 0) + 1;
      }

      answerRecords.push({
        questionId: q.id,
        selectedAnswer: selected,
        isCorrect,
        topic: q.topic || 'General'
      });
    });

    const weakTopics = Object.keys(topicMisses);
    const recommendedTopics = weakTopics.length > 0 
      ? weakTopics.map(t => `Review key definitions & examples in ${t}`)
      : ['Excellent mastery! You scored 100%. Keep up the continuous revision!'];

    if (isDbConnected()) {
      const attempt = await QuizAttempt.create({
        quiz: quizId,
        book: id,
        score,
        totalQuestions: quiz.questions.length,
        answers: answerRecords,
        weakTopics,
        recommendedTopics,
        completedAt: new Date()
      });
      return res.json({ attempt, quiz });
    } else {
      const mockAttempt = {
        _id: 'mem_att_' + Date.now(),
        quiz: quizId,
        book: id,
        score,
        totalQuestions: quiz.questions.length,
        answers: answerRecords,
        weakTopics,
        recommendedTopics,
        completedAt: new Date().toISOString()
      };
      inMemoryStore.quizAttempts.push(mockAttempt);
      return res.json({ attempt: mockAttempt, quiz });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Flashcards Endpoint
 * POST /api/books/:id/flashcards
 */
export const getFlashcards = async (req, res) => {
  try {
    const { id } = req.params;

    const book = await getBookData(id);
    if (!book) return res.status(404).json({ error: 'Book not found' });

    if (isDbConnected()) {
      const existing = await Flashcard.findOne({ book: id });
      if (existing) return res.json(existing);
    }

    const cardData = await generateFlashcards(book.extractedText, book.title);

    if (isDbConnected()) {
      const newFlashcards = await Flashcard.create({
        book: id,
        title: cardData.title || `${book.title} Flashcards`,
        cards: cardData.cards
      });
      return res.json(newFlashcards);
    } else {
      const mockCards = {
        _id: 'mem_fc_' + Date.now(),
        book: id,
        title: cardData.title || `${book.title} Flashcards`,
        cards: cardData.cards,
        createdAt: new Date().toISOString()
      };
      inMemoryStore.flashcards.push(mockCards);
      return res.json(mockCards);
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Ask this Book (RAG Chat)
 * POST /api/books/:id/chat
 */
export const chatWithBook = async (req, res) => {
  try {
    const { id } = req.params;
    const { query, history = [] } = req.body;

    if (!query || query.trim() === '') {
      return res.status(400).json({ error: 'Question query is required' });
    }

    const book = await getBookData(id);
    if (!book) return res.status(404).json({ error: 'Book not found' });

    const chatResult = await askBookQuestion(
      book.extractedText,
      book.title,
      query,
      history
    );

    return res.json({
      bookId: id,
      query,
      answer: chatResult.answer,
      foundInBook: chatResult.foundInBook
    });
  } catch (error) {
    console.error('[Chat Error]:', error);
    return res.status(500).json({ error: error.message });
  }
};
