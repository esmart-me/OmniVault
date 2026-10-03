import React, { useState } from 'react';
import { 
  X, 
  CreditCard, 
  DollarSign, 
  Calendar, 
  AlertTriangle, 
  Share2, 
  Copy, 
  Check, 
  Sparkles, 
  TrendingDown, 
  Clock, 
  ArrowUpRight, 
  QrCode,
  Repeat,
  CalendarDays,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import { LifeAdminItem, RecurrenceFrequency } from '../types/document';
import { 
  getProjectedFinancialRunRate, 
  advanceRecurringBill, 
  getFutureOccurrences 
} from '../utils/recurringService';

interface FinancialSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: LifeAdminItem[];
  onInspectItem: (item: LifeAdminItem) => void;
  onPayUpi?: (item: LifeAdminItem) => void;
  onUpdateItem?: (item: LifeAdminItem) => void;
}

export const FinancialSummaryModal: React.FC<FinancialSummaryModalProps> = ({
  isOpen,
  onClose,
  items,
  onInspectItem,
  onPayUpi,
  onUpdateItem,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'recurring'>('all');
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Filter bills and credit cards
  const billItems = items.filter(
    item =>
      item.category === 'Credit Card Bill' ||
      Boolean(item.financial_details.total_amount_due) ||
      (item.recurring?.frequency && item.recurring.frequency !== 'none')
  );

  const recurringItems = billItems.filter(item => {
    const freq = item.recurring?.frequency || item.financial_details.recurring?.frequency;
    return freq && freq !== 'none';
  });

  const { monthlyRunRate, annualProjected, recurringCount } = getProjectedFinancialRunRate(items);

  // Parse numerical amounts for summary
  let totalOutstandingNumber = 0;
  let totalMinDueNumber = 0;

  billItems.forEach(item => {
    const rawTotal = item.financial_details.total_amount_due;
    if (rawTotal) {
      const cleaned = rawTotal.replace(/[^0-9.]/g, '');
      const val = parseFloat(cleaned);
      if (!isNaN(val)) totalOutstandingNumber += val;
    }

    const rawMin = item.financial_details.minimum_amount_due;
    if (rawMin) {
      const cleaned = rawMin.replace(/[^0-9.]/g, '');
      const val = parseFloat(cleaned);
      if (!isNaN(val)) totalMinDueNumber += val;
    }
  });

  const formattedTotal = totalOutstandingNumber > 0 ? `₹${totalOutstandingNumber.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '₹0.00';
  const formattedMin = totalMinDueNumber > 0 ? `₹${totalMinDueNumber.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '₹0.00';

  const shareText = `💳 OmniVault Payment Schedule:\n` +
    `Total Outstanding: ${formattedTotal}\n` +
    `Total Minimum Due: ${formattedMin}\n` +
    `Projected Monthly Run-rate: ₹${monthlyRunRate.toLocaleString('en-IN')}\n\n` +
    billItems.map(b => `• ${b.document_or_event_name}: ${b.financial_details.total_amount_due || 'N/A'} (Due: ${b.important_dates.expiry_date_or_due_date || 'N/A'}, Card: ${b.identification_numbers.primary_id || 'N/A'})`).join('\n');

  const handleCopySchedule = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAdvanceCycle = (bill: LifeAdminItem) => {
    const updated = advanceRecurringBill(bill, {
      amount: bill.financial_details.total_amount_due || '₹0',
      utr: 'Manual-cycle-roll',
    });
    if (onUpdateItem) {
      onUpdateItem(updated);
    }
    setNotificationMsg(`Advanced ${bill.document_or_event_name} to next cycle (${updated.important_dates.expiry_date_or_due_date}) with 'Upcoming' status!`);
    setTimeout(() => setNotificationMsg(null), 3500);
  };

  const handleFrequencyChange = (bill: LifeAdminItem, newFreq: RecurrenceFrequency) => {
    const updated: LifeAdminItem = {
      ...bill,
      recurring: {
        ...(bill.recurring || { auto_schedule_next: true }),
        frequency: newFreq,
      },
      financial_details: {
        ...bill.financial_details,
        recurring: {
          ...(bill.financial_details.recurring || { auto_schedule_next: true }),
          frequency: newFreq,
        },
      },
    };
    if (onUpdateItem) {
      onUpdateItem(updated);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-xl overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900/95 border border-slate-800/80 rounded-3xl shadow-2xl backdrop-blur-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800/80 bg-slate-950/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Bill & Recurring Payment Hub</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  RECURRING ENGINE
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Monthly & yearly subscriptions with automatic future 'Upcoming' scheduling
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

        {/* Tab switchers */}
        <div className="flex border-b border-slate-800/80 bg-slate-950/40 px-6 pt-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`pb-3 px-4 text-xs font-bold transition border-b-2 flex items-center gap-2 ${
              activeTab === 'all'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>All Bills & Statements ({billItems.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('recurring')}
            className={`pb-3 px-4 text-xs font-bold transition border-b-2 flex items-center gap-2 ${
              activeTab === 'recurring'
                ? 'border-emerald-400 text-emerald-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Repeat className="w-4 h-4" />
            <span>Recurring Subscriptions ({recurringItems.length})</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {notificationMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-pulse">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{notificationMsg}</span>
            </div>
          )}

          {/* Top Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Immediate Due</span>
                <span className="text-amber-400 text-[11px] font-semibold">{billItems.length} bills</span>
              </div>
              <div className="text-xl font-extrabold font-mono text-amber-300">
                {formattedTotal}
              </div>
              <p className="text-[10px] text-slate-500">
                Min required: {formattedMin}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Monthly Run-rate</span>
                <span className="text-emerald-400 text-[11px] font-semibold">Recurring</span>
              </div>
              <div className="text-xl font-extrabold font-mono text-emerald-300">
                ₹{monthlyRunRate.toLocaleString('en-IN')}
              </div>
              <p className="text-[10px] text-slate-500">
                Normalized monthly subscription cost
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Projected Annual</span>
                <span className="text-cyan-400 text-[11px] font-semibold">12-Month</span>
              </div>
              <div className="text-xl font-extrabold font-mono text-cyan-300">
                ₹{annualProjected.toLocaleString('en-IN')}
              </div>
              <p className="text-[10px] text-slate-500">
                Forecast across active recurring items
              </p>
            </div>
          </div>

          {/* List of Statements */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {activeTab === 'all'
                  ? `Active Statements & Utilities (${billItems.length})`
                  : `Recurring Subscriptions & Future Forecasts (${recurringItems.length})`}
              </h4>
              <button
                onClick={handleCopySchedule}
                className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied Schedule!' : 'Copy Summary'}</span>
              </button>
            </div>

            {(activeTab === 'all' ? billItems : recurringItems).length > 0 ? (
              <div className="space-y-3">
                {(activeTab === 'all' ? billItems : recurringItems).map(bill => {
                  const frequency = bill.recurring?.frequency || bill.financial_details.recurring?.frequency || 'none';
                  const isRecurring = frequency !== 'none';
                  const futureDates = isRecurring && bill.important_dates.expiry_date_or_due_date
                    ? getFutureOccurrences(bill.important_dates.expiry_date_or_due_date, frequency, 3)
                    : [];

                  return (
                    <div
                      key={bill.id}
                      className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 hover:border-slate-700 space-y-3 transition"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div
                          onClick={() => {
                            onInspectItem(bill);
                            onClose();
                          }}
                          className="flex items-center gap-3 overflow-hidden cursor-pointer"
                        >
                          <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
                            {isRecurring ? (
                              <Repeat className="w-5 h-5 text-emerald-400" />
                            ) : (
                              <CreditCard className="w-5 h-5 text-amber-400" />
                            )}
                          </div>
                          <div className="truncate">
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-bold text-white truncate hover:text-emerald-400 transition">
                                {bill.document_or_event_name}
                              </p>
                              {isRecurring && (
                                <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 uppercase">
                                  🔁 {frequency}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                              {bill.identification_numbers.primary_id && (
                                <span className="font-mono text-slate-300">
                                  ID: {bill.identification_numbers.primary_id}
                                </span>
                              )}
                              <span>•</span>
                              <span>Due: {bill.important_dates.expiry_date_or_due_date || 'N/A'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Amount & Actions */}
                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                          {onPayUpi && (
                            <button
                              type="button"
                              onClick={() => onPayUpi(bill)}
                              className="px-2.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-[11px] font-bold flex items-center gap-1 transition shadow-sm"
                            >
                              <QrCode className="w-3.5 h-3.5 text-amber-400" />
                              <span>UPI Pay</span>
                            </button>
                          )}

                          {isRecurring && (
                            <button
                              type="button"
                              onClick={() => handleAdvanceCycle(bill)}
                              className="px-2.5 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold flex items-center gap-1 transition shadow-sm"
                              title="Advance to next cycle and schedule 'Upcoming' status"
                            >
                              <Repeat className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Advance Cycle</span>
                            </button>
                          )}

                          <div className="text-right pl-2">
                            <p className="font-mono font-bold text-amber-300 text-xs">
                              {bill.financial_details.total_amount_due || 'N/A'}
                            </p>
                            {bill.financial_details.minimum_amount_due && (
                              <p className="font-mono text-[10px] text-slate-400">
                                Min: {bill.financial_details.minimum_amount_due}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Recurrence Settings & Future Occurrences Strip */}
                      <div className="pt-2 border-t border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px]">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500">Recurrence:</span>
                          <select
                            value={frequency}
                            onChange={e => handleFrequencyChange(bill, e.target.value as RecurrenceFrequency)}
                            className="bg-slate-900 border border-slate-800 text-slate-300 rounded-lg px-2 py-0.5 text-[11px] outline-none focus:border-emerald-500"
                          >
                            <option value="none">One-Time (No Recurrence)</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                            <option value="quarterly">Quarterly</option>
                            <option value="yearly">Yearly</option>
                          </select>
                        </div>

                        {futureDates.length > 0 && (
                          <div className="flex items-center gap-1.5 text-slate-400 overflow-x-auto">
                            <CalendarDays className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span className="text-[10px] text-slate-500">Future cycles:</span>
                            {futureDates.map((date, idx) => (
                              <span
                                key={idx}
                                className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300"
                              >
                                {date}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-500 space-y-2">
                <p>No bills found in this view.</p>
                <p className="text-[11px] text-slate-600">
                  You can set any bill or subscription to Monthly or Yearly to track recurring payments.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800/80 bg-slate-950/80 flex items-center justify-between gap-3">
          <span className="text-[11px] text-slate-500 hidden sm:inline">
            OmniVault Recurring Engine • Automatic Rollover & 30-Day 'Upcoming' Alerts
          </span>
          <button
            onClick={handleCopySchedule}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition ml-auto"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share Payment Summary</span>
          </button>
        </div>
      </div>
    </div>
  );
};
