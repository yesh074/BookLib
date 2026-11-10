import React, { useState, useRef } from 'react';
import { Star, Cpu, BookOpen, RotateCw, Sparkles, MessageSquare, ArrowRight } from 'lucide-react';
import type { Book } from '../types';

interface BookCardProps {
  book: Book;
  onOpenBook: (bookId: string) => void;
  onToggleFavorite: (e: React.MouseEvent, book: Book) => void;
}

export const BookCard: React.FC<BookCardProps> = ({
  book,
  onOpenBook,
  onToggleFavorite
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, glareX: 50, glareY: 50, isHovered: false });

  const folderName = typeof book.folder === 'object' && book.folder ? book.folder.name : null;
  const color = book.coverColor || '#2563eb';

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || isFlipped) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Max 12 deg tilt
    const rx = ((y - centerY) / centerY) * -12;
    const ry = ((x - centerX) / centerX) * 12;

    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;

    setTilt({ rx, ry, glareX, glareY, isHovered: true });
  };

  const handleMouseLeave = () => {
    setTilt({ rx: 0, ry: 0, glareX: 50, glareY: 50, isHovered: false });
  };

  const handleFlip = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFlipped(!isFlipped);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="perspective-1000 relative select-none"
      style={{ minHeight: '280px' }}
    >
      {/* 3D Flippable Container */}
      <div
        className={`w-full h-full transform-style-3d transition-transform duration-500 ease-out cursor-pointer ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
        style={{
          transform: !isFlipped && tilt.isHovered
            ? `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) translateZ(12px)`
            : isFlipped
            ? 'rotateY(180deg)'
            : 'rotateX(0deg) rotateY(0deg) translateZ(0px)',
        }}
      >
        {/* ================= FRONT SIDE (3D HARDCOVER BOOK) ================= */}
        <div
          onClick={() => onOpenBook(book._id)}
          className="book-cover-3d backface-hidden w-full h-full bg-white/95 dark:bg-stone-900/95 notion-border rounded-xl flex flex-col justify-between overflow-visible relative group"
        >
          {/* Realistic Spine Crease on Left */}
          <div className="book-spine-crease z-20" />

          {/* 3D Paper Page Edge Effect on Right & Bottom */}
          <div className="book-pages-edge z-0" />
          <div className="book-pages-bottom z-0" />

          {/* Top Banner / Cover Canvas */}
          <div
            className="h-32 relative p-4 flex items-end justify-between rounded-t-xl overflow-hidden pl-7"
            style={{
              background: `linear-gradient(135deg, ${color}ee 0%, ${color}aa 100%)`,
            }}
          >
            {/* Action Buttons Top Right: Flip & Favorite */}
            <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-30">
              <button
                onClick={handleFlip}
                className="p-1.5 rounded-full bg-black/25 hover:bg-black/50 text-white backdrop-blur-xs transition-colors"
                title="Flip to back cover (Summary & Details)"
              >
                <RotateCw className="w-3.5 h-3.5 transition-transform group-hover:rotate-45" />
              </button>

              <button
                onClick={(e) => onToggleFavorite(e, book)}
                className="p-1.5 rounded-full bg-black/25 hover:bg-black/50 text-white backdrop-blur-xs transition-colors"
                title={book.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Star className={`w-3.5 h-3.5 ${book.isFavorite ? 'fill-amber-300 text-amber-300' : 'text-white'}`} />
              </button>
            </div>

            {/* 3D Floating Book Icon */}
            <div
              className="w-13 h-13 rounded-xl bg-white/95 dark:bg-stone-900/95 shadow-lg flex items-center justify-center text-3xl backdrop-blur-xs border border-white/30 dark:border-white/10 transition-transform duration-300 group-hover:scale-108 group-hover:-translate-y-1"
            >
              {book.coverIcon || '📘'}
            </div>

            {/* Technical Badge */}
            {book.isTechnical && (
              <span className="text-[10px] font-semibold px-2 py-0.5 bg-black/40 text-white rounded-full flex items-center gap-1 backdrop-blur-xs">
                <Cpu className="w-3 h-3 text-indigo-300" />
                <span>Tech</span>
              </span>
            )}

            {/* Dynamic Glare Reflection following mouse */}
            {tilt.isHovered && (
              <div
                className="absolute inset-0 pointer-events-none opacity-25"
                style={{
                  background: `radial-gradient(circle at ${tilt.glareX}% ${tilt.glareY}%, rgba(255,255,255,0.8) 0%, transparent 60%)`,
                }}
              />
            )}
          </div>

          {/* Book Metadata & Progress */}
          <div className="p-4 pl-6 flex-1 flex flex-col justify-between space-y-3 bg-white/90 dark:bg-stone-900/90 rounded-b-xl">
            <div>
              <h3 className="font-semibold text-sm text-stone-900 dark:text-stone-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 line-clamp-1 transition-colors">
                {book.title}
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-1 mt-0.5">
                {book.author}
              </p>

              {/* Folder & Tags */}
              <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                {folderName && (
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
                    📁 {folderName}
                  </span>
                )}
                {book.tags && book.tags.slice(0, 2).map(tag => (
                  <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 font-mono">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Reading Progress Footer */}
            <div className="pt-2 border-t border-stone-100 dark:border-stone-800 space-y-1.5">
              <div className="flex justify-between items-center text-[11px] text-stone-500 font-mono">
                <span>Page {book.currentPage} / {book.pageCount}</span>
                <span className="font-semibold text-stone-700 dark:text-stone-300">{book.progress}%</span>
              </div>
              <div className="w-full h-1.5 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    book.progress >= 100 ? 'bg-emerald-500' : 'bg-indigo-600 dark:bg-indigo-500'
                  }`}
                  style={{ width: `${Math.min(100, book.progress)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ================= BACK SIDE (3D BACK COVER & QUICK ACTIONS) ================= */}
        <div
          className="book-cover-3d backface-hidden rotate-y-180 absolute inset-0 w-full h-full bg-stone-900 text-white rounded-xl p-4 flex flex-col justify-between overflow-hidden shadow-2xl border border-stone-700"
          style={{
            background: `linear-gradient(150deg, #1c1917 0%, ${color}40 100%)`,
          }}
        >
          {/* Top: Flip Back Button & Header */}
          <div className="flex items-center justify-between border-b border-stone-700/60 pb-2">
            <span className="text-xs font-semibold text-stone-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Back Cover & Insights</span>
            </span>

            <button
              onClick={handleFlip}
              className="p-1 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors"
              title="Flip to front cover"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Middle: AI Summary Preview or Description */}
          <div className="my-auto space-y-2">
            <p className="text-xs text-stone-300 line-clamp-4 leading-relaxed italic">
              {book.summary ? book.summary.slice(0, 180) + '...' : 'Open this book to generate automated AI chapter summaries, mindmaps, technical quizzes, and flashcards.'}
            </p>

            <div className="pt-1 flex flex-wrap gap-1">
              <span className="text-[10px] px-2 py-0.5 rounded bg-stone-800 text-stone-300">
                📄 {book.pageCount} pages
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-stone-800 text-stone-300">
                ⏱️ ~{Math.round(book.pageCount * 1.5)}m read
              </span>
            </div>
          </div>

          {/* Bottom: Quick Action Open */}
          <button
            onClick={() => onOpenBook(book._id)}
            className="w-full py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-md transition-colors"
          >
            <span>Open Book Workspace</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
