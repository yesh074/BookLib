import React, { useState, useEffect } from 'react';
import { Network, RefreshCw, GitBranch, Layers, GitMerge } from 'lucide-react';
import type { Book } from '../../types';
import { api } from '../../services/api';
import { MermaidDiagram } from '../MermaidDiagram';

interface KnowledgeMapTabProps {
  book: Book;
}

export const KnowledgeMapTab: React.FC<KnowledgeMapTabProps> = ({ book }) => {
  const [diagramType, setDiagramType] = useState<string>('concept_map');
  const [mermaidCode, setMermaidCode] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDiagram = async (type: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.generateDiagram(book._id, type);
      setMermaidCode(res.mermaidCode);
      setDescription(res.description);
    } catch (err: any) {
      setError(err.message || 'Failed to generate visual knowledge map');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiagram(diagramType);
  }, [book._id, diagramType]);

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="notion-card p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Network className="w-5 h-5 text-indigo-500" />
          <div>
            <h3 className="font-semibold text-sm text-stone-900 dark:text-stone-100">Visual Knowledge Map</h3>
            <p className="text-[11px] text-stone-400">Mermaid.js architectural diagrams generated from book content</p>
          </div>
        </div>

        {/* Diagram Type Switcher */}
        <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 p-1 rounded-lg text-xs font-medium">
          <button
            onClick={() => setDiagramType('concept_map')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              diagramType === 'concept_map'
                ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
            }`}
          >
            🧠 Concept Map
          </button>
          <button
            onClick={() => setDiagramType('flowchart')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              diagramType === 'flowchart'
                ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
            }`}
          >
            🔀 Flowchart
          </button>
          <button
            onClick={() => setDiagramType('hierarchy')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              diagramType === 'hierarchy'
                ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
            }`}
          >
            🌳 Hierarchy
          </button>
          <button
            onClick={() => setDiagramType('process')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              diagramType === 'process'
                ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
            }`}
          >
            ⚡ Process
          </button>
        </div>
      </div>

      {/* Main Diagram Canvas */}
      {loading ? (
        <div className="notion-card p-12 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-medium text-sm text-stone-700 dark:text-stone-300">Building visual {diagramType} with Mermaid...</p>
        </div>
      ) : error ? (
        <div className="notion-card p-6 bg-red-50 text-red-700 text-xs">
          <p className="font-semibold mb-2">{error}</p>
          <button
            onClick={() => fetchDiagram(diagramType)}
            className="px-3 py-1 bg-red-600 text-white rounded font-medium"
          >
            Retry
          </button>
        </div>
      ) : mermaidCode ? (
        <MermaidDiagram chart={mermaidCode} description={description} />
      ) : null}
    </div>
  );
};
