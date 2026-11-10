import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Star, 
  Cpu, 
  Trash2, 
  BookOpen, 
  Sparkles, 
  Network, 
  Trophy, 
  Layers, 
  Edit3, 
  MessageSquare,
  CheckCircle2
} from 'lucide-react';
import type { Book, Folder } from '../types';
import { api } from '../services/api';

import { ReaderTab } from '../components/tabs/ReaderTab';
import { AISummaryTab } from '../components/tabs/AISummaryTab';
import { KnowledgeMapTab } from '../components/tabs/KnowledgeMapTab';
import { TechnicalQuizTab } from '../components/tabs/TechnicalQuizTab';
import { FlashcardsTab } from '../components/tabs/FlashcardsTab';
import { NotesTab } from '../components/tabs/NotesTab';
import { AskBookChatTab } from '../components/tabs/AskBookChatTab';

interface BookDetailPageProps {
  bookId: string;
  onBack: () => void;
  folders: Folder[];
  onBookDeleted: () => void;
  onBookUpdated: () => void;
}

export const BookDetailPage: React.FC<BookDetailPageProps> = ({
  bookId,
  onBack,
  folders,
  onBookDeleted,
  onBookUpdated
}) => {
  const [book, setBook] = useState<Book | null>(null);
  const [activeTab, setActiveTab] = useState<'reader' | 'summary' | 'diagram' | 'quiz' | 'flashcards' | 'notes' | 'chat'>('reader');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBook = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getBookById(bookId);
      setBook(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load book details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBook();
  }, [bookId]);

  const handleToggleFavorite = async () => {
    if (!book) return;
    const newFav = !book.isFavorite;
    setBook({ ...book, isFavorite: newFav });
    try {
      await api.updateBook(book._id, { isFavorite: newFav });
      onBookUpdated();
    } catch (e) {
      setBook({ ...book, isFavorite: !newFav });
    }
  };

  const handleToggleTechnical = async () => {
    if (!book) return;
    const newTech = !book.isTechnical;
    setBook({ ...book, isTechnical: newTech });
    try {
      await api.updateBook(book._id, { isTechnical: newTech });
      onBookUpdated();
    } catch (e) {
      setBook({ ...book, isTechnical: !newTech });
    }
  };

  const handleDeleteBook = async () => {
    if (!book) return;
    if (window.confirm(`Are you sure you want to delete "${book.title}" from your library?`)) {
      try {
        await api.deleteBook(book._id);
        onBookDeleted();
        onBack();
      } catch (e) {
        alert('Failed to delete book');
      }
    }
  };

  const handleProgressUpdate = (currentPage: number, totalPages: number) => {
    if (!book) return;
    const progress = Math.min(100, Math.round((currentPage / totalPages) * 100));
    setBook({
      ...book,
      currentPage,
      pageCount: totalPages,
      progress,
      isCompleted: progress >= 100
    });
    onBookUpdated();
  };

  if (loading) {
    return (
      <div className="notion-card p-12 text-center space-y-3">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-stone-500">Loading book workspace...</p>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="notion-card p-8 text-center space-y-3 bg-red-50 text-red-700">
        <p className="font-semibold">{error || 'Book not found'}</p>
        <button onClick={onBack} className="px-4 py-1.5 bg-red-600 text-white text-xs rounded font-medium">
          Back to Library
        </button>
      </div>
    );
  }

  const folderObj = typeof book.folder === 'object' && book.folder ? book.folder : folders.find(f => f._id === book.folder);

  const tabs = [
    { id: 'reader', label: '📖 Reader', icon: BookOpen },
    { id: 'summary', label: '⚡ AI Summary', icon: Sparkles },
    { id: 'diagram', label: '🧠 Knowledge Map', icon: Network },
    { id: 'quiz', label: '🎯 Quiz', icon: Trophy, badge: book.isTechnical ? 'Tech' : undefined },
    { id: 'flashcards', label: '🎴 Flashcards', icon: Layers },
    { id: 'notes', label: '📝 Notes', icon: Edit3 },
    { id: 'chat', label: '💬 Ask this Book', icon: MessageSquare },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Top Header Card */}
      <div className="notion-card p-5 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          {/* Back button & Title Info */}
          <div className="flex items-start gap-3.5">
            <button
              onClick={onBack}
              className="p-1.5 rounded-md hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 hover:text-stone-900 transition-colors mt-0.5"
              title="Back to library"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl shrink-0 shadow-xs" style={{ backgroundColor: `${book.coverColor || '#2563eb'}20` }}>
              {book.coverIcon || '📘'}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100">
                  {book.title}
                </h1>
                {folderObj && (
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
                    {folderObj.icon || '📁'} {folderObj.name}
                  </span>
                )}
              </div>

              <p className="text-xs text-stone-500 dark:text-stone-400">
                By {book.author} • Format: {book.fileType.toUpperCase()}
              </p>

              {/* Tags */}
              {book.tags && book.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {book.tags.map(t => (
                    <span key={t} className="text-[10px] px-1.5 py-0.2 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 font-mono">
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleFavorite}
              className={`p-2 rounded-md border text-xs font-medium flex items-center gap-1.5 transition-colors ${
                book.isFavorite
                  ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 text-amber-600'
                  : 'bg-stone-100 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300'
              }`}
              title={book.isFavorite ? 'Unfavorite' : 'Favorite'}
            >
              <Star className={`w-4 h-4 ${book.isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
              <span className="hidden sm:inline">{book.isFavorite ? 'Favorite' : 'Add Favorite'}</span>
            </button>

            <button
              onClick={handleToggleTechnical}
              className={`p-2 rounded-md border text-xs font-medium flex items-center gap-1.5 transition-colors ${
                book.isTechnical
                  ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-300 text-indigo-600'
                  : 'bg-stone-100 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300'
              }`}
              title="Toggle Technical Book"
            >
              <Cpu className="w-4 h-4 text-indigo-500" />
              <span className="hidden sm:inline">{book.isTechnical ? 'Technical' : 'Mark Tech'}</span>
            </button>

            <button
              onClick={handleDeleteBook}
              className="p-2 rounded-md bg-stone-100 dark:bg-stone-800 hover:bg-red-100 dark:hover:bg-red-950/50 hover:text-red-600 text-stone-500 transition-colors"
              title="Delete Book"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Reading Progress Header Widget */}
        <div className="pt-3 border-t border-stone-200 dark:border-stone-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-stone-700 dark:text-stone-300">
              Page {book.currentPage} / {book.pageCount}
            </span>
            <span className="text-stone-400">•</span>
            <span className="font-bold text-indigo-600 dark:text-indigo-400">
              {book.progress}% Complete
            </span>
            {book.isCompleted && (
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 text-[10px] font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Completed
              </span>
            )}
          </div>

          <div className="w-full sm:w-64 h-2 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                book.progress >= 100 ? 'bg-emerald-500' : 'bg-indigo-600'
              }`}
              style={{ width: `${Math.min(100, book.progress)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Workspace Feature Tab Bar */}
      <div className="notion-card p-1.5 flex items-center gap-1.5 overflow-x-auto text-xs font-medium bg-stone-100/90 dark:bg-stone-900/90 border border-stone-200 dark:border-stone-800 rounded-xl shadow-inner backdrop-blur-xl">
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all duration-200 whitespace-nowrap active:scale-95 ${
                isActive
                  ? 'bg-white dark:bg-stone-800 text-indigo-600 dark:text-indigo-400 shadow-md ring-1 ring-stone-200 dark:ring-stone-700 scale-[1.02]'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-white/60 dark:hover:bg-stone-800/60'
              }`}
            >
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="text-[9px] px-1.5 py-0.5 bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded-full font-mono font-bold">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content Display */}
      <div>
        {activeTab === 'reader' && (
          <ReaderTab book={book} onProgressUpdate={handleProgressUpdate} />
        )}
        {activeTab === 'summary' && (
          <AISummaryTab book={book} />
        )}
        {activeTab === 'diagram' && (
          <KnowledgeMapTab book={book} />
        )}
        {activeTab === 'quiz' && (
          <TechnicalQuizTab book={book} />
        )}
        {activeTab === 'flashcards' && (
          <FlashcardsTab book={book} />
        )}
        {activeTab === 'notes' && (
          <NotesTab book={book} />
        )}
        {activeTab === 'chat' && (
          <AskBookChatTab book={book} />
        )}
      </div>
    </div>
  );
};
