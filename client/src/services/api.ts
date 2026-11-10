import type { Book, Folder, Summary, Quiz, QuizAttempt, FlashcardDeck, Note, User } from '../types';

const API_BASE = '/api';

const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('bookmind_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const api = {
  // Authentication
  async login(email: string, password: string): Promise<User> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Login failed');
    }
    return res.json();
  },

  async register(name: string, email: string, password: string, avatar?: string): Promise<User> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, avatar }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Registration failed');
    }
    return res.json();
  },

  async demoLogin(): Promise<User> {
    const res = await fetch(`${API_BASE}/auth/demo`, {
      method: 'POST',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Demo login failed');
    }
    return res.json();
  },

  async getMe(): Promise<User> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Not authenticated');
    return res.json();
  },

  // Health
  async getHealth() {
    const res = await fetch(`${API_BASE}/health`);
    return res.json();
  },

  // Books
  async getBooks(params?: {
    search?: string;
    folder?: string;
    isTechnical?: boolean;
    isFavorite?: boolean;
    isCompleted?: boolean;
    sort?: string;
  }): Promise<Book[]> {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.folder) query.append('folder', params.folder);
    if (params?.isTechnical !== undefined) query.append('isTechnical', String(params.isTechnical));
    if (params?.isFavorite !== undefined) query.append('isFavorite', String(params.isFavorite));
    if (params?.isCompleted !== undefined) query.append('isCompleted', String(params.isCompleted));
    if (params?.sort) query.append('sort', params.sort);

    const res = await fetch(`${API_BASE}/books?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch books');
    return res.json();
  },

  async getBookById(id: string): Promise<Book> {
    const res = await fetch(`${API_BASE}/books/${id}`);
    if (!res.ok) throw new Error('Failed to fetch book');
    return res.json();
  },

  async uploadBook(formData: FormData): Promise<{ message: string; book: Book }> {
    const res = await fetch(`${API_BASE}/books`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || 'Failed to upload book');
    }
    return res.json();
  },

  async updateBook(id: string, updates: Partial<Book>): Promise<Book> {
    const res = await fetch(`${API_BASE}/books/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update book');
    return res.json();
  },

  async deleteBook(id: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/books/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete book');
    return res.json();
  },

  async updateReadingProgress(id: string, currentPage: number, totalPages?: number) {
    const res = await fetch(`${API_BASE}/books/${id}/progress`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPage, totalPages }),
    });
    if (!res.ok) throw new Error('Failed to update progress');
    return res.json();
  },

  // Folders
  async getFolders(): Promise<Folder[]> {
    const res = await fetch(`${API_BASE}/folders`);
    if (!res.ok) throw new Error('Failed to fetch folders');
    return res.json();
  },

  async createFolder(data: { name: string; parent?: string | null; color?: string; icon?: string; description?: string }): Promise<Folder> {
    const res = await fetch(`${API_BASE}/folders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create folder');
    return res.json();
  },

  async updateFolder(id: string, updates: Partial<Folder>): Promise<Folder> {
    const res = await fetch(`${API_BASE}/folders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update folder');
    return res.json();
  },

  async deleteFolder(id: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/folders/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete folder');
    return res.json();
  },

  // AI Features
  async summarizeBook(id: string, mode: '5min' | 'detailed' | 'revision' = '5min', customPrompt: string = ''): Promise<Summary> {
    const res = await fetch(`${API_BASE}/books/${id}/summarize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode, customPrompt }),
    });
    if (!res.ok) throw new Error('Failed to generate AI summary');
    return res.json();
  },

  async generateDiagram(id: string, diagramType: string = 'concept_map'): Promise<{ mermaidCode: string; description: string }> {
    const res = await fetch(`${API_BASE}/books/${id}/diagram`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ diagramType }),
    });
    if (!res.ok) throw new Error('Failed to generate diagram');
    return res.json();
  },

  async generateQuiz(id: string, numQuestions: number = 5, difficulty: string = 'medium'): Promise<Quiz> {
    const res = await fetch(`${API_BASE}/books/${id}/quiz`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ numQuestions, difficulty }),
    });
    if (!res.ok) throw new Error('Failed to generate quiz');
    return res.json();
  },

  async submitQuiz(id: string, quizId: string, userAnswers: Record<string, string>): Promise<{ attempt: QuizAttempt; quiz: Quiz }> {
    const res = await fetch(`${API_BASE}/books/${id}/quiz/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quizId, userAnswers }),
    });
    if (!res.ok) throw new Error('Failed to submit quiz');
    return res.json();
  },

  async getFlashcards(id: string): Promise<FlashcardDeck> {
    const res = await fetch(`${API_BASE}/books/${id}/flashcards`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to fetch flashcards');
    return res.json();
  },

  async chatWithBook(id: string, query: string, history: Array<{ sender: string; text: string }> = []): Promise<{ answer: string; foundInBook: boolean }> {
    const res = await fetch(`${API_BASE}/books/${id}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, history }),
    });
    if (!res.ok) throw new Error('Failed to chat with book');
    return res.json();
  },

  // Notes
  async getBookNotes(id: string): Promise<Note> {
    const res = await fetch(`${API_BASE}/books/${id}/notes`);
    if (!res.ok) throw new Error('Failed to fetch notes');
    return res.json();
  },

  async saveBookNotes(id: string, data: { title?: string; content?: string }): Promise<Note> {
    const res = await fetch(`${API_BASE}/books/${id}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to save notes');
    return res.json();
  }
};
