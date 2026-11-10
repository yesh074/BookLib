import React, { useState } from 'react';
import { 
  Home, 
  BookOpen, 
  Clock, 
  Cpu, 
  CheckCircle2, 
  Star, 
  Folder as FolderIcon, 
  FolderPlus, 
  ChevronRight, 
  ChevronDown, 
  Sparkles, 
  Sun, 
  Moon, 
  Plus, 
  X,
  Library,
  LogIn,
  LogOut,
  Flame
} from 'lucide-react';
import type { Folder } from '../types';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  selectedFolderId: string | null;
  setSelectedFolderId: (id: string | null) => void;
  folders: Folder[];
  onOpenUpload: () => void;
  onOpenNewFolder: () => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  bookCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  setActiveView,
  selectedFolderId,
  setSelectedFolderId,
  folders,
  onOpenUpload,
  onOpenNewFolder,
  mobileOpen,
  setMobileOpen,
  bookCount
}) => {
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, openAuthModal, logout } = useAuth();
  const [foldersExpanded, setFoldersExpanded] = useState(true);

  const navItems = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'all', label: 'All Books', icon: Library, badge: bookCount },
    { id: 'continue', label: 'Continue Reading', icon: Clock },
    { id: 'technical', label: 'Technical Books', icon: Cpu },
    { id: 'completed', label: 'Completed', icon: CheckCircle2 },
    { id: 'favorites', label: 'Favorites', icon: Star },
  ];

  const handleSelectNav = (viewId: string) => {
    setActiveView(viewId);
    setSelectedFolderId(null);
    setMobileOpen(false);
  };

  const handleSelectFolder = (folderId: string) => {
    setActiveView('folder');
    setSelectedFolderId(folderId);
    setMobileOpen(false);
  };

  const rootFolders = folders.filter(f => !f.parent);

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-xs"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:static top-0 left-0 bottom-0 z-50 w-64 bg-notion-sidebar dark:bg-notion-darkSidebar notion-border border-r flex flex-col justify-between transform transition-transform duration-200 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-3 overflow-y-auto flex-1">
          {/* Workspace Header */}
          <div className="flex items-center justify-between px-2 py-2 mb-3">
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => handleSelectNav('dashboard')}>
              <div className="w-7 h-7 rounded-md bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 flex items-center justify-center font-bold text-sm shadow-xs">
                🧠
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-sm leading-tight text-stone-900 dark:text-stone-100">
                  BookMind AI
                </span>
                <span className="text-[10px] text-notion-muted dark:text-notion-darkMuted font-mono">
                  Academic Workspace
                </span>
              </div>
            </div>

            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden p-1 text-stone-500 hover:bg-stone-200 dark:hover:bg-stone-800 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Action Button */}
          <button
            onClick={() => {
              onOpenUpload();
              setMobileOpen(false);
            }}
            className="w-full mb-4 px-3 py-2 bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white dark:text-stone-900 text-white rounded-md text-xs font-medium flex items-center justify-center gap-2 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Book</span>
          </button>

          {/* Primary Nav Menu */}
          <div className="space-y-0.5 mb-6">
            <div className="px-2 py-1 text-[11px] font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wider">
              Workspace
            </div>
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeView === item.id && !selectedFolderId;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectNav(item.id)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs font-medium flex items-center justify-between group transition-colors ${
                    isActive
                      ? 'bg-stone-200/70 text-stone-900 dark:bg-stone-800 dark:text-stone-100 font-semibold'
                      : 'text-stone-600 dark:text-stone-400 hover:bg-stone-200/40 dark:hover:bg-stone-800/50 hover:text-stone-900 dark:hover:text-stone-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-stone-900 dark:text-white' : 'text-stone-500'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className="text-[10px] px-1.5 py-0.2 bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300 rounded-full font-mono">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Folders Tree Section */}
          <div className="space-y-1">
            <div className="flex items-center justify-between px-2 py-1 text-[11px] font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wider">
              <button
                onClick={() => setFoldersExpanded(!foldersExpanded)}
                className="flex items-center gap-1 hover:text-stone-700 dark:hover:text-stone-300"
              >
                {foldersExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                <span>Folders</span>
              </button>
              <button
                onClick={onOpenNewFolder}
                title="Create New Folder"
                className="p-1 hover:bg-stone-200 dark:hover:bg-stone-800 rounded text-stone-500 hover:text-stone-900 dark:hover:text-white"
              >
                <FolderPlus className="w-3.5 h-3.5" />
              </button>
            </div>

            {foldersExpanded && (
              <div className="space-y-0.5 ml-1 border-l border-stone-200 dark:border-stone-800 pl-1">
                {rootFolders.length === 0 ? (
                  <div className="px-2 py-1.5 text-xs text-stone-400 italic">No folders created</div>
                ) : (
                  rootFolders.map(folder => {
                    const isFolderActive = activeView === 'folder' && selectedFolderId === folder._id;
                    const subfolders = folders.filter(f => f.parent === folder._id);

                    return (
                      <div key={folder._id} className="space-y-0.5">
                        <button
                          onClick={() => handleSelectFolder(folder._id)}
                          className={`w-full text-left px-2 py-1.5 rounded-md text-xs font-medium flex items-center justify-between transition-colors ${
                            isFolderActive
                              ? 'bg-stone-200/70 text-stone-900 dark:bg-stone-800 dark:text-stone-100 font-semibold'
                              : 'text-stone-600 dark:text-stone-400 hover:bg-stone-200/40 dark:hover:bg-stone-800/50'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="text-sm">{folder.icon || '📁'}</span>
                            <span className="truncate">{folder.name}</span>
                          </div>
                          {folder.bookCount !== undefined && folder.bookCount > 0 && (
                            <span className="text-[10px] text-stone-400 font-mono">{folder.bookCount}</span>
                          )}
                        </button>

                        {/* Subfolders */}
                        {subfolders.map(sub => {
                          const isSubActive = activeView === 'folder' && selectedFolderId === sub._id;
                          return (
                            <button
                              key={sub._id}
                              onClick={() => handleSelectFolder(sub._id)}
                              className={`w-full text-left pl-6 pr-2 py-1 rounded-md text-[11px] flex items-center justify-between transition-colors ${
                                isSubActive
                                  ? 'bg-stone-200/70 text-stone-900 dark:bg-stone-800 dark:text-stone-100 font-semibold'
                                  : 'text-stone-500 dark:text-stone-400 hover:bg-stone-200/40 dark:hover:bg-stone-800/50'
                              }`}
                            >
                              <div className="flex items-center gap-1.5 truncate">
                                <span>{sub.icon || '📂'}</span>
                                <span className="truncate">{sub.name}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-stone-200 dark:border-stone-800 space-y-2">
          {/* AI Badge */}
          <div className="px-2.5 py-1.5 rounded-md bg-stone-100 dark:bg-stone-850 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700/50 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5 text-stone-700 dark:text-stone-300 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>Gemini AI Engine</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Engine Active" />
          </div>

          {/* User Account / Profile Section */}
          {isAuthenticated && user ? (
            <div className="p-2.5 rounded-xl bg-stone-100/90 dark:bg-stone-850/90 border border-stone-200 dark:border-stone-700/60 flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-8 h-8 rounded-lg bg-indigo-500/10 dark:bg-indigo-500/20 text-lg flex items-center justify-center shrink-0 shadow-xs border border-indigo-500/20">
                  {user.avatar || '🎓'}
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-stone-900 dark:text-stone-100 truncate leading-snug">
                    {user.name}
                  </p>
                  <p className="text-[10px] text-stone-500 dark:text-stone-400 font-mono flex items-center gap-1">
                    <Flame className="w-3 h-3 text-amber-500 shrink-0" />
                    <span>{user.streakDays || 1}d Streak</span>
                  </p>
                </div>
              </div>

              <button
                onClick={logout}
                title="Sign Out"
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors ml-1"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={openAuthModal}
              className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-md transition-all active:scale-98"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In / Scholar Account</span>
            </button>
          )}

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="w-full px-2.5 py-1.5 rounded-md text-xs font-medium text-stone-600 dark:text-stone-300 hover:bg-stone-200/50 dark:hover:bg-stone-800 flex items-center justify-between transition-colors"
          >
            <div className="flex items-center gap-2">
              {theme === 'dark' ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
              <span>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
            </div>
            <span className="text-[10px] text-stone-400 capitalize">{theme}</span>
          </button>
        </div>
      </aside>
    </>
  );
};
