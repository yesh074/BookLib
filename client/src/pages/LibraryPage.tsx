import React, { useState } from 'react';
import { LayoutGrid, List, Search, Filter, SortAsc, BookOpen, Folder as FolderIcon, Plus, Layers } from 'lucide-react';
import type { Book, Folder } from '../types';
import { BookCard } from '../components/BookCard';
import { BookListItem } from '../components/BookListItem';
import { ThreeDBookshelf } from '../components/ThreeDBookshelf';

interface LibraryPageProps {
  books: Book[];
  folders: Folder[];
  currentFolderId: string | null;
  onOpenBook: (bookId: string) => void;
  onToggleFavorite: (e: React.MouseEvent, book: Book) => void;
  onOpenUpload: () => void;
  onOpenNewFolder: () => void;
  viewTitle?: string;
}

export const LibraryPage: React.FC<LibraryPageProps> = ({
  books,
  folders,
  currentFolderId,
  onOpenBook,
  onToggleFavorite,
  onOpenUpload,
  onOpenNewFolder,
  viewTitle = 'Library'
}) => {
  const [viewMode, setViewMode] = useState<'shelf' | 'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'createdAt' | 'title' | 'progress' | 'lastOpened'>('createdAt');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Extract all unique tags
  const allTags = Array.from(new Set(books.flatMap(b => b.tags || [])));

  // Filter books
  let filteredBooks = books.filter(b => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q) || (b.tags && b.tags.some(t => t.toLowerCase().includes(q)));
    const matchesTag = !selectedTag || (b.tags && b.tags.includes(selectedTag));
    return matchesSearch && matchesTag;
  });

  // Sort books
  filteredBooks.sort((a, b) => {
    if (sortBy === 'title') return a.title.localeCompare(b.title);
    if (sortBy === 'progress') return b.progress - a.progress;
    if (sortBy === 'lastOpened') return new Date(b.lastOpenedAt).getTime() - new Date(a.lastOpenedAt).getTime();
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const currentFolder = folders.find(f => f._id === currentFolderId);

  return (
    <div className="space-y-6 animate-fade-in relative z-10">
      {/* Folder Header Banner if inside folder */}
      {currentFolder && (
        <div className="notion-card p-5 bg-stone-100/80 dark:bg-stone-850/80 flex items-center justify-between border-l-4 border-l-indigo-500">
          <div className="flex items-center gap-3">
            <span className="text-3xl p-2 bg-white/70 dark:bg-stone-800 rounded-xl shadow-xs">
              {currentFolder.icon || '📁'}
            </span>
            <div>
              <h2 className="font-bold text-lg text-stone-900 dark:text-stone-100">{currentFolder.name}</h2>
              {currentFolder.description && (
                <p className="text-xs text-stone-500 mt-0.5">{currentFolder.description}</p>
              )}
            </div>
          </div>
          <span className="text-xs font-mono text-stone-500 bg-white/70 dark:bg-stone-800 px-3 py-1 rounded-full border border-stone-200 dark:border-stone-700">
            {filteredBooks.length} {filteredBooks.length === 1 ? 'Book' : 'Books'}
          </span>
        </div>
      )}

      {/* Filter & View Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Left: Search Bar & Tag Filter */}
        <div className="flex flex-wrap items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by title, author, tag..."
              className="w-full pl-8 pr-3 py-2 rounded-lg bg-white/80 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-2xs backdrop-blur-xs"
            />
          </div>

          {selectedTag && (
            <button
              onClick={() => setSelectedTag(null)}
              className="px-2.5 py-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-mono text-[11px] flex items-center gap-1 shadow-2xs"
            >
              <span>#{selectedTag}</span>
              <span>×</span>
            </button>
          )}
        </div>

        {/* Right: Sort & 3D Shelf / Grid / List toggle */}
        <div className="flex items-center gap-2">
          {/* Sort Dropdown */}
          <div className="flex items-center gap-1 bg-white/80 dark:bg-stone-800/80 px-2.5 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 shadow-2xs backdrop-blur-xs">
            <SortAsc className="w-3.5 h-3.5 text-stone-400" />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="bg-transparent text-stone-700 dark:text-stone-300 focus:outline-none text-xs cursor-pointer"
            >
              <option value="createdAt">Recently Added</option>
              <option value="lastOpened">Last Opened</option>
              <option value="title">Title (A-Z)</option>
              <option value="progress">Reading Progress</option>
            </select>
          </div>

          {/* 3D Shelf / Grid / List Switcher */}
          <div className="flex items-center bg-stone-100 dark:bg-stone-800 p-0.5 rounded-lg border border-stone-200 dark:border-stone-700 shadow-2xs">
            <button
              onClick={() => setViewMode('shelf')}
              className={`p-1.5 px-2 rounded-md transition-all flex items-center gap-1 font-medium ${
                viewMode === 'shelf'
                  ? 'bg-white dark:bg-stone-700 text-indigo-600 dark:text-indigo-300 shadow-2xs font-semibold'
                  : 'text-stone-400 hover:text-stone-700 dark:hover:text-stone-200'
              }`}
              title="3D Bookshelf View"
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">3D Shelf</span>
            </button>

            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 px-2 rounded-md transition-all flex items-center gap-1 font-medium ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-stone-700 text-indigo-600 dark:text-indigo-300 shadow-2xs font-semibold'
                  : 'text-stone-400 hover:text-stone-700 dark:hover:text-stone-200'
              }`}
              title="3D Tilt Cards Grid"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">3D Cards</span>
            </button>

            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 px-2 rounded-md transition-all flex items-center gap-1 font-medium ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-stone-700 text-indigo-600 dark:text-indigo-300 shadow-2xs font-semibold'
                  : 'text-stone-400 hover:text-stone-700 dark:hover:text-stone-200'
              }`}
              title="List View"
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">List</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tag Chips Row */}
      {allTags.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
          <span className="text-stone-400 font-mono">Tags:</span>
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              className={`px-2.5 py-0.5 rounded-full font-mono transition-colors shadow-2xs ${
                selectedTag === tag
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'bg-white/80 dark:bg-stone-800/80 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      {/* Books View: 3D Shelf, 3D Grid, or List */}
      {filteredBooks.length === 0 ? (
        <div className="notion-card p-12 text-center space-y-3">
          <BookOpen className="w-10 h-10 mx-auto text-stone-400" />
          <h3 className="font-semibold text-sm">No books found</h3>
          <p className="text-xs text-stone-400 max-w-sm mx-auto">
            {searchQuery ? `No books match your query "${searchQuery}".` : 'Your library is empty.'}
          </p>
          <button
            onClick={onOpenUpload}
            className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white dark:bg-white dark:text-stone-900 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 shadow-md transition-transform hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" /> Upload Book
          </button>
        </div>
      ) : viewMode === 'shelf' ? (
        <ThreeDBookshelf
          books={filteredBooks}
          onOpenBook={onOpenBook}
          onToggleFavorite={onToggleFavorite}
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredBooks.map(book => (
            <BookCard
              key={book._id}
              book={book}
              onOpenBook={onOpenBook}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredBooks.map(book => (
            <BookListItem
              key={book._id}
              book={book}
              onOpenBook={onOpenBook}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      )}
    </div>
  );
};
