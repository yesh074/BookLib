import React, { useState } from 'react';
import { 
  BookOpen, 
  Clock, 
  Cpu, 
  CheckCircle2, 
  Star, 
  ArrowRight, 
  TrendingUp, 
  Sparkles, 
  Library,
  Bookmark,
  Layers,
  LayoutGrid
} from 'lucide-react';
import type { Book, Folder } from '../types';
import { BookCard } from '../components/BookCard';
import { ThreeDBookshelf } from '../components/ThreeDBookshelf';

interface DashboardPageProps {
  books: Book[];
  folders: Folder[];
  onOpenBook: (bookId: string) => void;
  onSelectNav: (view: string) => void;
  onToggleFavorite: (e: React.MouseEvent, book: Book) => void;
  onOpenUpload: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  books,
  folders,
  onOpenBook,
  onSelectNav,
  onToggleFavorite,
  onOpenUpload
}) => {
  const [viewMode, setViewMode] = useState<'shelf' | 'grid'>('shelf');

  const totalBooks = books.length;
  const completedBooks = books.filter(b => b.isCompleted || b.progress >= 100);
  const technicalBooks = books.filter(b => b.isTechnical);
  const favoriteBooks = books.filter(b => b.isFavorite);

  // Continue reading book (most recently opened, in progress)
  const continueReadingBook = [...books]
    .filter(b => b.progress > 0 && b.progress < 100)
    .sort((a, b) => new Date(b.lastOpenedAt).getTime() - new Date(a.lastOpenedAt).getTime())[0] || books[0];

  // Recently added
  const recentlyAdded = [...books].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 6);

  // Overall average reading progress
  const avgProgress = totalBooks > 0
    ? Math.round(books.reduce((acc, b) => acc + (b.progress || 0), 0) / totalBooks)
    : 0;

  return (
    <div className="space-y-8 animate-fade-in relative z-10">
      {/* 3D Glassmorphic Metric Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div
          onClick={() => onSelectNav('all')}
          className="notion-card p-4 cursor-pointer hover:bg-stone-50/90 dark:hover:bg-stone-800/80 transition-all duration-200 flex items-center justify-between group hover:-translate-y-1 hover:shadow-md"
        >
          <div>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 font-mono">Total Books</p>
            <p className="text-2xl font-bold font-mono text-stone-900 dark:text-stone-100">{totalBooks}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-xs transition-transform duration-200 group-hover:scale-110">
            <Library className="w-5 h-5" />
          </div>
        </div>

        <div
          onClick={() => onSelectNav('technical')}
          className="notion-card p-4 cursor-pointer hover:bg-stone-50/90 dark:hover:bg-stone-800/80 transition-all duration-200 flex items-center justify-between group hover:-translate-y-1 hover:shadow-md"
        >
          <div>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 font-mono">Technical Books</p>
            <p className="text-2xl font-bold font-mono text-stone-900 dark:text-stone-100">{technicalBooks.length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-xs transition-transform duration-200 group-hover:scale-110">
            <Cpu className="w-5 h-5" />
          </div>
        </div>

        <div
          onClick={() => onSelectNav('completed')}
          className="notion-card p-4 cursor-pointer hover:bg-stone-50/90 dark:hover:bg-stone-800/80 transition-all duration-200 flex items-center justify-between group hover:-translate-y-1 hover:shadow-md"
        >
          <div>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 font-mono">Completed</p>
            <p className="text-2xl font-bold font-mono text-stone-900 dark:text-stone-100">{completedBooks.length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs transition-transform duration-200 group-hover:scale-110">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="notion-card p-4 flex items-center justify-between hover:-translate-y-1 hover:shadow-md transition-all duration-200">
          <div>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 font-mono">Avg Progress</p>
            <p className="text-2xl font-bold font-mono text-stone-900 dark:text-stone-100">{avgProgress}%</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-xs">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Hero "Continue Reading" 3D Book Showcase */}
      {continueReadingBook ? (
        <div
          className="notion-card p-6 md:p-8 bg-gradient-to-r from-stone-950 via-stone-900 to-indigo-950 text-white rounded-2xl relative overflow-hidden shadow-2xl border border-indigo-900/30 group"
          style={{ perspective: '1000px' }}
        >
          {/* Ambient Sheen in Hero */}
          <div
            className="absolute -right-20 -top-20 w-80 h-80 rounded-full blur-[100px] pointer-events-none opacity-30"
            style={{ backgroundColor: continueReadingBook.coverColor || '#6366f1' }}
          />

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
            {/* 3D Physical Book Feature */}
            <div className="flex items-center gap-5">
              <div
                className="w-20 h-26 rounded-md shadow-2xl relative flex flex-col justify-between p-2 shrink-0 border border-white/20 transform transition-transform duration-300 group-hover:-rotate-3 group-hover:scale-105"
                style={{
                  background: `linear-gradient(135deg, ${continueReadingBook.coverColor || '#3b82f6'} 0%, ${continueReadingBook.coverColor || '#3b82f6'}bb 100%)`,
                  boxShadow: `0 15px 30px -5px ${continueReadingBook.coverColor || '#3b82f6'}88, inset 4px 0 6px -1px rgba(0,0,0,0.4)`
                }}
              >
                {/* Book Spine Crease */}
                <div className="absolute left-2.5 top-0 bottom-0 w-[1.5px] bg-black/30" />
                {/* Ribbon Bookmark */}
                <div className="absolute top-0 right-3 w-2.5 h-7 bg-amber-400 rounded-b-xs shadow-xs" />

                <span className="text-2xl drop-shadow-md pl-2 pt-1">
                  {continueReadingBook.coverIcon || '📘'}
                </span>
                <span className="text-[9px] font-mono pl-2 text-white/90 truncate font-semibold">
                  p. {continueReadingBook.currentPage}
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/20 text-white font-mono uppercase tracking-wider backdrop-blur-xs">
                    Continue Reading
                  </span>
                  {continueReadingBook.isTechnical && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/40 text-indigo-200 border border-indigo-400/30">
                      Technical Book
                    </span>
                  )}
                </div>

                <h2 className="text-xl sm:text-2xl font-bold text-white line-clamp-1 text-embossed">
                  {continueReadingBook.title}
                </h2>
                <p className="text-xs text-stone-300">
                  By {continueReadingBook.author}
                </p>
              </div>
            </div>

            {/* Reading Stats & Action */}
            <div className="w-full md:w-auto flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-full sm:w-52 space-y-1.5 bg-black/30 p-3 rounded-xl border border-white/10 backdrop-blur-xs">
                <div className="flex justify-between text-xs font-mono text-stone-300">
                  <span>Page {continueReadingBook.currentPage} / {continueReadingBook.pageCount}</span>
                  <span className="font-bold text-indigo-300">{continueReadingBook.progress}%</span>
                </div>
                <div className="w-full h-2 bg-stone-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-300 shadow-sm"
                    style={{ width: `${Math.min(100, continueReadingBook.progress)}%` }}
                  />
                </div>
              </div>

              <button
                onClick={() => onOpenBook(continueReadingBook._id)}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white hover:bg-stone-100 text-stone-900 font-semibold text-xs flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>Resume Reading</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="notion-card p-10 text-center space-y-3">
          <BookOpen className="w-12 h-12 mx-auto text-stone-400 animate-pulse" />
          <h3 className="font-semibold text-base">Your 3D Knowledge Library is Ready</h3>
          <p className="text-xs text-stone-400 max-w-sm mx-auto">Upload PDF, Markdown, or TXT books to start organizing, chatting, and testing your retention with AI.</p>
          <button
            onClick={onOpenUpload}
            className="px-5 py-2.5 bg-stone-900 dark:bg-white text-white dark:text-stone-900 rounded-lg text-xs font-semibold shadow-md transition-transform hover:-translate-y-0.5"
          >
            Upload Your First Book
          </button>
        </div>
      )}

      {/* Bookshelf / Grid Showcase Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-stone-500" />
            <h3 className="font-semibold text-sm text-stone-900 dark:text-stone-100">
              Library Showcase
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {/* View Switcher: 3D Bookshelf vs 3D Cards */}
            <div className="flex items-center bg-stone-100 dark:bg-stone-800 p-0.5 rounded-lg border border-stone-200 dark:border-stone-700 text-xs">
              <button
                onClick={() => setViewMode('shelf')}
                className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 font-medium transition-all ${
                  viewMode === 'shelf'
                    ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-xs font-semibold'
                    : 'text-stone-500 hover:text-stone-900 dark:hover:text-white'
                }`}
                title="3D Physical Bookshelf View"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>3D Shelf</span>
              </button>

              <button
                onClick={() => setViewMode('grid')}
                className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 font-medium transition-all ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-xs font-semibold'
                    : 'text-stone-500 hover:text-stone-900 dark:hover:text-white'
                }`}
                title="3D Tilt Cards View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>3D Cards</span>
              </button>
            </div>

            <button
              onClick={() => onSelectNav('all')}
              className="text-xs text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 font-medium flex items-center gap-1 ml-2"
            >
              <span>View All ({totalBooks})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Content based on view mode */}
        {viewMode === 'shelf' ? (
          <ThreeDBookshelf
            books={recentlyAdded}
            onOpenBook={onOpenBook}
            onToggleFavorite={onToggleFavorite}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {recentlyAdded.map(book => (
              <BookCard
                key={book._id}
                book={book}
                onOpenBook={onOpenBook}
                onToggleFavorite={onToggleFavorite}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
