import React, { useState, useEffect } from 'react';
import { Layers, ChevronLeft, ChevronRight, RotateCcw, Shuffle, CheckCircle, Sparkles } from 'lucide-react';
import type { Book, FlashcardDeck, FlashcardItem } from '../../types';
import { api } from '../../services/api';

interface FlashcardsTabProps {
  book: Book;
}

export const FlashcardsTab: React.FC<FlashcardsTabProps> = ({ book }) => {
  const [deck, setDeck] = useState<FlashcardDeck | null>(null);
  const [cards, setCards] = useState<FlashcardItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredIds, setMasteredIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCards = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getFlashcards(book._id);
      setDeck(res);
      setCards(res.cards || []);
      setCurrentIndex(0);
      setIsFlipped(false);
    } catch (err: any) {
      setError(err.message || 'Failed to generate flashcards');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, [book._id]);

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex(prev => (prev + 1) % Math.max(1, cards.length));
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex(prev => (prev - 1 + cards.length) % Math.max(1, cards.length));
  };

  const handleShuffle = () => {
    setIsFlipped(false);
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentIndex(0);
  };

  const toggleMastered = (id: string) => {
    setMasteredIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const currentCard = cards[currentIndex];

  return (
    <div className="space-y-4">
      {/* Header controls */}
      <div className="notion-card p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-500" />
          <div>
            <h3 className="font-semibold text-sm text-stone-900 dark:text-stone-100">Interactive Flashcard Deck</h3>
            <p className="text-[11px] text-stone-400">Master key terms and principles with spaced revision</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShuffle}
            disabled={cards.length <= 1}
            className="px-2.5 py-1.5 rounded bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-xs font-medium flex items-center gap-1.5"
          >
            <Shuffle className="w-3.5 h-3.5" /> Shuffle
          </button>
          <button
            onClick={fetchCards}
            disabled={loading}
            className="px-2.5 py-1.5 rounded bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 text-xs font-medium flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" /> Regenerate Deck
          </button>
        </div>
      </div>

      {loading ? (
        <div className="notion-card p-12 text-center space-y-2">
          <div className="w-7 h-7 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-stone-500">Generating flashcards deck with Gemini AI...</p>
        </div>
      ) : error ? (
        <div className="notion-card p-4 bg-red-50 text-red-700 text-xs">
          {error}
        </div>
      ) : currentCard ? (
        <div className="space-y-4 animate-fade-in max-w-xl mx-auto">
          {/* Card Counter */}
          <div className="flex items-center justify-between text-xs text-stone-400 font-mono px-1">
            <span>
              Card {currentIndex + 1} of {cards.length}
            </span>
            <span>Mastered: {masteredIds.size} / {cards.length}</span>
          </div>

          {/* 3D Flip Card Container */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="perspective-1000 h-72 cursor-pointer"
          >
            <div
              className={`relative w-full h-full duration-300 transform-style-3d transition-transform ${
                isFlipped ? 'rotate-y-180' : ''
              }`}
            >
              {/* FRONT OF CARD */}
              <div className="absolute inset-0 notion-card p-8 flex flex-col justify-between backface-hidden bg-gradient-to-br from-stone-50 to-white dark:from-stone-900 dark:to-stone-850">
                <div className="flex items-center justify-between text-[11px] text-stone-400 font-mono">
                  <span>{currentCard.category || 'Concept'}</span>
                  <span>Click to Flip 🔄</span>
                </div>
                <div className="text-center font-semibold text-stone-900 dark:text-stone-100 text-base sm:text-lg">
                  {currentCard.front}
                </div>
                <div className="text-right text-[10px] text-stone-400 uppercase tracking-wider">
                  Front
                </div>
              </div>

              {/* BACK OF CARD */}
              <div className="absolute inset-0 notion-card p-8 flex flex-col justify-between backface-hidden rotate-y-180 bg-indigo-50/50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-900">
                <div className="flex items-center justify-between text-[11px] text-indigo-600 dark:text-indigo-400 font-mono">
                  <span>Answer / Explanation</span>
                  <span>Click to Flip 🔄</span>
                </div>
                <div className="text-stone-800 dark:text-stone-200 text-xs sm:text-sm leading-relaxed text-center font-medium">
                  {currentCard.back}
                </div>
                <div className="text-right text-[10px] text-indigo-400 uppercase tracking-wider">
                  Back
                </div>
              </div>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={handlePrev}
              className="px-4 py-2 rounded-md bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 text-xs font-medium flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>

            <button
              onClick={() => toggleMastered(currentCard.id)}
              className={`px-4 py-2 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors ${
                masteredIds.has(currentCard.id)
                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300'
                  : 'bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300'
              }`}
            >
              <CheckCircle className={`w-4 h-4 ${masteredIds.has(currentCard.id) ? 'fill-emerald-500 text-white' : ''}`} />
              <span>{masteredIds.has(currentCard.id) ? 'Mastered!' : 'Mark Mastered'}</span>
            </button>

            <button
              onClick={handleNext}
              className="px-4 py-2 rounded-md bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 text-xs font-medium flex items-center gap-1"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};
