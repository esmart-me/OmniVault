import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Code2, 
  Info, 
  Calendar, 
  User, 
  Fingerprint, 
  CalendarPlus, 
  MessageSquare, 
  Send, 
  Edit3, 
  Save, 
  Sparkles,
  CreditCard,
  DollarSign,
  Clock,
  Zap,
  Cake,
  Shield
} from 'lucide-react';
import { LifeAdminItem, LifeAdminExtractionResult } from '../types/document';
import { getItemStatusInfo } from '../utils/storage';
import { downloadCalendarReminder } from '../utils/calendar';

interface DocumentInspectorModalProps {
  item: LifeAdminItem | null;
  initialTab?: 'structured' | 'json' | 'chat';
  onClose: () => void;
  onUpdateItem: (updated: LifeAdminItem) => void;
}

export const DocumentInspectorModal: React.FC<DocumentInspectorModalProps> = ({
  item,
  initialTab = 'structured',
  onClose,
  onUpdateItem,
}) => {
  if (!item) return null;

  const [activeTab, setActiveTab] = useState<'structured' | 'json' | 'chat'>(initialTab);
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<LifeAdminItem>({ ...item });

  // Chat state
  const [chatQuestion, setChatQuestion] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    {
      role: 'assistant',
      text: `Hello! I have analyzed "${item.document_or_event_name}". You can ask any question regarding due amounts, minimum payments, birthday milestones, or renewal steps.`,
    },
  ]);

  const { status, label, badgeClass, days } = getItemStatusInfo(item);

  // Exact JSON schema representation as requested by the user prompt
  const pureExtractionJson: LifeAdminExtractionResult = {
    entry_type: item.entry_type,
    category: item.category,
    document_or_event_name: item.document_or_event_name,
    holder_or_person_name: item.holder_or_person_name,
    identification_numbers: {
      primary_id: item.identification_numbers.primary_id,
      secondary_id: item.identification_numbers.secondary_id,
    },
    financial_details: {
      total_amount_due: item.financial_details.total_amount_due,
      minimum_amount_due: item.financial_details.minimum_amount_due,
    },
    important_dates: {
      issue_date_or_dob: item.important_dates.issue_date_or_dob,
      expiry_date_or_due_date: item.important_dates.expiry_date_or_due_date,
    },
    countdown_calculations: {
      days_remaining_countdown: item.countdown_calculations.days_remaining_countdown,
      status_flag: item.countdown_calculations.status_flag,
    },
    user_friendly_summary: item.user_friendly_summary,
    action_required: item.action_required,
  };

  const jsonString = JSON.stringify(pureExtractionJson, null, 2);

  const handleCopyJson = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveEdit = () => {
    onUpdateItem({
      ...editForm,
      updated_at: new Date().toISOString(),
    });
    setIsEditing(false);
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatQuestion.trim() || chatLoading) return;

    const userText = chatQuestion.trim();
    setChatQuestion('');
    setChatMessages(prev => [...prev, { role: 'user', text: userText }]);
    setChatLoading(true);

    try {
      const res = await fetch('/api/ask-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: userText,
          documentContext: pureExtractionJson,
        }),
      });
      const data = await res.json();
      setChatMessages(prev => [...prev, { role: 'assistant', text: data.answer || 'No response.' }]);
    } catch (err: any) {
      setChatMessages(prev => [...prev, { role: 'assistant', text: 'Error contacting assistant: ' + err.message }]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-800 border border-slate-700/60 flex items-center justify-center text-emerald-400">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {item.category}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                  {item.entry_type}
                </span>
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${badgeClass}`}>
                  {label}
                </span>
              </div>
              <h2 className="text-lg font-bold text-white mt-1 line-clamp-1">
                {item.document_or_event_name}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => downloadCalendarReminder(item)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-750 border border-slate-700 transition"
              title="Download Calendar Reminder (.ics)"
            >
              <CalendarPlus className="w-4 h-4 text-emerald-400" />
              <span>Add to Calendar</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent hover:border-slate-700 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 pt-3 border-b border-slate-800 bg-slate-950/30 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => setActiveTab('structured')}
              className={`pb-3 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition ${
                activeTab === 'structured'
                  ? 'border-emerald-400 text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Info className="w-4 h-4" />
              <span>Extracted Intelligence</span>
            </button>
            <button
              onClick={() => setActiveTab('json')}
              className={`pb-3 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition ${
                activeTab === 'json'
                  ? 'border-cyan-400 text-cyan-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Code2 className="w-4 h-4" />
              <span>Pure Output JSON</span>
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`pb-3 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition ${
                activeTab === 'chat'
                  ? 'border-indigo-400 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Ask Assistant</span>
            </button>
          </div>

          {activeTab === 'structured' && (
            <button
              onClick={() => {
                if (isEditing) handleSaveEdit();
                else setIsEditing(true);
              }}
              className={`mb-2 flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold transition ${
                isEditing
                  ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              {isEditing ? <Save className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
              <span>{isEditing ? 'Save Changes' : 'Edit Fields'}</span>
            </button>
          )}

          {activeTab === 'json' && (
            <button
              onClick={handleCopyJson}
              className="mb-2 flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied Pure JSON!' : 'Copy Pure JSON'}</span>
            </button>
          )}
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'structured' && (
            <div className="space-y-6">
              {/* Summary & Action Banner */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-400 uppercase tracking-wider">User-Friendly Summary:</span>
                  <span className="font-bold text-emerald-300 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                    Action: {item.action_required}
                  </span>
                </div>
                <p className="text-sm text-slate-200 font-medium leading-relaxed">
                  {item.user_friendly_summary}
                </p>
              </div>

              {/* Grid of Sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Identification & Person */}
                <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800/80 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <User className="w-4 h-4 text-cyan-400" />
                    Person & Name
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-slate-500">Document / Event Name:</span>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.document_or_event_name}
                          onChange={e => setEditForm({ ...editForm, document_or_event_name: e.target.value })}
                          className="w-full mt-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white"
                        />
                      ) : (
                        <p className="font-semibold text-slate-200 mt-0.5">{item.document_or_event_name}</p>
                      )}
                    </div>
                    <div>
                      <span className="text-slate-500">Holder / Person Name:</span>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.holder_or_person_name || ''}
                          onChange={e => setEditForm({ ...editForm, holder_or_person_name: e.target.value || null })}
                          className="w-full mt-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white"
                        />
                      ) : (
                        <p className="font-semibold text-slate-200 mt-0.5">{item.holder_or_person_name || <span className="text-slate-500 italic">null</span>}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* 2. Identification Numbers */}
                <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800/80 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <Fingerprint className="w-4 h-4 text-emerald-400" />
                    Identification Numbers
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-slate-500">Primary ID (Passport, Policy, Card Last 4):</span>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.identification_numbers.primary_id || ''}
                          onChange={e => setEditForm({
                            ...editForm,
                            identification_numbers: { ...editForm.identification_numbers, primary_id: e.target.value || null }
                          })}
                          className="w-full mt-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono"
                        />
                      ) : (
                        <p className="font-mono font-bold text-emerald-300 mt-0.5 select-all">
                          {item.identification_numbers.primary_id || <span className="text-slate-500 italic font-sans font-normal">null</span>}
                        </p>
                      )}
                    </div>
                    <div>
                      <span className="text-slate-500">Secondary ID (Sub-account, Class, Serial):</span>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.identification_numbers.secondary_id || ''}
                          onChange={e => setEditForm({
                            ...editForm,
                            identification_numbers: { ...editForm.identification_numbers, secondary_id: e.target.value || null }
                          })}
                          className="w-full mt-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono"
                        />
                      ) : (
                        <p className="font-mono text-slate-300 mt-0.5">
                          {item.identification_numbers.secondary_id || <span className="text-slate-500 italic font-sans font-normal">null</span>}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* 3. Financial Details */}
                <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800/80 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-amber-400" />
                    Financial & Bill Details
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Total Amount Due:</span>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.financial_details.total_amount_due || ''}
                          onChange={e => setEditForm({
                            ...editForm,
                            financial_details: { ...editForm.financial_details, total_amount_due: e.target.value || null }
                          })}
                          className="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-amber-300 font-mono text-xs w-36"
                          placeholder="e.g. ₹5,000"
                        />
                      ) : (
                        <span className="font-mono font-bold text-amber-300">
                          {item.financial_details.total_amount_due || 'null'}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between border-t border-slate-800/60 pt-1.5">
                      <span className="text-slate-500">Minimum Amount Due:</span>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.financial_details.minimum_amount_due || ''}
                          onChange={e => setEditForm({
                            ...editForm,
                            financial_details: { ...editForm.financial_details, minimum_amount_due: e.target.value || null }
                          })}
                          className="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-slate-300 font-mono text-xs w-36"
                          placeholder="e.g. ₹500"
                        />
                      ) : (
                        <span className="font-mono text-slate-300">
                          {item.financial_details.minimum_amount_due || 'null'}
                        </span>
                      )}
                    </div>

                    {/* Recurrence Frequency */}
                    <div className="flex items-center justify-between border-t border-slate-800/60 pt-1.5">
                      <span className="text-slate-500">Recurrence Frequency:</span>
                      {isEditing ? (
                        <select
                          value={editForm.recurring?.frequency || editForm.financial_details.recurring?.frequency || 'none'}
                          onChange={e => {
                            const freq = e.target.value as any;
                            const rec = { ...(editForm.recurring || { auto_schedule_next: true }), frequency: freq };
                            setEditForm({
                              ...editForm,
                              recurring: rec,
                              financial_details: { ...editForm.financial_details, recurring: rec }
                            });
                          }}
                          className="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-emerald-300 font-semibold text-xs"
                        >
                          <option value="none">One-Time (None)</option>
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                          <option value="quarterly">Quarterly</option>
                          <option value="yearly">Yearly</option>
                        </select>
                      ) : (
                        <span className="font-semibold text-emerald-300 uppercase text-[11px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          🔁 {item.recurring?.frequency || item.financial_details.recurring?.frequency || 'One-Time'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* 4. Dates & Countdown Calculations */}
                <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800/80 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-purple-400" />
                    Important Dates & Countdown
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Issue Date or DOB:</span>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.important_dates.issue_date_or_dob || ''}
                          onChange={e => setEditForm({
                            ...editForm,
                            important_dates: { ...editForm.important_dates, issue_date_or_dob: e.target.value || null }
                          })}
                          className="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-white font-mono text-xs w-32"
                          placeholder="YYYY-MM-DD"
                        />
                      ) : (
                        <span className="font-mono text-slate-300">{item.important_dates.issue_date_or_dob || 'null'}</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Expiry, Due, or Next Birthday:</span>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.important_dates.expiry_date_or_due_date || ''}
                          onChange={e => setEditForm({
                            ...editForm,
                            important_dates: { ...editForm.important_dates, expiry_date_or_due_date: e.target.value || null }
                          })}
                          className="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-white font-mono text-xs w-32"
                          placeholder="YYYY-MM-DD"
                        />
                      ) : (
                        <span className="font-mono font-bold text-white">{item.important_dates.expiry_date_or_due_date || 'null'}</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between border-t border-slate-800/60 pt-1.5">
                      <span className="text-amber-400 font-semibold">Days Remaining Countdown:</span>
                      <span className="font-mono font-bold text-amber-300">
                        {item.countdown_calculations.days_remaining_countdown !== null
                          ? `${item.countdown_calculations.days_remaining_countdown} days (${item.countdown_calculations.status_flag})`
                          : 'null'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Raw input text */}
              {item.raw_input_text && (
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-slate-400">Original User Input / Document Text:</span>
                  <pre className="text-xs font-mono text-slate-300 bg-slate-900 p-3 rounded-xl overflow-x-auto whitespace-pre-wrap max-h-40">
                    {item.raw_input_text}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* Pure JSON Tab */}
          {activeTab === 'json' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Strict Pure JSON conforming directly to the Life-Admin Assistant output schema:</span>
                <span className="font-mono text-cyan-400">application/json</span>
              </div>
              <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-400 overflow-x-auto leading-relaxed max-h-[500px]">
                {jsonString}
              </pre>
            </div>
          )}

          {/* Chat Tab */}
          {activeTab === 'chat' && (
            <div className="flex flex-col h-[460px] justify-between">
              <div className="space-y-3 overflow-y-auto pr-2 flex-1">
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-medium'
                          : 'bg-slate-950 border border-slate-800 text-slate-200'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs text-slate-400 flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                      Analyzing with Life-Admin Engine...
                    </div>
                  </div>
                )}
              </div>

              <form onSubmit={handleSendChat} className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-2">
                <input
                  type="text"
                  value={chatQuestion}
                  onChange={e => setChatQuestion(e.target.value)}
                  placeholder="Ask a question (e.g. When is the minimum payment due?)"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 text-xs text-white placeholder-slate-500 outline-none transition"
                />
                <button
                  type="submit"
                  disabled={chatLoading || !chatQuestion.trim()}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
