import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Bookmark, Sun, Moon, BookOpen, Layers } from 'lucide-react';
import type { Book } from '../../types';
import { api } from '../../services/api';

interface ReaderTabProps {
  book: Book;
  onProgressUpdate: (currentPage: number, totalPages: number) => void;
}

export const ReaderTab: React.FC<ReaderTabProps> = ({ book, onProgressUpdate }) => {
  const [currentPage, setCurrentPage] = useState<number>(book.currentPage || 1);
  const [totalPages, setTotalPages] = useState<number>(book.pageCount || 1);
  const [fontSize, setFontSize] = useState<number>(15);
  const [readerTheme, setReaderTheme] = useState<'default' | 'parchment' | 'sepia' | 'dark'>('parchment');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setCurrentPage(book.currentPage || 1);
    setTotalPages(book.pageCount || 1);
  }, [book]);

  const handlePageChange = async (newPage: number) => {
    const validPage = Math.max(1, Math.min(totalPages, newPage));
    setCurrentPage(validPage);
    setSaving(true);
    try {
      await api.updateReadingProgress(book._id, validPage, totalPages);
      onProgressUpdate(validPage, totalPages);
    } catch (e) {
      console.error('Failed to save progress', e);
    } finally {
      setSaving(false);
    }
  };

  const isPdf = book.fileType === 'pdf';
  const fileUrl = book.filePath ? `/uploads/${book.filename}` : '';
  const fullText = book.extractedText || 'No text extracted for this book.';

  // Reading theme styles
  const themeStyles = {
    default: 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 border-stone-200 dark:border-stone-800',
    parchment: 'bg-[#fbf7ee] text-[#2b261f] border-[#e8dfcf] dark:bg-[#1a1714] dark:text-[#e8dfcf] dark:border-[#2e2822]',
    sepia: 'bg-[#f4ecd8] text-[#3e3427] border-[#e2d6b5] dark:bg-[#1f1b14] dark:text-[#e2d6b5] dark:border-[#382f22]',
    dark: 'bg-[#0f172a] text-[#f1f5f9] border-[#1e293b]'
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Top Reader Control Toolbar */}
      <div className="notion-card p-3 flex flex-wrap items-center justify-between gap-3 text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm">
        {/* Left: Page Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="p-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 disabled:opacity-40 font-semibold"
            title="Previous Page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1.5 font-mono">
            <span className="font-semibold text-stone-700 dark:text-stone-300">Page</span>
            <input
              type="number"
              min={1}
              max={totalPages}
              value={currentPage}
              onChange={e => handlePageChange(parseInt(e.target.value, 10) || 1)}
              className="w-12 px-1.5 py-0.5 text-center bg-stone-100 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg font-bold text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <span className="text-stone-500 font-semibold">/ {totalPages}</span>
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="p-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 disabled:opacity-40 font-semibold"
            title="Next Page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Center: Reading Progress Indicator */}
        <div className="flex items-center gap-2 font-mono">
          <span className="font-bold text-indigo-600 dark:text-indigo-400">
            {Math.round((currentPage / Math.max(1, totalPages)) * 100)}% Complete
          </span>
          {saving && <span className="text-[10px] text-indigo-500 font-medium animate-pulse">(Saving position...)</span>}
        </div>

        {/* Right: Controls (Font size & Theme Presets) */}
        {!isPdf && (
          <div className="flex items-center gap-2">
            {/* Theme Presets Switcher */}
            <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 p-1 rounded-lg border border-stone-200 dark:border-stone-700">
              {(['parchment', 'sepia', 'dark', 'default'] as const).map(th => (
                <button
                  key={th}
                  onClick={() => setReaderTheme(th)}
                  className={`px-2 py-0.5 text-[10px] font-bold capitalize rounded transition-colors ${
                    readerTheme === th
                      ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-2xs'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
                  }`}
                >
                  {th}
                </button>
              ))}
            </div>

            {/* Font Size Selector */}
            <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 p-1 rounded-lg border border-stone-200 dark:border-stone-700">
              <button
                onClick={() => setFontSize(prev => Math.max(12, prev - 1))}
                className="px-1.5 py-0.5 font-bold hover:bg-stone-200 dark:hover:bg-stone-700 rounded"
              >
                A-
              </button>
              <span className="font-mono text-[10px] font-bold px-1">{fontSize}px</span>
              <button
                onClick={() => setFontSize(prev => Math.min(24, prev + 1))}
                className="px-1.5 py-0.5 font-bold hover:bg-stone-200 dark:hover:bg-stone-700 rounded"
              >
                A+
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Document Display */}
      {isPdf ? (
        <div className="notion-card overflow-hidden h-[78vh] flex flex-col bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xl rounded-2xl">
          <iframe
            src={`${fileUrl}#page=${currentPage}`}
            title={book.title}
            className="w-full h-full border-none"
          />
        </div>
      ) : (
        <div className={`notion-card p-6 sm:p-10 min-h-[65vh] rounded-2xl shadow-xl border transition-all duration-300 space-y-5 ${themeStyles[readerTheme]}`}>
          <div className="pb-4 mb-4 border-b border-stone-300/60 dark:border-stone-700/60 flex items-center justify-between text-xs font-mono">
            <span className="font-semibold flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-indigo-500" />
              {book.title}
            </span>
            <span className="opacity-70">File: {book.filename}</span>
          </div>

          <div
            style={{ fontSize: `${fontSize}px`, lineHeight: 1.8 }}
            className="space-y-4 whitespace-pre-wrap font-sans max-w-4xl mx-auto"
          >
            {fullText}
          </div>
        </div>
      )}
    </div>
  );
};
