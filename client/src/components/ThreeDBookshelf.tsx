import React, { useState } from 'react';
import { BookOpen, Star, Sparkles, Cpu, CheckCircle2, Bookmark, ArrowRight } from 'lucide-react';
import type { Book } from '../types';

interface ThreeDBookshelfProps {
  books: Book[];
  onOpenBook: (bookId: string) => void;
  onToggleFavorite: (e: React.MouseEvent, book: Book) => void;
}

export const ThreeDBookshelf: React.FC<ThreeDBookshelfProps> = ({
  books,
  onOpenBook,
  onToggleFavorite,
}) => {
  const [hoveredBookId, setHoveredBookId] = useState<string | null>(null);

  // Group books into shelves of up to 6 books per shelf
  const BOOKS_PER_SHELF = 6;
  const shelves: Book[][] = [];
  for (let i = 0; i < books.length; i += BOOKS_PER_SHELF) {
    shelves.push(books.slice(i, i + BOOKS_PER_SHELF));
  }

  if (books.length === 0) {
    return (
      <div className="py-16 text-center space-y-3 notion-card">
        <BookOpen className="w-10 h-10 mx-auto text-stone-400 animate-bounce" />
        <p className="text-sm font-medium text-stone-600 dark:text-stone-300">No books to display on the 3D shelf yet.</p>
        <p className="text-xs text-stone-400">Upload books to populate your 3D personal knowledge library.</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 py-4">
      {shelves.map((shelfBooks, shelfIndex) => (
        <div key={shelfIndex} className="bookshelf-3d-shelf relative px-2 sm:px-6">
          {/* Books Row standing on the shelf */}
          <div className="flex items-end justify-center sm:justify-start gap-3 sm:gap-6 min-h-[260px] pb-1 px-4 overflow-x-auto overflow-y-visible">
            {shelfBooks.map((book, idx) => {
              const isHovered = hoveredBookId === book._id;
              const color = book.coverColor || '#3b82f6';

              // Alternate book height slightly for realistic shelf variety
              const heightVariants = ['h-[220px]', 'h-[235px]', 'h-[210px]', 'h-[240px]', 'h-[225px]'];
              const heightClass = heightVariants[idx % heightVariants.length];

              return (
                <div
                  key={book._id}
                  onMouseEnter={() => setHoveredBookId(book._id)}
                  onMouseLeave={() => setHoveredBookId(null)}
                  onClick={() => onOpenBook(book._id)}
                  className={`standing-book group cursor-pointer relative shrink-0 w-[140px] sm:w-[155px] ${heightClass}`}
                  style={{
                    perspective: '1000px',
                    zIndex: isHovered ? 40 : 10,
                  }}
                >
                  {/* Physical 3D Book Body */}
                  <div
                    className={`w-full h-full rounded-l-md rounded-r-lg relative flex flex-col justify-between p-3.5 text-white transition-all duration-300 shadow-xl overflow-hidden ${
                      isHovered ? 'ring-2 ring-indigo-400/80 ring-offset-2 dark:ring-offset-stone-900' : ''
                    }`}
                    style={{
                      background: `linear-gradient(135deg, ${color}f5 0%, ${color}c0 50%, ${color}e0 100%)`,
                      boxShadow: isHovered
                        ? `0 24px 38px -8px ${color}80, -6px 6px 16px rgba(0,0,0,0.3)`
                        : `0 12px 20px -4px rgba(0,0,0,0.25), -3px 3px 8px rgba(0,0,0,0.2)`,
                      transformStyle: 'preserve-3d',
                    }}
                  >
                    {/* Realistic Hardcover Spine Crease & Texture */}
                    <div className="book-spine-crease" />

                    {/* Book Paper Block Edge on Right */}
                    <div className="book-pages-edge" />

                    {/* Top Section: Icon & Badges */}
                    <div className="flex items-start justify-between relative z-10 pl-2">
                      <span className="text-2xl drop-shadow-md p-1 bg-white/20 dark:bg-black/20 rounded-md backdrop-blur-xs">
                        {book.coverIcon || '📘'}
                      </span>

                      <button
                        onClick={(e) => onToggleFavorite(e, book)}
                        className="p-1 rounded-full bg-black/25 hover:bg-black/40 text-white backdrop-blur-xs transition-colors"
                        title={book.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                      >
                        <Star className={`w-3.5 h-3.5 ${book.isFavorite ? 'fill-amber-300 text-amber-300' : 'text-white/80'}`} />
                      </button>
                    </div>

                    {/* Center: Book Title & Author */}
                    <div className="relative z-10 pl-2 space-y-1 my-auto">
                      <h4 className="font-bold text-xs sm:text-sm leading-snug line-clamp-2 drop-shadow-sm text-white">
                        {book.title}
                      </h4>
                      <p className="text-[11px] text-white/80 line-clamp-1 font-sans">
                        {book.author}
                      </p>

                      {book.isTechnical && (
                        <span className="inline-flex items-center gap-1 text-[9px] font-semibold px-1.5 py-0.5 rounded bg-black/30 text-indigo-100 backdrop-blur-xs">
                          <Cpu className="w-2.5 h-2.5 text-indigo-300" />
                          <span>Tech</span>
                        </span>
                      )}
                    </div>

                    {/* Bottom: Progress Bar & Ribbon */}
                    <div className="relative z-10 pl-2 pt-2 border-t border-white/20 space-y-1">
                      <div className="flex justify-between items-center text-[10px] font-mono text-white/90">
                        <span>p. {book.currentPage}/{book.pageCount}</span>
                        <span className="font-bold">{book.progress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-black/30 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-white transition-all duration-300"
                          style={{ width: `${Math.min(100, book.progress)}%` }}
                        />
                      </div>
                    </div>

                    {/* Subtle Sheen Gradient Sweep */}
                    <div
                      className="absolute inset-0 pointer-events-none opacity-20"
                      style={{
                        background: 'linear-gradient(105deg, transparent 20%, rgba(255,255,255,0.7) 45%, transparent 60%)',
                      }}
                    />
                  </div>

                  {/* 3D Drop Shadow on Shelf */}
                  <div
                    className="absolute -bottom-2 left-2 right-2 h-3 rounded-full blur-xs transition-opacity duration-300"
                    style={{
                      background: 'rgba(0, 0, 0, 0.45)',
                      opacity: isHovered ? 0.7 : 0.4,
                      transform: isHovered ? 'scale(1.15) translateY(4px)' : 'scale(1)',
                    }}
                  />
                </div>
              );
            })}
          </div>

          {/* 3D Realistic Wooden/Polished Shelf Plank */}
          <div className="shelf-plank relative z-20 w-full" />
          {/* Depth Shadow underneath the shelf */}
          <div className="shelf-shadow w-full" />
        </div>
      ))}
    </div>
  );
};
