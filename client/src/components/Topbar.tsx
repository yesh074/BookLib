import React from 'react';
import { Menu, Search, Upload, Command, User, Flame } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface TopbarProps {
  onOpenMobileMenu: () => void;
  onOpenSearch: () => void;
  onOpenUpload: () => void;
  title: string;
  subtitle?: string;
}

export const Topbar: React.FC<TopbarProps> = ({
  onOpenMobileMenu,
  onOpenSearch,
  onOpenUpload,
  title,
  subtitle
}) => {
  const { user, isAuthenticated, openAuthModal } = useAuth();

  return (
    <header className="h-14 border-b border-notion-border dark:border-notion-darkBorder bg-notion-card/80 dark:bg-notion-darkCard/80 backdrop-blur-md px-4 flex items-center justify-between sticky top-0 z-30">
      {/* Left section: Drawer trigger + Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-1.5 rounded-md text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex flex-col">
          <h1 className="text-sm font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <span>{title}</span>
            {subtitle && (
              <span className="text-xs text-stone-400 font-normal font-mono">/ {subtitle}</span>
            )}
          </h1>
        </div>
      </div>

      {/* Right section: Search button, Upload button, User info */}
      <div className="flex items-center gap-2">
        {/* Cmd+K Search trigger */}
        <button
          onClick={onOpenSearch}
          className="px-3 py-1.5 rounded-md bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 text-xs flex items-center gap-2 border border-stone-200 dark:border-stone-700/60 transition-colors shadow-2xs"
        >
          <Search className="w-3.5 h-3.5 text-stone-400" />
          <span className="hidden sm:inline text-stone-500 dark:text-stone-400">Search library...</span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[10px] bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300 px-1.5 py-0.5 rounded font-mono border border-stone-300 dark:border-stone-600">
            <Command className="w-2.5 h-2.5" /> K
          </kbd>
        </button>

        {/* Upload Button */}
        <button
          onClick={onOpenUpload}
          className="px-3 py-1.5 rounded-md bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white dark:text-stone-900 text-white text-xs font-medium flex items-center gap-1.5 shadow-2xs transition-colors"
        >
          <Upload className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Upload</span>
        </button>

        {/* User Profile / Sign In Button */}
        {isAuthenticated && user ? (
          <div
            onClick={openAuthModal}
            className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700/60 cursor-pointer transition-colors shadow-2xs"
            title={`${user.name} (${user.email}) - Click to manage`}
          >
            <span className="text-sm">{user.avatar || '🎓'}</span>
            <span className="hidden md:inline text-xs font-semibold text-stone-800 dark:text-stone-200 max-w-[110px] truncate">
              {user.name}
            </span>
            <span className="hidden sm:inline-flex items-center gap-0.5 text-[10px] font-mono text-amber-500 font-semibold bg-amber-500/10 px-1.5 py-0.2 rounded-full">
              <Flame className="w-2.5 h-2.5 inline" /> {user.streakDays || 1}d
            </span>
          </div>
        ) : (
          <button
            onClick={openAuthModal}
            className="px-3 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <User className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
};
