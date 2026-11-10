import React, { useState } from 'react';
import { X, FolderPlus } from 'lucide-react';
import type { Folder } from '../types';
import { api } from '../services/api';

interface NewFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  folders: Folder[];
  onFolderCreated: () => void;
}

const FOLDER_ICONS = ['📁', '💻', '⚡', '📑', '🔬', '🎓', '📚', '📐', '💡'];
const FOLDER_COLORS = ['#3b82f6', '#059669', '#d97706', '#7c3aed', '#dc2626', '#475569'];

export const NewFolderModal: React.FC<NewFolderModalProps> = ({
  isOpen,
  onClose,
  folders,
  onFolderCreated
}) => {
  const [name, setName] = useState('');
  const [parent, setParent] = useState<string>('');
  const [icon, setIcon] = useState(FOLDER_ICONS[0]);
  const [color, setColor] = useState(FOLDER_COLORS[0]);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter a folder name.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.createFolder({
        name: name.trim(),
        parent: parent || null,
        icon,
        color,
        description: description.trim()
      });
      setLoading(false);
      onFolderCreated();
      onClose();
      setName('');
      setParent('');
      setDescription('');
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Failed to create folder');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-notion-card dark:bg-notion-darkCard notion-border border rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="px-5 py-4 border-b border-notion-border dark:border-notion-darkBorder flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderPlus className="w-5 h-5 text-indigo-500" />
            <h2 className="font-semibold text-sm text-stone-900 dark:text-stone-100">Create New Folder</h2>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {error && (
            <div className="p-2.5 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 rounded border border-red-200">
              {error}
            </div>
          )}

          <div>
            <label className="block text-stone-600 dark:text-stone-400 mb-1 font-medium">Folder Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Distributed Systems"
              className="w-full px-3 py-2 rounded bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-stone-400"
            />
          </div>

          <div>
            <label className="block text-stone-600 dark:text-stone-400 mb-1 font-medium">Parent Folder (Subfolder)</label>
            <select
              value={parent}
              onChange={e => setParent(e.target.value)}
              className="w-full px-3 py-2 rounded bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-stone-400"
            >
              <option value="">(None - Top Level Folder)</option>
              {folders.filter(f => !f.parent).map(f => (
                <option key={f._id} value={f._id}>
                  {f.icon || '📁'} {f.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-stone-600 dark:text-stone-400 mb-1 font-medium">Folder Icon</label>
            <div className="flex flex-wrap gap-1.5">
              {FOLDER_ICONS.map(ic => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => setIcon(ic)}
                  className={`w-7 h-7 rounded flex items-center justify-center text-sm ${
                    icon === ic ? 'bg-stone-300 dark:bg-stone-700 ring-1 ring-stone-500' : 'hover:bg-stone-200 dark:hover:bg-stone-800'
                  }`}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-stone-200 dark:border-stone-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-3.5 py-1.5 rounded bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 font-medium"
            >
              {loading ? 'Creating...' : 'Create Folder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
