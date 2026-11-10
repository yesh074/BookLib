export interface Folder {
  _id: string;
  name: string;
  parent?: string | null;
  color?: string;
  icon?: string;
  description?: string;
  bookCount?: number;
  createdAt?: string;
}

export interface Book {
  _id: string;
  id?: string;
  title: string;
  author: string;
  description: string;
  filename: string;
  filePath: string;
  fileType: 'pdf' | 'txt' | 'md';
  fileSize: number;
  folder?: Folder | string | null;
  tags: string[];
  pageCount: number;
  currentPage: number;
  progress: number;
  isTechnical: boolean;
  isFavorite: boolean;
  isCompleted: boolean;
  coverColor?: string;
  coverIcon?: string;
  extractedText?: string;
  createdAt: string;
  updatedAt: string;
  lastOpenedAt: string;
}

export interface Summary {
  _id?: string;
  book: string;
  mode: '5min' | 'detailed' | 'revision';
  shortSummary: string;
  keyPoints: string[];
  importantConcepts: Array<{ term: string; definition: string }>;
  keyTakeaways: string[];
  revisionNotes: string[];
  practicalApplications: string[];
  createdAt?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: 'mcq' | 'tf' | 'scenario';
  options: string[];
  correctAnswer: string;
  explanation: string;
  topic?: string;
}

export interface Quiz {
  _id?: string;
  book: string;
  title: string;
  numQuestions: number;
  difficulty: 'easy' | 'medium' | 'hard';
  questions: QuizQuestion[];
  createdAt?: string;
}

export interface QuizAttempt {
  _id?: string;
  quiz: string;
  book: string;
  score: number;
  totalQuestions: number;
  answers: Array<{
    questionId: string;
    selectedAnswer: string;
    isCorrect: boolean;
    topic?: string;
  }>;
  weakTopics: string[];
  recommendedTopics: string[];
  completedAt?: string;
}

export interface FlashcardItem {
  id: string;
  front: string;
  back: string;
  category?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface FlashcardDeck {
  _id?: string;
  book: string;
  title: string;
  cards: FlashcardItem[];
  createdAt?: string;
}

export interface Note {
  _id?: string;
  book: string;
  title: string;
  content: string;
  tags?: string[];
  updatedAt?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  foundInBook?: boolean;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  streakDays?: number;
  totalReadingMinutes?: number;
  token?: string;
}
