import React, { useEffect, useState } from 'react';
import { Search, BookOpen, Folder as FolderIcon, X, ArrowRight } from 'lucide-react';
import type { Book, Folder } from '../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  books: Book[];
  folders: Folder[];
  onSelectBook: (bookId: string) => void;
  onSelectFolder: (folderId: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  books,
  folders,
  onSelectBook,
  onSelectFolder
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          setQuery('');
        }
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();
  const matchingBooks = books.filter(
    b => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q) || b.tags.some(t => t.toLowerCase().includes(q))
  );
  const matchingFolders = folders.filter(f => f.name.toLowerCase().includes(q));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-notion-card dark:bg-notion-darkCard notion-border border rounded-xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col">
        {/* Search Input Bar */}
        <div className="p-3 border-b border-notion-border dark:border-notion-darkBorder flex items-center gap-3">
          <Search className="w-5 h-5 text-stone-400 ml-1" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Type a book title, author, tag, or folder..."
            className="w-full bg-transparent text-stone-900 dark:text-stone-100 text-sm focus:outline-none placeholder-stone-400"
          />
          <button onClick={onClose} className="p-1 text-stone-400 hover:text-stone-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Box */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-3 text-xs">
          {matchingFolders.length > 0 && (
            <div>
              <div className="px-2 py-1 font-semibold text-[10px] text-stone-400 uppercase tracking-wider">
                Folders ({matchingFolders.length})
              </div>
              <div className="space-y-0.5">
                {matchingFolders.map(folder => (
                  <button
                    key={folder._id}
                    onClick={() => {
                      onSelectFolder(folder._id);
                      onClose();
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-md hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2">
                      <span>{folder.icon || '📁'}</span>
                      <span className="font-medium text-stone-800 dark:text-stone-200">{folder.name}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-stone-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {matchingBooks.length > 0 && (
            <div>
              <div className="px-2 py-1 font-semibold text-[10px] text-stone-400 uppercase tracking-wider">
                Books ({matchingBooks.length})
              </div>
              <div className="space-y-0.5">
                {matchingBooks.map(book => (
                  <button
                    key={book._id}
                    onClick={() => {
                      onSelectBook(book._id);
                      onClose();
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-md hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="text-base">{book.coverIcon || '📘'}</span>
                      <div className="truncate">
                        <p className="font-medium text-stone-800 dark:text-stone-200 truncate">{book.title}</p>
                        <p className="text-[11px] text-stone-400 truncate">{book.author} • {book.progress}% Complete</p>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-stone-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {matchingBooks.length === 0 && matchingFolders.length === 0 && (
            <div className="py-8 text-center text-stone-400">
              <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No books or folders matching "{query}"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
