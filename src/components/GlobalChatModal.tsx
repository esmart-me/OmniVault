import React, { useState } from 'react';
import { 
  X, 
  Send, 
  Sparkles, 
  MessageSquareText
} from 'lucide-react';
import { LifeAdminItem } from '../types/document';

interface GlobalChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: LifeAdminItem[];
  onInspectItem: (item: LifeAdminItem) => void;
}

export const GlobalChatModal: React.FC<GlobalChatModalProps> = ({
  isOpen,
  onClose,
  items,
  onInspectItem,
}) => {
  if (!isOpen) return null;

  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    {
      role: 'assistant',
      text: `Hello! I am your Life-Admin Assistant. You have ${items.length} active records (Credit Card bills, Birthdays, Passports, Insurance policies, and Warranties). You can ask me anything about payment deadlines, countdowns, or gift planning!`,
    },
  ]);

  const promptSuggestions = [
    "When is my HDFC credit card bill due?",
    "How many days until Rahul's birthday?",
    "Show all items due or expiring in the next 30 days",
    "What is the total credit card amount due?",
  ];

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || question;
    if (!textToSend.trim() || loading) return;

    setQuestion('');
    setMessages(prev => [...prev, { role: 'user', text: textToSend.trim() }]);
    setLoading(true);

    try {
      const vaultSummary = items.map(d => ({
        id: d.id,
        category: d.category,
        name: d.document_or_event_name,
        person: d.holder_or_person_name,
        primary_id: d.identification_numbers.primary_id,
        financial: d.financial_details,
        dates: d.important_dates,
        countdown: d.countdown_calculations,
        action: d.action_required,
        summary: d.user_friendly_summary,
      }));

      const res = await fetch('/api/ask-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: textToSend.trim(),
          vaultSummary,
        }),
      });

      const data = await res.json();
      setMessages(prev => [
        ...prev,
        { role: 'assistant', text: data.answer || 'No answer received.' },
      ]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', text: 'Error contacting assistant: ' + err.message },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[650px] max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400">
              <MessageSquareText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Ask Life-Admin Assistant
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                  Life-Admin Engine
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Instant answers on due dates, birthday ages, and payment minimums
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Thread */}
        <div className="p-5 overflow-y-auto flex-1 space-y-3.5">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-medium'
                    : 'bg-slate-950 border border-slate-800 text-slate-200 shadow-sm'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 text-xs text-slate-400 flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-emerald-400 animate-spin" />
                <span>Checking records & calculating days countdown...</span>
              </div>
            </div>
          )}
        </div>

        {/* Suggestion Chips */}
        <div className="px-5 py-2 bg-slate-950/40 border-t border-slate-800/60 overflow-x-auto flex items-center gap-2 no-scrollbar">
          <span className="text-[10px] uppercase font-bold text-slate-500 shrink-0">Try:</span>
          {promptSuggestions.map((s, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(s)}
              className="text-[11px] whitespace-nowrap px-3 py-1 rounded-full bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 transition shrink-0"
            >
              {s}
            </button>
          ))}
        </div>

        {/* Input */}
        <form
          onSubmit={e => { e.preventDefault(); handleSend(); }}
          className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center gap-2"
        >
          <input
            type="text"
            value={question}
            onChange={e => setQuestion(e.target.value)}
            placeholder="Ask about bills, countdowns, birthdays, or renewals..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-cyan-500 text-xs text-white placeholder-slate-500 outline-none transition"
          />
          <button
            type="submit"
            disabled={loading || !question.trim()}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Ask</span>
          </button>
        </form>
      </div>
    </div>
  );
};
