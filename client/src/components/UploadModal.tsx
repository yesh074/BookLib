import React, { useState } from 'react';
import { X, UploadCloud, FileText, Check, Cpu } from 'lucide-react';
import type { Folder } from '../types';
import { api } from '../services/api';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  folders: Folder[];
  onUploadSuccess: () => void;
}

const COVER_COLORS = ['#2563eb', '#059669', '#7c3aed', '#d97706', '#dc2626', '#475569'];
const COVER_ICONS = ['📘', '💻', '⚙️', '🌱', '📑', '🧠', '🔬', '🚀', '📐'];

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  folders,
  onUploadSuccess
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string>('');
  const [tagsInput, setTagsInput] = useState('');
  const [isTechnical, setIsTechnical] = useState(false);
  const [coverColor, setCoverColor] = useState(COVER_COLORS[0]);
  const [coverIcon, setCoverIcon] = useState(COVER_ICONS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      // Auto-fill title from filename
      const baseName = selected.name.substring(0, selected.name.lastIndexOf('.')) || selected.name;
      if (!title) setTitle(baseName.replace(/_/g, ' ').replace(/-/g, ' '));
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a PDF, TXT, or Markdown file to upload.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title.trim());
      formData.append('author', author.trim() || 'Unknown Author');
      formData.append('description', description.trim());
      if (selectedFolder) formData.append('folder', selectedFolder);
      formData.append('isTechnical', String(isTechnical));
      formData.append('coverColor', coverColor);
      formData.append('coverIcon', coverIcon);
      if (tagsInput.trim()) {
        formData.append('tags', tagsInput);
      }

      await api.uploadBook(formData);
      setLoading(false);
      onUploadSuccess();
      onClose();
      // Reset form
      setFile(null);
      setTitle('');
      setAuthor('');
      setDescription('');
      setSelectedFolder('');
      setTagsInput('');
      setIsTechnical(false);
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Failed to upload book file');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-notion-card dark:bg-notion-darkCard notion-border border rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-notion-border dark:border-notion-darkBorder flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">{coverIcon}</span>
            <h2 className="font-semibold text-base text-stone-900 dark:text-stone-100">Upload Book to Library</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 rounded-md border border-red-200 dark:border-red-900">
              {error}
            </div>
          )}

          {/* File Picker Box */}
          <div>
            <label className="block text-stone-600 dark:text-stone-400 mb-1.5 font-medium">
              Book File (.pdf, .txt, .md) *
            </label>
            <div className="relative border-2 border-dashed border-stone-300 dark:border-stone-700 rounded-lg p-5 text-center hover:border-stone-400 dark:hover:border-stone-500 transition-colors bg-stone-50/50 dark:bg-stone-900/30">
              <input
                type="file"
                accept=".pdf,.txt,.md"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              {file ? (
                <div className="flex items-center justify-center gap-2 text-stone-800 dark:text-stone-200 font-medium">
                  <FileText className="w-5 h-5 text-indigo-500" />
                  <span>{file.name}</span>
                  <span className="text-[10px] text-stone-400">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                </div>
              ) : (
                <div className="space-y-1">
                  <UploadCloud className="w-8 h-8 mx-auto text-stone-400" />
                  <p className="text-stone-700 dark:text-stone-300 font-medium">Click to choose or drag & drop file</p>
                  <p className="text-stone-400 text-[11px]">Supports PDF, TXT, and Markdown files up to 50MB</p>
                </div>
              )}
            </div>
          </div>

          {/* Title & Author */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-stone-600 dark:text-stone-400 mb-1 font-medium">Book Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Designing Data-Intensive Applications"
                className="w-full px-3 py-2 rounded-md bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-stone-400"
              />
            </div>
            <div>
              <label className="block text-stone-600 dark:text-stone-400 mb-1 font-medium">Author</label>
              <input
                type="text"
                value={author}
                onChange={e => setAuthor(e.target.value)}
                placeholder="e.g. Martin Kleppmann"
                className="w-full px-3 py-2 rounded-md bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-stone-400"
              />
            </div>
          </div>

          {/* Folder & Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-stone-600 dark:text-stone-400 mb-1 font-medium">Folder</label>
              <select
                value={selectedFolder}
                onChange={e => setSelectedFolder(e.target.value)}
                className="w-full px-3 py-2 rounded-md bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-stone-400"
              >
                <option value="">(No Folder - Root)</option>
                {folders.map(f => (
                  <option key={f._id} value={f._id}>
                    {f.icon || '📁'} {f.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-stone-600 dark:text-stone-400 mb-1 font-medium">Tags (comma separated)</label>
              <input
                type="text"
                value={tagsInput}
                onChange={e => setTagsInput(e.target.value)}
                placeholder="e.g. Systems, Architecture, SQL"
                className="w-full px-3 py-2 rounded-md bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-stone-400"
              />
            </div>
          </div>

          {/* Technical Book Switcher */}
          <div className="p-3 bg-stone-50 dark:bg-stone-850 rounded-lg border border-stone-200 dark:border-stone-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-500" />
              <div>
                <p className="font-semibold text-stone-800 dark:text-stone-200">Mark as Technical Book</p>
                <p className="text-[11px] text-stone-400">Enables Quizzes, Flashcards, Concept Extraction & Technical QA</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={isTechnical}
              onChange={e => {
                setIsTechnical(e.target.checked);
                if (e.target.checked && coverIcon === '📘') setCoverIcon('💻');
              }}
              className="w-4 h-4 rounded text-indigo-600 cursor-pointer"
            />
          </div>

          {/* Cover Color & Icon Pickers */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-stone-600 dark:text-stone-400 mb-1 font-medium">Cover Icon</label>
              <div className="flex flex-wrap gap-1.5">
                {COVER_ICONS.map(ic => (
                  <button
                    key={ic}
                    type="button"
                    onClick={() => setCoverIcon(ic)}
                    className={`w-7 h-7 rounded flex items-center justify-center text-sm ${
                      coverIcon === ic ? 'bg-stone-300 dark:bg-stone-700 ring-1 ring-stone-500' : 'hover:bg-stone-200 dark:hover:bg-stone-800'
                    }`}
                  >
                    {ic}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-stone-600 dark:text-stone-400 mb-1 font-medium">Cover Accent Color</label>
              <div className="flex flex-wrap gap-1.5">
                {COVER_COLORS.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCoverColor(c)}
                    style={{ backgroundColor: c }}
                    className={`w-6 h-6 rounded-full flex items-center justify-center transition-transform ${
                      coverColor === c ? 'scale-110 ring-2 ring-offset-1 ring-stone-500' : ''
                    }`}
                  >
                    {coverColor === c && <Check className="w-3 h-3 text-white" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-stone-200 dark:border-stone-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-md bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 font-medium flex items-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>Upload & Process Book</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
