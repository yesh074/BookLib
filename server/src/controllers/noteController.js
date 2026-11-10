import Note from '../models/Note.js';
import Book from '../models/Book.js';
import { inMemoryStore } from './bookController.js';

const isDbConnected = () => Note.db && Note.db.readyState === 1;

export const getBookNotes = async (req, res) => {
  try {
    const { id } = req.params;

    if (isDbConnected()) {
      let note = await Note.findOne({ book: id });
      if (!note) {
        const book = await Book.findById(id);
        note = await Note.create({
          book: id,
          title: `${book ? book.title : 'Book'} Notes`,
          content: `# Reading Notes for ${book ? book.title : 'Book'}\n\n- Key Concept 1:\n- Questions:\n- Summary Thoughts:\n`
        });
      }
      return res.json(note);
    } else {
      let note = inMemoryStore.notes.find(n => n.book === id);
      if (!note) {
        const book = inMemoryStore.books.find(b => b._id === id || b.id === id);
        note = {
          _id: 'mem_note_' + Date.now(),
          book: id,
          title: `${book ? book.title : 'Book'} Notes`,
          content: `# Reading Notes for ${book ? book.title : 'Book'}\n\n- Key Concept 1:\n- Questions:\n- Summary Thoughts:\n`,
          updatedAt: new Date().toISOString()
        };
        inMemoryStore.notes.push(note);
      }
      return res.json(note);
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const saveBookNotes = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;

    if (isDbConnected()) {
      let note = await Note.findOne({ book: id });
      if (!note) {
        note = new Note({ book: id, title, content });
      } else {
        if (title !== undefined) note.title = title;
        if (content !== undefined) note.content = content;
      }
      await note.save();
      return res.json(note);
    } else {
      let note = inMemoryStore.notes.find(n => n.book === id);
      if (!note) {
        note = {
          _id: 'mem_note_' + Date.now(),
          book: id,
          title: title || 'Book Notes',
          content: content || '',
          updatedAt: new Date().toISOString()
        };
        inMemoryStore.notes.push(note);
      } else {
        if (title !== undefined) note.title = title;
        if (content !== undefined) note.content = content;
        note.updatedAt = new Date().toISOString();
      }
      return res.json(note);
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
