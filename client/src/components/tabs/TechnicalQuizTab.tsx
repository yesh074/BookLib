import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Cpu, CheckCircle2, XCircle, AlertTriangle, RefreshCw, Trophy, BookOpen, ArrowRight } from 'lucide-react';
import type { Book, Quiz, QuizAttempt } from '../../types';
import { api } from '../../services/api';

interface TechnicalQuizTabProps {
  book: Book;
}

export const TechnicalQuizTab: React.FC<TechnicalQuizTabProps> = ({ book }) => {
  const [numQuestions, setNumQuestions] = useState<number>(5);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateQuiz = async () => {
    setLoading(true);
    setError(null);
    setQuiz(null);
    setAttempt(null);
    setUserAnswers({});
    try {
      const res = await api.generateQuiz(book._id, numQuestions, difficulty);
      setQuiz(res);
    } catch (err: any) {
      setError(err.message || 'Failed to generate technical quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (qId: string, option: string) => {
    setUserAnswers(prev => ({ ...prev, [qId]: option }));
  };

  const handleSubmitQuiz = async () => {
    if (!quiz || !quiz._id) return;

    setSubmitting(true);
    try {
      const res = await api.submitQuiz(book._id, quiz._id, userAnswers);
      setAttempt(res.attempt);
      
      // Confetti burst if score > 70%
      const percentage = (res.attempt.score / res.attempt.totalQuestions) * 100;
      if (percentage >= 70) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Quiz Config Header */}
      <div className="notion-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-indigo-500" />
            <div>
              <h3 className="font-semibold text-sm text-stone-900 dark:text-stone-100">Technical Quiz & Mastery Assessment</h3>
              <p className="text-[11px] text-stone-400">Generate MCQ, True/False & Scenario questions from book content</p>
            </div>
          </div>

          {!quiz && (
            <button
              onClick={handleGenerateQuiz}
              disabled={loading}
              className="px-4 py-2 bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 text-xs font-semibold rounded-md flex items-center gap-2 shadow-xs"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  <span>Generating Quiz...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Generate Quiz</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Options controls */}
        {!quiz && (
          <div className="pt-3 border-t border-stone-200 dark:border-stone-800 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-stone-500 font-medium mb-1">Number of Questions</label>
              <div className="flex gap-2">
                {[5, 10, 20].map(n => (
                  <button
                    key={n}
                    onClick={() => setNumQuestions(n)}
                    className={`flex-1 py-1.5 rounded font-medium border text-center transition-colors ${
                      numQuestions === n
                        ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 border-stone-900 dark:border-stone-100'
                        : 'bg-stone-100 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300'
                    }`}
                  >
                    {n} Questions
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-stone-500 font-medium mb-1">Difficulty Level</label>
              <div className="flex gap-2">
                {(['easy', 'medium', 'hard'] as const).map(d => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`flex-1 py-1.5 rounded font-medium border capitalize text-center transition-colors ${
                      difficulty === d
                        ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 border-stone-900 dark:border-stone-100'
                        : 'bg-stone-100 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-700 rounded text-xs">
          {error}
        </div>
      )}

      {/* Active Quiz Player */}
      {quiz && !attempt && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between text-xs text-stone-500 font-mono px-1">
            <span>{quiz.title} ({quiz.difficulty.toUpperCase()})</span>
            <span>{Object.keys(userAnswers).length} of {quiz.questions.length} answered</span>
          </div>

          <div className="space-y-4">
            {quiz.questions.map((q, idx) => (
              <div key={q.id || idx} className="notion-card p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <h4 className="font-semibold text-xs text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300 font-mono text-[10px] flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span>{q.question}</span>
                  </h4>
                  {q.topic && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-300 font-mono shrink-0">
                      {q.topic}
                    </span>
                  )}
                </div>

                {/* Options List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                  {q.options.map(opt => {
                    const isSelected = userAnswers[q.id] === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleOptionSelect(q.id, opt)}
                        className={`text-left p-2.5 rounded-md border font-medium transition-all ${
                          isSelected
                            ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-500 text-indigo-900 dark:text-indigo-200 ring-1 ring-indigo-500'
                            : 'bg-stone-50 dark:bg-stone-800/60 border-stone-200 dark:border-stone-700/60 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300'
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Submit Quiz Action */}
          <div className="flex justify-between items-center pt-2">
            <button
              onClick={() => setQuiz(null)}
              className="px-4 py-2 rounded bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitQuiz}
              disabled={submitting || Object.keys(userAnswers).length < quiz.questions.length}
              className="px-5 py-2 rounded bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-2 shadow-xs"
            >
              {submitting ? 'Evaluating...' : 'Submit Answers for Grading'}
            </button>
          </div>
        </div>
      )}

      {/* Quiz Attempt Results View */}
      {attempt && quiz && (
        <div className="space-y-5 animate-fade-in">
          {/* Score Hero Banner */}
          <div className="notion-card p-6 bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-amber-400 dark:text-amber-600 font-semibold text-xs">
                <Trophy className="w-5 h-5" /> Quiz Results
              </div>
              <h2 className="text-2xl font-bold font-mono">
                {attempt.score} / {attempt.totalQuestions} Correct ({Math.round((attempt.score / attempt.totalQuestions) * 100)}%)
              </h2>
              <p className="text-xs opacity-80">
                Completed on {new Date(attempt.completedAt || Date.now()).toLocaleDateString()}
              </p>
            </div>

            <button
              onClick={handleGenerateQuiz}
              className="px-4 py-2 rounded bg-white text-stone-900 hover:bg-stone-100 dark:bg-stone-900 dark:text-white dark:hover:bg-stone-800 text-xs font-semibold flex items-center gap-2 shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Retake Quiz
            </button>
          </div>

          {/* Weak Topics Banner */}
          {attempt.weakTopics && attempt.weakTopics.length > 0 && (
            <div className="notion-card p-4 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900 space-y-2">
              <h4 className="font-semibold text-xs text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" /> Weak Topics Detected
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {attempt.weakTopics.map(t => (
                  <span key={t} className="px-2 py-0.5 bg-amber-200/60 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 rounded text-[11px] font-medium">
                    {t}
                  </span>
                ))}
              </div>
              {attempt.recommendedTopics && attempt.recommendedTopics.length > 0 && (
                <ul className="text-xs text-amber-800 dark:text-amber-300 list-disc pl-4 space-y-1 pt-1">
                  {attempt.recommendedTopics.map((rec, i) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Detailed Question Review */}
          <div className="space-y-3">
            <h4 className="font-semibold text-xs text-stone-500 uppercase tracking-wider">Detailed Answer Explanations</h4>
            {quiz.questions.map((q, idx) => {
              const userAns = userAnswers[q.id] || '';
              const isCorrect = userAns.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();

              return (
                <div
                  key={q.id}
                  className={`notion-card p-4 space-y-2 border-l-4 ${
                    isCorrect ? 'border-l-emerald-500' : 'border-l-red-500'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h5 className="font-semibold text-xs text-stone-900 dark:text-stone-100 flex items-center gap-2">
                      {isCorrect ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                      )}
                      <span>{idx + 1}. {q.question}</span>
                    </h5>
                  </div>

                  <div className="text-xs space-y-1 pl-6">
                    <p className={isCorrect ? 'text-emerald-700 dark:text-emerald-400 font-medium' : 'text-red-700 dark:text-red-400 font-medium'}>
                      Your Answer: {userAns || '(No Answer)'}
                    </p>
                    {!isCorrect && (
                      <p className="text-emerald-700 dark:text-emerald-400 font-medium">
                        Correct Answer: {q.correctAnswer}
                      </p>
                    )}
                    {q.explanation && (
                      <p className="text-stone-500 dark:text-stone-400 italic pt-1 border-t border-stone-100 dark:border-stone-800">
                        💡 {q.explanation}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
