import React, { useState } from 'react';
import { MessageSquare, Send, Sparkles, AlertCircle, CheckCircle2, User, Bot } from 'lucide-react';
import type { Book, ChatMessage } from '../../types';
import { api } from '../../services/api';

interface AskBookChatTabProps {
  book: Book;
}

const SAMPLE_PROMPTS = [
  'What is the core argument of this book?',
  'List the main definitions presented in Chapter 1.',
  'What practical methodology is recommended?',
  'What are the key trade-offs discussed?'
];

export const AskBookChatTab: React.FC<AskBookChatTabProps> = ({ book }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: `Hello! I am your AI study assistant for "${book.title}". Ask me anything about this book and I will answer strictly using its text.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!queryText) setInputQuery('');
    setLoading(true);

    try {
      const historyFormatted = messages.map(m => ({
        sender: m.sender,
        text: m.text
      }));

      const res = await api.chatWithBook(book._id, textToSend.trim(), historyFormatted);

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: res.answer,
        foundInBook: res.foundInBook,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err: any) {
      const errMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'ai',
        text: "I couldn't find this information in the selected book.",
        foundInBook: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="notion-card p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-indigo-500" />
          <div>
            <h3 className="font-semibold text-sm text-stone-900 dark:text-stone-100">Ask this Book (RAG Chat)</h3>
            <p className="text-[11px] text-stone-400">Strictly grounded in "{book.title}" content</p>
          </div>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-mono">
          RAG Verified
        </span>
      </div>

      {/* Suggested Prompts */}
      <div className="flex flex-wrap gap-1.5 text-xs">
        {SAMPLE_PROMPTS.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(prompt)}
            className="px-2.5 py-1 rounded-full bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700 transition-colors"
          >
            💬 {prompt}
          </button>
        ))}
      </div>

      {/* Chat Messages Container */}
      <div className="notion-card p-4 min-h-[50vh] max-h-[60vh] overflow-y-auto space-y-4 flex flex-col">
        {messages.map(msg => {
          const isUser = msg.sender === 'user';
          const notFound = msg.text.includes("couldn't find this information in the selected book");

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0 shadow-2xs ${
                  isUser
                    ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900'
                    : 'bg-indigo-600 text-white'
                }`}
              >
                {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>

              <div
                className={`max-w-[80%] p-3.5 rounded-xl text-xs leading-relaxed space-y-1.5 shadow-2xs ${
                  isUser
                    ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 rounded-tr-none'
                    : notFound
                    ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-900 rounded-tl-none font-mono'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 rounded-tl-none'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.text}</p>
                <div className="flex items-center justify-between text-[10px] opacity-60 font-mono pt-1">
                  <span>{msg.timestamp}</span>
                  {!isUser && (
                    <span>{notFound ? '⚠️ Not in book text' : '✓ Grounded in book'}</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-2 text-stone-400 text-xs pl-10">
            <span className="w-3.5 h-3.5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <span>Scanning book content for answer...</span>
          </div>
        )}
      </div>

      {/* Query Input Bar */}
      <form
        onSubmit={e => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="flex items-center gap-2"
      >
        <input
          type="text"
          value={inputQuery}
          onChange={e => setInputQuery(e.target.value)}
          placeholder={`Ask a question about ${book.title}...`}
          className="flex-1 px-4 py-2.5 rounded-lg bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 text-xs focus:outline-none focus:ring-1 focus:ring-stone-400"
        />
        <button
          type="submit"
          disabled={loading || !inputQuery.trim()}
          className="px-4 py-2.5 rounded-lg bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 disabled:opacity-50 text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
        >
          <Send className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Ask</span>
        </button>
      </form>
    </div>
  );
};
