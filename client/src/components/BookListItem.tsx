import React from 'react';
import { Star, Cpu, ChevronRight } from 'lucide-react';
import type { Book } from '../types';

interface BookListItemProps {
  book: Book;
  onOpenBook: (bookId: string) => void;
  onToggleFavorite: (e: React.MouseEvent, book: Book) => void;
}

export const BookListItem: React.FC<BookListItemProps> = ({
  book,
  onOpenBook,
  onToggleFavorite
}) => {
  const folderName = typeof book.folder === 'object' && book.folder ? book.folder.name : null;

  return (
    <div
      onClick={() => onOpenBook(book._id)}
      className="notion-card group cursor-pointer p-3 flex items-center justify-between hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors"
    >
      <div className="flex items-center gap-3.5 min-w-0">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-xl shrink-0 shadow-xs"
          style={{ backgroundColor: `${book.coverColor || '#2563eb'}20` }}
        >
          {book.coverIcon || '📘'}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-xs sm:text-sm text-stone-900 dark:text-stone-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 truncate">
              {book.title}
            </h3>
            {book.isTechnical && (
              <span className="text-[10px] px-1.5 py-0.2 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-300 rounded font-semibold shrink-0">
                Tech
              </span>
            )}
          </div>
          <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate">
            {book.author} {folderName ? `• 📁 ${folderName}` : ''}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 shrink-0">
        <div className="hidden sm:flex flex-col items-end text-right text-[11px] font-mono">
          <span className="text-stone-600 dark:text-stone-300">Pg {book.currentPage} / {book.pageCount}</span>
          <span className="text-stone-400">{book.progress}% complete</span>
        </div>

        <button
          onClick={(e) => onToggleFavorite(e, book)}
          className="p-1 rounded text-stone-400 hover:text-amber-500 transition-colors"
        >
          <Star className={`w-4 h-4 ${book.isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
        </button>

        <ChevronRight className="w-4 h-4 text-stone-400 group-hover:translate-x-0.5 transition-transform" />
      </div>
    </div>
  );
};
