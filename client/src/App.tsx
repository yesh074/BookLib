import React, { useEffect, useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { UploadModal } from './components/UploadModal';
import { NewFolderModal } from './components/NewFolderModal';
import { CommandPalette } from './components/CommandPalette';
import { AuthModal } from './components/AuthModal';
import { DashboardPage } from './pages/DashboardPage';
import { LibraryPage } from './pages/LibraryPage';
import { BookDetailPage } from './pages/BookDetailPage';
import { ThreeDBackground } from './components/ThreeDBackground';
import type { Book, Folder } from './types';
import { api } from './services/api';

export function AppContent() {
  const [activeView, setActiveView] = useState<string>('dashboard');
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);

  const [books, setBooks] = useState<Book[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const fetchData = async () => {
    try {
      const [fetchedBooks, fetchedFolders] = await Promise.all([
        api.getBooks(),
        api.getFolders()
      ]);
      setBooks(fetchedBooks);
      setFolders(fetchedFolders);
    } catch (err) {
      console.error('[Data Fetch Error]:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenBook = (bookId: string) => {
    setSelectedBookId(bookId);
    setActiveView('book-detail');
  };

  const handleToggleFavorite = async (e: React.MouseEvent, book: Book) => {
    e.stopPropagation();
    const newFav = !book.isFavorite;
    setBooks(prev => prev.map(b => (b._id === book._id ? { ...b, isFavorite: newFav } : b)));
    try {
      await api.updateBook(book._id, { isFavorite: newFav });
    } catch (err) {
      // Revert on fail
      setBooks(prev => prev.map(b => (b._id === book._id ? { ...b, isFavorite: !newFav } : b)));
    }
  };

  // Compute view title for Topbar
  let topbarTitle = 'Workspace';
  let topbarSubtitle = '';

  if (activeView === 'dashboard') {
    topbarTitle = 'Dashboard';
  } else if (activeView === 'all') {
    topbarTitle = 'All Books';
  } else if (activeView === 'continue') {
    topbarTitle = 'Continue Reading';
  } else if (activeView === 'technical') {
    topbarTitle = 'Technical Books';
  } else if (activeView === 'completed') {
    topbarTitle = 'Completed Books';
  } else if (activeView === 'favorites') {
    topbarTitle = 'Favorite Books';
  } else if (activeView === 'folder') {
    const f = folders.find(fol => fol._id === selectedFolderId);
    topbarTitle = f ? f.name : 'Folder View';
    topbarSubtitle = 'Folder';
  } else if (activeView === 'book-detail') {
    topbarTitle = 'Book Workspace';
  }

  // Filtered books subset based on current navigation item
  const displayBooks = books.filter(b => {
    if (activeView === 'continue') return b.progress > 0 && b.progress < 100;
    if (activeView === 'technical') return b.isTechnical;
    if (activeView === 'completed') return b.isCompleted || b.progress >= 100;
    if (activeView === 'favorites') return b.isFavorite;
    if (activeView === 'folder' && selectedFolderId) {
      return b.folder === selectedFolderId || (typeof b.folder === 'object' && b.folder && b.folder._id === selectedFolderId);
    }
    return true; // 'all' or default
  });

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-notion-bg dark:bg-notion-darkBg text-notion-text dark:text-notion-darkText relative">
      {/* Creative 3D Animated Background with Floating Books & Ambient Glow */}
      <ThreeDBackground />

      {/* Sidebar */}
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        selectedFolderId={selectedFolderId}
        setSelectedFolderId={setSelectedFolderId}
        folders={folders}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenNewFolder={() => setIsNewFolderOpen(true)}
        mobileOpen={mobileMenuOpen}
        setMobileOpen={setMobileMenuOpen}
        bookCount={books.length}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        <Topbar
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenUpload={() => setIsUploadOpen(true)}
          title={topbarTitle}
          subtitle={topbarSubtitle}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {loading ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-stone-400 font-mono">Loading BookMind AI Workspace...</p>
            </div>
          ) : activeView === 'book-detail' && selectedBookId ? (
            <BookDetailPage
              bookId={selectedBookId}
              onBack={() => setActiveView('all')}
              folders={folders}
              onBookDeleted={fetchData}
              onBookUpdated={fetchData}
            />
          ) : activeView === 'dashboard' ? (
            <DashboardPage
              books={books}
              folders={folders}
              onOpenBook={handleOpenBook}
              onSelectNav={setActiveView}
              onToggleFavorite={handleToggleFavorite}
              onOpenUpload={() => setIsUploadOpen(true)}
            />
          ) : (
            <LibraryPage
              books={displayBooks}
              folders={folders}
              currentFolderId={selectedFolderId}
              onOpenBook={handleOpenBook}
              onToggleFavorite={handleToggleFavorite}
              onOpenUpload={() => setIsUploadOpen(true)}
              onOpenNewFolder={() => setIsNewFolderOpen(true)}
              viewTitle={topbarTitle}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        folders={folders}
        onUploadSuccess={fetchData}
      />

      <NewFolderModal
        isOpen={isNewFolderOpen}
        onClose={() => setIsNewFolderOpen(false)}
        folders={folders}
        onFolderCreated={fetchData}
      />

      <CommandPalette
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        books={books}
        folders={folders}
        onSelectBook={handleOpenBook}
        onSelectFolder={(fId) => {
          setSelectedFolderId(fId);
          setActiveView('folder');
        }}
      />

      <AuthModal />
    </div>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
