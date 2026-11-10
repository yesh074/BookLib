import fs from 'fs';
import path from 'path';
import Book from '../models/Book.js';
import Folder from '../models/Folder.js';
import ReadingProgress from '../models/ReadingProgress.js';
import Note from '../models/Note.js';
import Summary from '../models/Summary.js';
import Quiz from '../models/Quiz.js';
import QuizAttempt from '../models/QuizAttempt.js';
import Flashcard from '../models/Flashcard.js';
import { extractTextFromFile } from '../services/pdfService.js';

// In-Memory Fallback Storage if MongoDB is unreachable
export const inMemoryStore = {
  books: [],
  folders: [],
  progress: [],
  notes: [],
  summaries: [],
  quizzes: [],
  quizAttempts: [],
  flashcards: []
};

const isDbConnected = () => Book.db && Book.db.readyState === 1;

/**
 * Upload & Create Book
 * POST /api/books
 */
export const createBook = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No book file uploaded.' });
    }

    const { originalname, filename, path: filePath, size } = req.file;
    const ext = path.extname(originalname).toLowerCase().replace('.', '');
    const fileType = ext === 'pdf' ? 'pdf' : ext === 'md' ? 'md' : 'txt';

    // Form data fields
    const title = req.body.title || path.basename(originalname, path.extname(originalname));
    const author = req.body.author || 'Unknown Author';
    const description = req.body.description || '';
    const folderId = req.body.folder || null;
    const isTechnical = req.body.isTechnical === 'true' || req.body.isTechnical === true;
    const tags = req.body.tags ? (Array.isArray(req.body.tags) ? req.body.tags : req.body.tags.split(',').map(t => t.trim())) : [];
    const coverColor = req.body.coverColor || '#3b82f6';
    const coverIcon = req.body.coverIcon || (isTechnical ? '💻' : '📘');

    // Extract Text & Page Count
    const extractionResult = await extractTextFromFile(filePath, fileType);
    const pageCount = extractionResult.pageCount || 1;
    const extractedText = extractionResult.text || '';

    let newBook;

    if (isDbConnected()) {
      newBook = await Book.create({
        title,
        author,
        description,
        filename,
        filePath,
        fileType,
        fileSize: size,
        folder: folderId && folderId !== 'null' && folderId !== '' ? folderId : null,
        tags,
        pageCount,
        currentPage: 1,
        progress: 0,
        isTechnical,
        isFavorite: false,
        isCompleted: false,
        extractedText,
        coverColor,
        coverIcon,
        lastOpenedAt: new Date()
      });

      // Init ReadingProgress
      await ReadingProgress.create({
        book: newBook._id,
        currentPage: 1,
        totalPages: pageCount,
        percentage: 0,
        lastOpenedAt: new Date()
      });
    } else {
      const mockId = 'mem_book_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
      newBook = {
        _id: mockId,
        id: mockId,
        title,
        author,
        description,
        filename,
        filePath,
        fileType,
        fileSize: size,
        folder: folderId || null,
        tags,
        pageCount,
        currentPage: 1,
        progress: 0,
        isTechnical,
        isFavorite: false,
        isCompleted: false,
        extractedText,
        coverColor,
        coverIcon,
        lastOpenedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      inMemoryStore.books.unshift(newBook);
    }

    return res.status(201).json({
      message: 'Book uploaded and processed successfully',
      book: newBook
    });
  } catch (error) {
    console.error('[Create Book Error]:', error);
    return res.status(500).json({ error: error.message || 'Failed to upload book' });
  }
};

/**
 * Get All Books with search, filter, sort
 * GET /api/books
 */
export const getBooks = async (req, res) => {
  try {
    const { search, folder, isTechnical, isFavorite, isCompleted, sort } = req.query;

    if (isDbConnected()) {
      const filter = {};
      if (search) {
        filter.$or = [
          { title: { $regex: search, $options: 'i' } },
          { author: { $regex: search, $options: 'i' } },
          { tags: { $regex: search, $options: 'i' } }
        ];
      }
      if (folder === 'root') {
        filter.folder = null;
      } else if (folder && folder !== 'all') {
        filter.folder = folder;
      }
      if (isTechnical === 'true') filter.isTechnical = true;
      if (isFavorite === 'true') filter.isFavorite = true;
      if (isCompleted === 'true') filter.isCompleted = true;

      let query = Book.find(filter).populate('folder', 'name color icon');

      if (sort === 'title') query = query.sort({ title: 1 });
      else if (sort === 'progress') query = query.sort({ progress: -1 });
      else if (sort === 'lastOpened') query = query.sort({ lastOpenedAt: -1 });
      else query = query.sort({ createdAt: -1 });

      const books = await query.exec();
      return res.json(books);
    } else {
      let books = [...inMemoryStore.books];

      if (search) {
        const s = search.toLowerCase();
        books = books.filter(b => 
          b.title.toLowerCase().includes(s) || 
          b.author.toLowerCase().includes(s) ||
          b.tags.some(t => t.toLowerCase().includes(s))
        );
      }
      if (folder === 'root') {
        books = books.filter(b => !b.folder);
      } else if (folder && folder !== 'all') {
        books = books.filter(b => b.folder === folder || (b.folder && b.folder._id === folder));
      }
      if (isTechnical === 'true') books = books.filter(b => b.isTechnical);
      if (isFavorite === 'true') books = books.filter(b => b.isFavorite);
      if (isCompleted === 'true') books = books.filter(b => b.isCompleted);

      if (sort === 'title') books.sort((a, b) => a.title.localeCompare(b.title));
      else if (sort === 'progress') books.sort((a, b) => b.progress - a.progress);
      else if (sort === 'lastOpened') books.sort((a, b) => new Date(b.lastOpenedAt) - new Date(a.lastOpenedAt));
      else books.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      return res.json(books);
    }
  } catch (error) {
    console.error('[Get Books Error]:', error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Get Single Book by ID
 * GET /api/books/:id
 */
export const getBookById = async (req, res) => {
  try {
    const { id } = req.params;

    if (isDbConnected()) {
      const book = await Book.findById(id).populate('folder', 'name color icon');
      if (!book) return res.status(404).json({ error: 'Book not found' });
      
      // Touch last opened
      book.lastOpenedAt = new Date();
      await book.save();

      return res.json(book);
    } else {
      const book = inMemoryStore.books.find(b => b._id === id || b.id === id);
      if (!book) return res.status(404).json({ error: 'Book not found' });
      book.lastOpenedAt = new Date().toISOString();
      return res.json(book);
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Update Book Metadata
 * PATCH /api/books/:id
 */
export const updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (isDbConnected()) {
      const book = await Book.findById(id);
      if (!book) return res.status(404).json({ error: 'Book not found' });

      Object.assign(book, updates);
      if (updates.folder === 'none' || updates.folder === '') book.folder = null;
      book.updatedAt = new Date();
      await book.save();

      return res.json(book);
    } else {
      const book = inMemoryStore.books.find(b => b._id === id || b.id === id);
      if (!book) return res.status(404).json({ error: 'Book not found' });

      Object.assign(book, updates);
      if (updates.folder === 'none' || updates.folder === '') book.folder = null;
      book.updatedAt = new Date().toISOString();
      return res.json(book);
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Delete Book
 * DELETE /api/books/:id
 */
export const deleteBook = async (req, res) => {
  try {
    const { id } = req.params;

    if (isDbConnected()) {
      const book = await Book.findById(id);
      if (book) {
        // Delete physical file if exists
        if (book.filePath && fs.existsSync(book.filePath)) {
          try { fs.unlinkSync(book.filePath); } catch (e) {}
        }
        await Book.findByIdAndDelete(id);
        await ReadingProgress.deleteMany({ book: id });
        await Note.deleteMany({ book: id });
        await Summary.deleteMany({ book: id });
        await Quiz.deleteMany({ book: id });
        await QuizAttempt.deleteMany({ book: id });
        await Flashcard.deleteMany({ book: id });
      }
    } else {
      const idx = inMemoryStore.books.findIndex(b => b._id === id || b.id === id);
      if (idx !== -1) {
        const book = inMemoryStore.books[idx];
        if (book.filePath && fs.existsSync(book.filePath)) {
          try { fs.unlinkSync(book.filePath); } catch (e) {}
        }
        inMemoryStore.books.splice(idx, 1);
      }
    }

    return res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Update Reading Progress
 * PATCH /api/books/:id/progress
 */
export const updateReadingProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPage, totalPages } = req.body;

    const page = Math.max(1, parseInt(currentPage, 10) || 1);
    
    if (isDbConnected()) {
      const book = await Book.findById(id);
      if (!book) return res.status(404).json({ error: 'Book not found' });

      const total = totalPages ? Math.max(1, parseInt(totalPages, 10)) : book.pageCount;
      const progressPercent = Math.min(100, Math.round((page / total) * 100));
      const isCompleted = progressPercent >= 100 || page >= total;

      book.currentPage = page;
      book.pageCount = total;
      book.progress = progressPercent;
      book.isCompleted = isCompleted;
      book.lastOpenedAt = new Date();
      await book.save();

      // Upsert ReadingProgress record
      let progressRecord = await ReadingProgress.findOne({ book: id });
      if (!progressRecord) {
        progressRecord = new ReadingProgress({ book: id, currentPage: page, totalPages: total, percentage: progressPercent });
      } else {
        progressRecord.currentPage = page;
        progressRecord.totalPages = total;
        progressRecord.percentage = progressPercent;
        progressRecord.lastOpenedAt = new Date();
      }
      progressRecord.history.push({ page, timestamp: new Date() });
      await progressRecord.save();

      return res.json({
        bookId: id,
        currentPage: page,
        totalPages: total,
        percentage: progressPercent,
        isCompleted
      });
    } else {
      const book = inMemoryStore.books.find(b => b._id === id || b.id === id);
      if (!book) return res.status(404).json({ error: 'Book not found' });

      const total = totalPages ? Math.max(1, parseInt(totalPages, 10)) : book.pageCount;
      const progressPercent = Math.min(100, Math.round((page / total) * 100));
      const isCompleted = progressPercent >= 100 || page >= total;

      book.currentPage = page;
      book.pageCount = total;
      book.progress = progressPercent;
      book.isCompleted = isCompleted;
      book.lastOpenedAt = new Date().toISOString();

      return res.json({
        bookId: id,
        currentPage: page,
        totalPages: total,
        percentage: progressPercent,
        isCompleted
      });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
