import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  BookOpen,
  CheckCircle2,
  Zap,
  Bookmark,
  Volume2,
  VolumeX,
  Pause,
  Play,
  Copy,
  Check,
  Download,
  FilePlus,
  Search,
  HelpCircle,
  RotateCcw,
  Sliders,
  Send,
  Lightbulb,
  Award,
  ListTodo,
  Network
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { Book, Summary } from '../../types';
import { api } from '../../services/api';
import { MermaidDiagram } from '../MermaidDiagram';

interface AISummaryTabProps {
  book: Book;
}

export const AISummaryTab: React.FC<AISummaryTabProps> = ({ book }) => {
  // State
  const [mode, setMode] = useState<'5min' | 'detailed' | 'revision'>('5min');
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSectionFilter, setActiveSectionFilter] = useState<'all' | 'keyPoints' | 'concepts' | 'takeaways' | 'diagram'>('all');

  // Custom Prompt Focus
  const [showCustomPrompt, setShowCustomPrompt] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');

  // Diagram for this Summary Page
  const [diagramType, setDiagramType] = useState<string>('concept_map');
  const [mermaidCode, setMermaidCode] = useState<string>('');
  const [diagramDescription, setDiagramDescription] = useState<string>('');
  const [diagramLoading, setDiagramLoading] = useState<boolean>(false);

  // Text-To-Speech (TTS)
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isAudioPaused, setIsAudioPaused] = useState(false);
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Interactivity & Mastery
  const [masteredConcepts, setMasteredConcepts] = useState<Record<string, boolean>>({});
  const [expandedAnalogy, setExpandedAnalogy] = useState<Record<string, boolean>>({});
  const [completedTakeaways, setCompletedTakeaways] = useState<Record<string, boolean>>({});

  // Actions feedback
  const [copied, setCopied] = useState(false);
  const [savedToNotes, setSavedToNotes] = useState(false);

  // AI Q&A Inline Follow-up
  const [followUpQuestion, setFollowUpQuestion] = useState('');
  const [followUpLoading, setFollowUpLoading] = useState(false);
  const [followUpAnswers, setFollowUpAnswers] = useState<Array<{ q: string; a: string; err?: boolean }>>([]);

  // Multi-step loading progress ticker
  const [loadingStepIndex, setLoadingStepIndex] = useState(0);
  const loadingSteps = [
    'Scanning document structure & chapters...',
    'Synthesizing core thesis with Gemini AI...',
    'Extracting high-yield concepts & definitions...',
    'Formatting interactive brief & practical takeaways...'
  ];

  // Fetch summary
  const fetchSummary = async (selectedMode: '5min' | 'detailed' | 'revision', customFocus: string = '') => {
    setLoading(true);
    setError(null);
    stopAudio();

    // Start loading step interval
    setLoadingStepIndex(0);
    const stepInterval = setInterval(() => {
      setLoadingStepIndex((prev) => (prev < loadingSteps.length - 1 ? prev + 1 : prev));
    }, 700);

    try {
      const res = await api.summarizeBook(book._id, selectedMode, customFocus);
      setSummary(res);
    } catch (err: any) {
      setError(err.message || 'Failed to generate AI summary');
    } finally {
      clearInterval(stepInterval);
      setLoading(false);
    }
  };

  // Fetch Diagram for this summarization page
  const fetchDiagram = async (type: string) => {
    setDiagramLoading(true);
    try {
      const res = await api.generateDiagram(book._id, type);
      setMermaidCode(res.mermaidCode);
      setDiagramDescription(res.description);
    } catch (err) {
      console.error('[Diagram Fetch Error]:', err);
    } finally {
      setDiagramLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary(mode);
    fetchDiagram(diagramType);
    return () => {
      stopAudio();
    };
  }, [book._id, mode]);

  const handleDiagramTypeChange = (type: string) => {
    setDiagramType(type);
    fetchDiagram(type);
  };

  // Audio TTS Logic
  const startAudio = () => {
    if (!summary) return;
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported in your browser.');
      return;
    }

    if (isAudioPaused) {
      window.speechSynthesis.resume();
      setIsPlayingAudio(true);
      setIsAudioPaused(false);
      return;
    }

    window.speechSynthesis.cancel();

    // Build speech text
    const textToRead = [
      `Summary for ${book.title}.`,
      `Executive Summary: ${summary.shortSummary}`,
      summary.keyPoints ? `Key Points: ${summary.keyPoints.join('. ')}` : '',
      summary.keyTakeaways ? `Key Takeaways: ${summary.keyTakeaways.join('. ')}` : ''
    ].filter(Boolean).join(' ');

    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.rate = speechRate;
    utterance.onend = () => {
      setIsPlayingAudio(false);
      setIsAudioPaused(false);
    };
    utterance.onerror = () => {
      setIsPlayingAudio(false);
      setIsAudioPaused(false);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsPlayingAudio(true);
    setIsAudioPaused(false);
  };

  const pauseAudio = () => {
    if ('speechSynthesis' in window && isPlayingAudio) {
      window.speechSynthesis.pause();
      setIsPlayingAudio(false);
      setIsAudioPaused(true);
    }
  };

  const stopAudio = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      setIsAudioPaused(false);
    }
  };

  const changeSpeechRate = (newRate: number) => {
    setSpeechRate(newRate);
    if (isPlayingAudio) {
      stopAudio();
      setTimeout(() => startAudio(), 100);
    }
  };

  // Copy Summary
  const handleCopySummary = () => {
    if (!summary) return;
    const formatted = `
# ${book.title} – AI Summary (${mode.toUpperCase()})

## Executive Summary
${summary.shortSummary}

## Key Points & Chapters
${summary.keyPoints?.map((p, i) => `${i + 1}. ${p}`).join('\n')}

## Core Concepts & Definitions
${summary.importantConcepts?.map((c) => `- **${c.term}**: ${c.definition}`).join('\n')}

## Key Takeaways
${summary.keyTakeaways?.map((t) => `- ${t}`).join('\n')}

## Practical Applications
${summary.practicalApplications?.map((a) => `- ${a}`).join('\n')}
    `.trim();

    navigator.clipboard.writeText(formatted);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Download Summary Markdown
  const handleDownloadMarkdown = () => {
    if (!summary) return;
    const formatted = `
# ${book.title} – AI Summary (${mode.toUpperCase()})
*Generated with BookMind AI*

## Executive Summary
${summary.shortSummary}

## Key Points & Chapters
${summary.keyPoints?.map((p, i) => `${i + 1}. ${p}`).join('\n')}

## Core Concepts & Definitions
${summary.importantConcepts?.map((c) => `- **${c.term}**: ${c.definition}`).join('\n')}

## Key Takeaways
${summary.keyTakeaways?.map((t) => `- ${t}`).join('\n')}

## Practical Applications
${summary.practicalApplications?.map((a) => `- ${a}`).join('\n')}
    `.trim();

    const blob = new Blob([formatted], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${book.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_summary.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Save to Book Notes
  const handleSaveToNotes = async () => {
    if (!summary) return;
    try {
      const existing = await api.getBookNotes(book._id).catch(() => null);
      const noteContent = `
### ⚡ AI Summary (${mode.toUpperCase()}) – Saved ${new Date().toLocaleDateString()}

**Executive Summary:**
${summary.shortSummary}

**Key Points:**
${summary.keyPoints?.map((p) => `- ${p}`).join('\n')}

**Key Takeaways:**
${summary.keyTakeaways?.map((t) => `- ${t}`).join('\n')}
      `.trim();

      const updatedText = existing?.content
        ? `${existing.content}\n\n---\n\n${noteContent}`
        : noteContent;

      await api.saveBookNotes(book._id, updatedText);
      setSavedToNotes(true);
      setTimeout(() => setSavedToNotes(false), 2500);
    } catch (err) {
      alert('Failed to save summary to notes.');
    }
  };

  // Toggle concept mastery
  const toggleConceptMastery = (term: string) => {
    setMasteredConcepts((prev) => ({ ...prev, [term]: !prev[term] }));
  };

  // Toggle takeaway completion & check confetti
  const toggleTakeawayCompletion = (id: string) => {
    setCompletedTakeaways((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      
      const totalItems = (summary?.keyTakeaways?.length || 0) + (summary?.practicalApplications?.length || 0);
      const completedCount = Object.values(next).filter(Boolean).length;
      if (completedCount === totalItems && totalItems > 0) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }

      return next;
    });
  };

  // Handle follow up inline prompt (Summarizer Chat)
  const handleFollowUpQuestion = async (queryText: string) => {
    if (!queryText.trim() || followUpLoading) return;
    setFollowUpLoading(true);
    try {
      const res = await api.chatWithBook(book._id, queryText.trim());
      setFollowUpAnswers((prev) => [{ q: queryText.trim(), a: res.answer }, ...prev]);
      setFollowUpQuestion('');
    } catch (err: any) {
      console.error('[Summarizer Chat Error]:', err);
      setFollowUpAnswers((prev) => [
        {
          q: queryText.trim(),
          a: err.message || "I couldn't process this question right now. Please try again.",
          err: true
        },
        ...prev
      ]);
    } finally {
      setFollowUpLoading(false);
    }
  };

  // Concept mastery calculation
  const totalConcepts = summary?.importantConcepts?.length || 0;
  const masteredCount = Object.values(masteredConcepts).filter(Boolean).length;
  const masteryPercentage = totalConcepts > 0 ? Math.round((masteredCount / totalConcepts) * 100) : 0;

  // Takeaway checklist calculation
  const totalChecklistItems = (summary?.keyTakeaways?.length || 0) + (summary?.practicalApplications?.length || 0);
  const checkedCount = Object.values(completedTakeaways).filter(Boolean).length;
  const checklistPercentage = totalChecklistItems > 0 ? Math.round((checkedCount / totalChecklistItems) * 100) : 0;

  // Filter content by search query
  const matchesSearch = (str: string) => {
    if (!searchQuery.trim()) return true;
    return str.toLowerCase().includes(searchQuery.toLowerCase());
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Dynamic Header & Mode Switcher */}
      <div className="notion-card p-4 space-y-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 dark:border-stone-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-500/20">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-stone-900 dark:text-stone-100">AI Book Summarizer</h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />
                  Gemini Grounded
                </span>
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-400">
                Interactive chapter synthesis, audio briefing & high-yield revision checklist
              </p>
            </div>
          </div>

          {/* Mode Pill Switcher */}
          <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 p-1 rounded-xl text-xs font-medium self-start sm:self-auto border border-stone-200 dark:border-stone-700">
            <button
              onClick={() => setMode('5min')}
              className={`px-3 py-1.5 rounded-lg transition-all duration-200 flex items-center gap-1.5 ${
                mode === '5min'
                  ? 'bg-white dark:bg-stone-900 text-indigo-600 dark:text-indigo-400 shadow-sm font-semibold'
                  : 'text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              5-Min Executive
            </button>
            <button
              onClick={() => setMode('detailed')}
              className={`px-3 py-1.5 rounded-lg transition-all duration-200 flex items-center gap-1.5 ${
                mode === 'detailed'
                  ? 'bg-white dark:bg-stone-900 text-indigo-600 dark:text-indigo-400 shadow-sm font-semibold'
                  : 'text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-blue-500" />
              Detailed Breakdown
            </button>
            <button
              onClick={() => setMode('revision')}
              className={`px-3 py-1.5 rounded-lg transition-all duration-200 flex items-center gap-1.5 ${
                mode === 'revision'
                  ? 'bg-white dark:bg-stone-900 text-indigo-600 dark:text-indigo-400 shadow-sm font-semibold'
                  : 'text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-emerald-500" />
              Exam Revision
            </button>
          </div>
        </div>

        {/* Toolbar: Custom Focus Toggle, Search, TTS Controls, Copy/Save */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          {/* Audio TTS Toolbar */}
          <div className="flex items-center gap-2 bg-stone-100 dark:bg-stone-800 p-1.5 rounded-lg border border-stone-200 dark:border-stone-700 text-xs">
            <button
              onClick={isPlayingAudio ? pauseAudio : startAudio}
              disabled={loading || !summary}
              className="px-3 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-medium flex items-center gap-1.5 transition-transform active:scale-95 disabled:opacity-50"
            >
              {isPlayingAudio ? (
                <>
                  <Pause className="w-3.5 h-3.5" /> Pause Briefing
                </>
              ) : isAudioPaused ? (
                <>
                  <Play className="w-3.5 h-3.5" /> Resume Briefing
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5" /> Listen to Briefing
                </>
              )}
            </button>

            {isPlayingAudio && (
              <button
                onClick={stopAudio}
                className="p-1.5 rounded-md hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 transition-colors"
                title="Stop Audio"
              >
                <VolumeX className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Equalizer Animation Bars */}
            {isPlayingAudio && (
              <div className="flex items-end gap-0.5 h-4 px-1">
                <span className="w-1 bg-indigo-500 rounded-full animate-[bounce_0.6s_infinite_100ms] h-full" />
                <span className="w-1 bg-purple-500 rounded-full animate-[bounce_0.6s_infinite_300ms] h-2/3" />
                <span className="w-1 bg-pink-500 rounded-full animate-[bounce_0.6s_infinite_200ms] h-3/4" />
                <span className="w-1 bg-indigo-400 rounded-full animate-[bounce_0.6s_infinite_400ms] h-1/2" />
              </div>
            )}

            {/* Speed Selector */}
            <div className="flex items-center gap-0.5 border-l border-stone-300 dark:border-stone-700 pl-2 ml-1">
              {[0.8, 1.0, 1.25, 1.5].map((rate) => (
                <button
                  key={rate}
                  onClick={() => changeSpeechRate(rate)}
                  className={`px-1.5 py-0.5 text-[10px] font-semibold rounded ${
                    speechRate === rate
                      ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
                  }`}
                >
                  {rate}x
                </button>
              ))}
            </div>
          </div>

          {/* Action buttons: Copy, Save to Notes, Download, Custom Prompt */}
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => setShowCustomPrompt(!showCustomPrompt)}
              className="px-2.5 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 flex items-center gap-1.5 transition-colors font-medium"
            >
              <Sliders className="w-3.5 h-3.5 text-indigo-500" />
              Custom Focus
            </button>

            <button
              onClick={handleSaveToNotes}
              disabled={!summary}
              className="px-2.5 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 flex items-center gap-1.5 transition-colors disabled:opacity-50 font-medium"
              title="Save summary into book notes tab"
            >
              {savedToNotes ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" /> Saved!
                </>
              ) : (
                <>
                  <FilePlus className="w-3.5 h-3.5 text-emerald-500" /> Save to Notes
                </>
              )}
            </button>

            <button
              onClick={handleCopySummary}
              disabled={!summary}
              className="px-2.5 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 flex items-center gap-1.5 transition-colors disabled:opacity-50 font-medium"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-stone-500" /> Copy
                </>
              )}
            </button>

            <button
              onClick={handleDownloadMarkdown}
              disabled={!summary}
              className="p-1.5 rounded-lg border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 transition-colors disabled:opacity-50"
              title="Export as Markdown"
            >
              <Download className="w-3.5 h-3.5 text-stone-500" />
            </button>
          </div>
        </div>

        {/* Custom Focus Prompt Expandable Drawer */}
        {showCustomPrompt && (
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl border border-indigo-200 dark:border-indigo-800 space-y-2 animate-fade-in">
            <label className="text-xs font-semibold text-indigo-950 dark:text-indigo-100 flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              Tailor Summary Focus (Custom Gemini Prompt)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="e.g. Focus on practical code examples, key architectural trade-offs, or leadership takeaways..."
                className="flex-1 text-xs px-3 py-2 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={() => {
                  fetchSummary(mode, customPrompt);
                  setShowCustomPrompt(false);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-transform active:scale-95 shadow-sm"
              >
                Regenerate
              </button>
            </div>
          </div>
        )}

        {/* Search & Category Section Filter Bar */}
        {summary && !loading && (
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-200 dark:border-stone-800 text-xs">
            {/* Filter Pills */}
            <div className="flex items-center gap-1">
              {(['all', 'keyPoints', 'concepts', 'takeaways', 'diagram'] as const).map((sec) => (
                <button
                  key={sec}
                  onClick={() => setActiveSectionFilter(sec)}
                  className={`px-2.5 py-1 rounded-md transition-colors capitalize ${
                    activeSectionFilter === sec
                      ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 font-bold'
                      : 'text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100'
                  }`}
                >
                  {sec === 'all'
                    ? 'All Sections'
                    : sec === 'diagram'
                    ? '🧠 Visual Mindmap'
                    : sec.replace(/([A-Z])/g, ' $1')}
                </button>
              ))}
            </div>

            {/* Keyword Search Input */}
            <div className="relative w-full sm:w-48">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter summary..."
                className="w-full text-xs pl-8 pr-2 py-1 rounded-md border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="notion-card p-10 text-center space-y-5 bg-white dark:bg-stone-900">
          {/* Animated Glowing AI Orb */}
          <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
            <span className="absolute inset-0 rounded-full bg-indigo-500/20 animate-ping" />
            <span className="absolute inset-2 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 animate-spin opacity-75 blur-xs" />
            <div className="relative w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white shadow-lg">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
          </div>

          <div className="space-y-2 max-w-sm mx-auto">
            <h4 className="font-semibold text-stone-900 dark:text-stone-100 text-sm">
              Synthesizing {mode.toUpperCase()} Summary
            </h4>
            <p className="text-xs text-indigo-600 dark:text-indigo-400 font-mono font-medium animate-fade-in">
              {loadingSteps[loadingStepIndex]}
            </p>
          </div>

          {/* Shimmer Skeletons */}
          <div className="space-y-3 pt-4 max-w-lg mx-auto">
            <div className="h-16 bg-stone-200/60 dark:bg-stone-800/60 rounded-xl animate-pulse" />
            <div className="h-24 bg-stone-200/60 dark:bg-stone-800/60 rounded-xl animate-pulse" />
            <div className="h-20 bg-stone-200/60 dark:bg-stone-800/60 rounded-xl animate-pulse" />
          </div>
        </div>
      ) : error ? (
        <div className="notion-card p-6 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-200 space-y-3">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-red-500" />
            <p className="font-semibold text-sm">{error}</p>
          </div>
          <p className="text-xs text-stone-600 dark:text-stone-400">
            Make sure your Gemini API key in `.env` is valid and your server is running.
          </p>
          <button
            onClick={() => fetchSummary(mode)}
            className="px-4 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 transition-transform active:scale-95 flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Retry Generation
          </button>
        </div>
      ) : summary ? (
        <div className="space-y-6">
          {/* Executive Summary Hero Card */}
          {(activeSectionFilter === 'all' || activeSectionFilter === 'keyPoints') && matchesSearch(summary.shortSummary) && (
            <div className="notion-card p-5 bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 dark:from-indigo-950 dark:via-purple-950 dark:to-blue-950 border-l-4 border-l-indigo-600 shadow-md relative overflow-hidden transition-all duration-300 hover:shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-xs text-indigo-800 dark:text-indigo-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-500 animate-bounce" /> Executive Summary
                </h4>
                <span className="text-[11px] font-medium text-stone-600 dark:text-stone-300 flex items-center gap-1 bg-white/80 dark:bg-stone-900/80 px-2.5 py-0.5 rounded-full border border-stone-200 dark:border-stone-700">
                  ⏱️ 3 min audio brief
                </span>
              </div>
              <p className="text-sm text-stone-900 dark:text-stone-100 font-medium leading-relaxed">
                {summary.shortSummary}
              </p>
            </div>
          )}

          {/* Visual Concept Diagram / Knowledge Map for this Summarization Page */}
          {(activeSectionFilter === 'all' || activeSectionFilter === 'diagram') && (
            <div className="notion-card p-5 space-y-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 dark:border-stone-800 pb-3">
                <div className="flex items-center gap-2">
                  <Network className="w-5 h-5 text-indigo-500" />
                  <div>
                    <h4 className="font-bold text-xs text-stone-900 dark:text-stone-100 uppercase tracking-wider">
                      Visual Knowledge Map & Concept Diagram
                    </h4>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400">
                      Automated architectural mindmap for this book summary
                    </p>
                  </div>
                </div>

                {/* Diagram Type Switcher */}
                <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 p-1 rounded-xl text-xs font-medium border border-stone-200 dark:border-stone-700">
                  <button
                    onClick={() => handleDiagramTypeChange('concept_map')}
                    className={`px-2.5 py-1 rounded-lg transition-colors ${
                      diagramType === 'concept_map'
                        ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 font-bold'
                        : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
                    }`}
                  >
                    🧠 Mindmap
                  </button>
                  <button
                    onClick={() => handleDiagramTypeChange('flowchart')}
                    className={`px-2.5 py-1 rounded-lg transition-colors ${
                      diagramType === 'flowchart'
                        ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 font-bold'
                        : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
                    }`}
                  >
                    🔀 Flowchart
                  </button>
                  <button
                    onClick={() => handleDiagramTypeChange('hierarchy')}
                    className={`px-2.5 py-1 rounded-lg transition-colors ${
                      diagramType === 'hierarchy'
                        ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 font-bold'
                        : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
                    }`}
                  >
                    🌳 Hierarchy
                  </button>
                  <button
                    onClick={() => handleDiagramTypeChange('process')}
                    className={`px-2.5 py-1 rounded-lg transition-colors ${
                      diagramType === 'process'
                        ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 font-bold'
                        : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
                    }`}
                  >
                    ⚡ Process
                  </button>
                </div>
              </div>

              {diagramLoading ? (
                <div className="p-8 text-center space-y-2">
                  <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-stone-500">Generating visual {diagramType} with Mermaid.js...</p>
                </div>
              ) : mermaidCode ? (
                <MermaidDiagram chart={mermaidCode} description={diagramDescription} />
              ) : null}
            </div>
          )}

          {/* Key Points & Chapters */}
          {(activeSectionFilter === 'all' || activeSectionFilter === 'keyPoints') &&
            summary.keyPoints &&
            summary.keyPoints.length > 0 && (
              <div className="notion-card p-5 space-y-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
                <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-2">
                  <h4 className="font-bold text-xs text-stone-800 dark:text-stone-200 uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Key Chapter Insights ({summary.keyPoints.length})
                  </h4>
                  <span className="text-[11px] text-stone-500 dark:text-stone-400">Click to focus</span>
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  {summary.keyPoints
                    .filter((pt) => matchesSearch(pt))
                    .map((pt, i) => (
                      <div
                        key={i}
                        style={{ animationDelay: `${i * 60}ms` }}
                        className="p-3.5 bg-stone-100 dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 flex items-start gap-3 hover:border-indigo-400 dark:hover:border-indigo-500 transition-all duration-200 hover:translate-x-1 animate-fade-in group shadow-2xs"
                      >
                        <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-mono text-xs font-bold flex items-center justify-center shrink-0 shadow-xs">
                          {i + 1}
                        </span>
                        <span className="text-xs text-stone-900 dark:text-stone-100 font-medium leading-relaxed pt-0.5">
                          {pt}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}

          {/* Important Concepts & Definitions Glossary */}
          {(activeSectionFilter === 'all' || activeSectionFilter === 'concepts') &&
            summary.importantConcepts &&
            summary.importantConcepts.length > 0 && (
              <div className="notion-card p-5 space-y-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
                {/* Header & Mastery Progress */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200 dark:border-stone-800 pb-3">
                  <h4 className="font-bold text-xs text-stone-800 dark:text-stone-200 uppercase tracking-wider flex items-center gap-2">
                    <Bookmark className="w-4 h-4 text-purple-500" /> Core Concept Glossary & Mastery ({totalConcepts})
                  </h4>

                  {/* Mastery Progress Bar */}
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-purple-700 dark:text-purple-300">
                      {masteredCount} of {totalConcepts} Mastered ({masteryPercentage}%)
                    </span>
                    <div className="w-24 h-2 bg-stone-200 dark:bg-stone-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 transition-all duration-500"
                        style={{ width: `${masteryPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Concepts Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {summary.importantConcepts
                    .filter((item) => matchesSearch(item.term) || matchesSearch(item.definition))
                    .map((item, i) => {
                      const isMastered = !!masteredConcepts[item.term];
                      const isAnalogyShown = !!expandedAnalogy[item.term];

                      return (
                        <div
                          key={i}
                          style={{ animationDelay: `${i * 70}ms` }}
                          className={`p-3.5 rounded-xl border transition-all duration-200 space-y-2 flex flex-col justify-between animate-fade-in ${
                            isMastered
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 shadow-xs'
                              : 'bg-stone-100 dark:bg-stone-800 border-stone-200 dark:border-stone-700 hover:border-purple-400 dark:hover:border-purple-500 hover:shadow-md'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-1.5">
                              <span className="font-bold text-xs text-stone-900 dark:text-stone-100 flex items-center gap-2">
                                <span
                                  className={`w-2 h-2 rounded-full ${
                                    isMastered ? 'bg-emerald-500' : 'bg-purple-500 animate-pulse'
                                  }`}
                                />
                                {item.term}
                              </span>

                              {/* Mastered Checkbox Button */}
                              <button
                                onClick={() => toggleConceptMastery(item.term)}
                                className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-colors flex items-center gap-1 ${
                                  isMastered
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-200 hover:bg-emerald-500 hover:text-white dark:hover:bg-emerald-600'
                                }`}
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                {isMastered ? 'Mastered' : 'Mark Mastered'}
                              </button>
                            </div>

                            <p className="text-xs text-stone-900 dark:text-stone-100 font-normal leading-relaxed pl-3 border-l-2 border-purple-500 dark:border-purple-400">
                              {item.definition}
                            </p>

                            {/* ELI5 Analogy Box */}
                            {isAnalogyShown && (
                              <div className="mt-2.5 p-2.5 bg-amber-100 dark:bg-amber-950/60 rounded-lg border border-amber-300 dark:border-amber-800 text-[11px] text-amber-950 dark:text-amber-100 space-y-1 animate-fade-in">
                                <span className="font-bold flex items-center gap-1">
                                  <Lightbulb className="w-3.5 h-3.5 text-amber-500" /> ELI5 Analogy
                                </span>
                                <p className="leading-snug">
                                  {item.analogy ||
                                    `Think of ${item.term} like building blocks in a structure where each block depends strictly on the foundation underneath.`}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Concept Footer Actions */}
                          <div className="flex items-center justify-between pt-2 border-t border-stone-200 dark:border-stone-700 text-[11px] font-medium">
                            <button
                              onClick={() =>
                                setExpandedAnalogy((prev) => ({ ...prev, [item.term]: !prev[item.term] }))
                              }
                              className="text-purple-700 dark:text-purple-300 font-semibold hover:underline flex items-center gap-1"
                            >
                              <Lightbulb className="w-3.5 h-3.5" />
                              {isAnalogyShown ? 'Hide Analogy' : 'Explain Simpler (ELI5)'}
                            </button>

                            <button
                              onClick={() => navigator.clipboard.writeText(`${item.term}: ${item.definition}`)}
                              className="text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
                            >
                              Copy Definition
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

          {/* Key Takeaways & Practical Applications Checklist */}
          {(activeSectionFilter === 'all' || activeSectionFilter === 'takeaways') && (
            <div className="notion-card p-5 space-y-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
              {/* Header & Checklist Progress */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200 dark:border-stone-800 pb-3">
                <h4 className="font-bold text-xs text-stone-800 dark:text-stone-200 uppercase tracking-wider flex items-center gap-2">
                  <ListTodo className="w-4 h-4 text-emerald-500" /> Actionable Takeaways & Checklist ({totalChecklistItems})
                </h4>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                    {checkedCount} of {totalChecklistItems} Applied ({checklistPercentage}%)
                  </span>
                  <div className="w-24 h-2 bg-stone-200 dark:bg-stone-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-500"
                      style={{ width: `${checklistPercentage}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Key Takeaways Column */}
                {summary.keyTakeaways && summary.keyTakeaways.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="font-bold text-xs text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                      💡 Key Insights & Takeaways
                    </h5>
                    <ul className="space-y-2">
                      {summary.keyTakeaways
                        .filter((tk) => matchesSearch(tk))
                        .map((tk, i) => {
                          const id = `tk_${i}`;
                          const isDone = !!completedTakeaways[id];
                          return (
                            <li
                              key={id}
                              onClick={() => toggleTakeawayCompletion(id)}
                              className={`p-3 rounded-xl border text-xs cursor-pointer transition-all duration-150 flex items-start gap-2.5 ${
                                isDone
                                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 line-through text-stone-400 dark:text-stone-500 font-medium'
                                  : 'bg-stone-100 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 font-medium hover:border-emerald-500'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isDone}
                                onChange={() => {}}
                                className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                              />
                              <span className="leading-relaxed">{tk}</span>
                            </li>
                          );
                        })}
                    </ul>
                  </div>
                )}

                {/* Practical Applications Column */}
                {summary.practicalApplications && summary.practicalApplications.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="font-bold text-xs text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                      🛠️ Real-World Implementation Guide
                    </h5>
                    <ul className="space-y-2">
                      {summary.practicalApplications
                        .filter((pa) => matchesSearch(pa))
                        .map((pa, i) => {
                          const id = `pa_${i}`;
                          const isDone = !!completedTakeaways[id];
                          return (
                            <li
                              key={id}
                              onClick={() => toggleTakeawayCompletion(id)}
                              className={`p-3 rounded-xl border text-xs cursor-pointer transition-all duration-150 flex items-start gap-2.5 ${
                                isDone
                                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 line-through text-stone-400 dark:text-stone-500 font-medium'
                                  : 'bg-stone-100 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 font-medium hover:border-emerald-500'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isDone}
                                onChange={() => {}}
                                className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                              />
                              <span className="leading-relaxed">{pa}</span>
                            </li>
                          );
                        })}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Interactive AI Follow-up & Q&A Box */}
          <div className="notion-card p-5 space-y-4 bg-gradient-to-r from-stone-50 via-indigo-50/30 to-purple-50/30 dark:from-stone-900 dark:via-indigo-950/30 dark:to-purple-950/30 border border-stone-200 dark:border-stone-700">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-2">
              <h4 className="font-bold text-xs text-stone-900 dark:text-stone-100 uppercase tracking-wider flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-indigo-500" /> Ask Follow-up Questions on this Summary
              </h4>
              <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">Instant Gemini Chat</span>
            </div>

            {/* Quick Prompt Chips */}
            <div className="flex flex-wrap gap-2">
              {[
                'Give me a real-world case study example',
                'What are common pitfalls or misunderstandings?',
                'Explain how this applies to modern software systems',
                'Generate a 3-question mini quiz'
              ].map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleFollowUpQuestion(chip)}
                  disabled={followUpLoading}
                  className="px-3 py-1 bg-white dark:bg-stone-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/80 border border-stone-300 dark:border-stone-700 text-stone-800 dark:text-stone-200 rounded-full text-xs font-semibold transition-all hover:border-indigo-400 active:scale-95 text-left disabled:opacity-50 shadow-2xs"
                >
                  ⚡ {chip}
                </button>
              ))}
            </div>

            {/* Custom Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={followUpQuestion}
                onChange={(e) => setFollowUpQuestion(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleFollowUpQuestion(followUpQuestion)}
                placeholder="Ask any follow-up question regarding this summary..."
                className="flex-1 text-xs px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
              />
              <button
                onClick={() => handleFollowUpQuestion(followUpQuestion)}
                disabled={followUpLoading || !followUpQuestion.trim()}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-transform active:scale-95 flex items-center gap-1.5 disabled:opacity-50 shadow-sm"
              >
                {followUpLoading ? (
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                Ask
              </button>
            </div>

            {/* Follow-up Q&A Thread */}
            {followUpAnswers.length > 0 && (
              <div className="space-y-3 pt-2">
                {followUpAnswers.map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-xl border space-y-2 shadow-xs animate-fade-in ${
                      item.err
                        ? 'bg-red-50 dark:bg-red-950/40 border-red-200 text-red-800 dark:text-red-200'
                        : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100'
                    }`}
                  >
                    <div className="font-bold text-xs text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> Q: {item.q}
                    </div>
                    <p className="text-xs leading-relaxed whitespace-pre-line font-medium pl-5 border-l-2 border-indigo-300 dark:border-indigo-700">
                      {item.a}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};
