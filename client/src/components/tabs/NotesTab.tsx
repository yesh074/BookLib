import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Edit3, Eye, Check, Save } from 'lucide-react';
import type { Book, Note } from '../../types';
import { api } from '../../services/api';

interface NotesTabProps {
  book: Book;
}

export const NotesTab: React.FC<NotesTabProps> = ({ book }) => {
  const [note, setNote] = useState<Note | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPreview, setIsPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const res = await api.getBookNotes(book._id);
        setNote(res);
        setTitle(res.title || `${book.title} Notes`);
        setContent(res.content || '');
      } catch (err) {
        console.error('Failed to load notes', err);
      }
    };
    fetchNotes();
  }, [book._id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.saveBookNotes(book._id, { title, content });
      setNote(res);
      setLastSaved(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('Failed to save notes', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Bar */}
      <div className="notion-card p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Edit3 className="w-4 h-4 text-indigo-500" />
          <span className="font-semibold text-stone-900 dark:text-stone-100">Notion-Style Book Workspace Notes</span>
        </div>

        <div className="flex items-center gap-3">
          {lastSaved && (
            <span className="text-[11px] text-stone-400 font-mono flex items-center gap-1">
              <Check className="w-3 h-3 text-emerald-500" /> Saved {lastSaved}
            </span>
          )}

          <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 p-1 rounded-md">
            <button
              onClick={() => setIsPreview(false)}
              className={`px-2.5 py-1 rounded transition-colors ${
                !isPreview ? 'bg-white dark:bg-stone-700 shadow-2xs font-semibold' : 'text-stone-500'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5 inline mr-1" /> Edit
            </button>
            <button
              onClick={() => setIsPreview(true)}
              className={`px-2.5 py-1 rounded transition-colors ${
                isPreview ? 'bg-white dark:bg-stone-700 shadow-2xs font-semibold' : 'text-stone-500'
              }`}
            >
              <Eye className="w-3.5 h-3.5 inline mr-1" /> Preview
            </button>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-3 py-1.5 rounded bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 font-medium flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Saving...' : 'Save'}</span>
          </button>
        </div>
      </div>

      {/* Editor / Preview Area */}
      <div className="notion-card p-6 min-h-[60vh] flex flex-col space-y-4">
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Note Title..."
          className="text-xl font-bold bg-transparent border-b border-stone-200 dark:border-stone-800 pb-2 text-stone-900 dark:text-stone-100 focus:outline-none"
        />

        {isPreview ? (
          <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm text-stone-800 dark:text-stone-200 leading-relaxed font-sans">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        ) : (
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Write your Notion-style reading notes in Markdown format..."
            className="w-full flex-1 min-h-[400px] bg-transparent text-xs sm:text-sm font-mono text-stone-800 dark:text-stone-200 focus:outline-none resize-none leading-relaxed"
          />
        )}
      </div>
    </div>
  );
};
