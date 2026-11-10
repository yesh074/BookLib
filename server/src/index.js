import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js';
import bookRoutes from './routes/bookRoutes.js';
import folderRoutes from './routes/folderRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import noteRoutes from './routes/noteRoutes.js';
import authRoutes from './routes/authRoutes.js';
import Book from './models/Book.js';
import Folder from './models/Folder.js';
import { inMemoryStore } from './controllers/bookController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootEnvPath = path.resolve(__dirname, '../../.env');

dotenv.config({ path: rootEnvPath });
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Serve static uploads
const uploadsPath = path.resolve(__dirname, '../../uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static(uploadsPath));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/folders', folderRoutes);
app.use('/api/books', aiRoutes);
app.use('/api/books', noteRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    appName: 'BookMind AI – Personal Knowledge Library',
    time: new Date().toISOString(),
    dbConnected: Book.db ? Book.db.readyState === 1 : false,
    geminiKeyPresent: !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0 && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here')
  });
});

// Seed sample books for immediate out-of-the-box demo
const seedSampleData = async () => {
  const sampleBooks = [
    {
      title: 'Designing Data-Intensive Applications',
      author: 'Martin Kleppmann',
      description: 'The definitive guide to distributed system design, reliability, scalability, and data storage architectures.',
      filename: 'sample_ddia.txt',
      fileType: 'txt',
      fileSize: 1048576,
      tags: ['System Design', 'Distributed Systems', 'Databases', 'Architecture'],
      pageCount: 616,
      currentPage: 142,
      progress: 23,
      isTechnical: true,
      isFavorite: true,
      isCompleted: false,
      coverColor: '#2563eb',
      coverIcon: '💻',
      extractedText: `Designing Data-Intensive Applications: The Big Ideas Behind Reliable, Scalable, and Maintainable Systems.
Chapter 1: Reliable, Scalable, and Maintainable Applications.
Data-intensive applications are created from standard building blocks: databases, caches, search indexes, stream processing, and batch processing.
Reliability means the system should continue to work correctly even in the face of hardware faults, software bugs, or human error.
Scalability describes the system's ability to cope with increased load. Load parameters include requests per second, ratio of reads to writes, and active concurrent users.
Maintainability involves operability (making it easy for operations teams to keep the system running smoothly), simplicity (abstracting complexity so new engineers can understand the code), and evolvability (making it easy to adapt the system to changing requirements in the future).
Chapter 2: Data Models and Query Languages.
Relational vs Document model. Relational database models organize data into tables with schemas, while document models allow hierarchical nested data structures. SQL provides a declarative query language where the optimizer determines the execution plan, contrasting with imperative languages.`
    },
    {
      title: 'Atomic Habits',
      author: 'James Clear',
      description: 'An easy & proven way to build good habits & break bad ones using small 1% compound improvements.',
      filename: 'sample_atomic_habits.txt',
      fileType: 'txt',
      fileSize: 524288,
      tags: ['Psychology', 'Self Improvement', 'Productivity', 'Behavior'],
      pageCount: 320,
      currentPage: 320,
      progress: 100,
      isTechnical: false,
      isFavorite: true,
      isCompleted: true,
      coverColor: '#059669',
      coverIcon: '🌱',
      extractedText: `Atomic Habits: An Easy & Proven Way to Build Good Habits & Break Bad Ones.
The 4 Laws of Behavior Change: Make it Obvious, Make it Attractive, Make it Easy, Make it Satisfying.
Habits are the compound interest of self-improvement. Getting 1 percent better every day counts for a lot in the long run.
Focus on your system rather than your goals. You do not rise to the level of your goals; you fall to the level of your systems.
Identity-based habits: The ultimate form of intrinsic motivation is when a habit becomes part of your identity. It's one thing to say I'm the type of person who wants this. It's something very different to say I'm the type of person who IS this.`
    },
    {
      title: 'Structure and Interpretation of Computer Programs',
      author: 'Harold Abelson & Gerald Jay Sussman',
      description: 'Classic computer science text exploring abstraction, recursion, interpreter evaluation, and metacircular evaluators.',
      filename: 'sample_sicp.txt',
      fileType: 'txt',
      fileSize: 838860,
      tags: ['Computer Science', 'Lisp', 'Algorithms', 'Compilers'],
      pageCount: 657,
      currentPage: 94,
      progress: 14,
      isTechnical: true,
      isFavorite: false,
      isCompleted: false,
      coverColor: '#7c3aed',
      coverIcon: '⚙️',
      extractedText: `Structure and Interpretation of Computer Programs (SICP).
Building Abstractions with Procedures. Computational processes are abstract beings that inhabit computers. As they evolve, processes affect other computational elements.
The elements of programming: Primitive expressions, Means of combination, and Means of abstraction.
Higher-order procedures: Procedures that manipulate procedures. Linear recursion and iteration. Evaluating expressions using the substitution model.`
    }
  ];

  const sampleFolders = [
    { name: 'Computer Science', color: '#2563eb', icon: '💻', description: 'Systems, algorithms, and engineering books' },
    { name: 'Productivity & Mindset', color: '#059669', icon: '⚡', description: 'Habits, psychology, and personal growth' },
    { name: 'Research & Papers', color: '#d97706', icon: '📑', description: 'Academic papers and lecture notes' }
  ];

  try {
    const dbOk = await connectDB();
    if (dbOk) {
      const folderCount = await Folder.countDocuments();
      if (folderCount === 0) {
        const createdFolders = await Folder.insertMany(sampleFolders);
        console.log('[Seed] Sample folders created in MongoDB');
        
        const csFolder = createdFolders.find(f => f.name === 'Computer Science');
        const prodFolder = createdFolders.find(f => f.name === 'Productivity & Mindset');

        sampleBooks[0].folder = csFolder ? csFolder._id : null;
        sampleBooks[1].folder = prodFolder ? prodFolder._id : null;
        sampleBooks[2].folder = csFolder ? csFolder._id : null;

        const bookCount = await Book.countDocuments();
        if (bookCount === 0) {
          // Create physical files for sample text
          sampleBooks.forEach(b => {
            const p = path.join(uploadsPath, b.filename);
            if (!fs.existsSync(p)) {
              fs.writeFileSync(p, b.extractedText);
            }
            b.filePath = p;
          });
          await Book.insertMany(sampleBooks);
          console.log('[Seed] Sample books created in MongoDB');
        }
      }
    } else {
      // In-Memory Seed
      if (inMemoryStore.folders.length === 0) {
        const f1 = { _id: 'mem_fol_cs', id: 'mem_fol_cs', name: 'Computer Science', color: '#2563eb', icon: '💻', description: 'Systems, algorithms, and engineering books', createdAt: new Date().toISOString() };
        const f2 = { _id: 'mem_fol_prod', id: 'mem_fol_prod', name: 'Productivity & Mindset', color: '#059669', icon: '⚡', description: 'Habits, psychology, and personal growth', createdAt: new Date().toISOString() };
        inMemoryStore.folders.push(f1, f2);

        sampleBooks.forEach((b, idx) => {
          const p = path.join(uploadsPath, b.filename);
          if (!fs.existsSync(p)) fs.writeFileSync(p, b.extractedText);
          const bId = `mem_book_${idx + 1}`;
          inMemoryStore.books.push({
            _id: bId,
            id: bId,
            ...b,
            filePath: p,
            folder: idx === 1 ? f2._id : f1._id,
            lastOpenedAt: new Date().toISOString(),
            createdAt: new Date().toISOString()
          });
        });
        console.log('[Seed] Sample books and folders seeded in Memory Store');
      }
    }
  } catch (err) {
    console.error('[Seed Error]:', err.message);
  }
};

app.listen(PORT, async () => {
  console.log(`[Server] BookMind AI Backend running on http://localhost:${PORT}`);
  await seedSampleData();
});
