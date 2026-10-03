import React from 'react';
import { 
  CreditCard, 
  Cake, 
  Shield, 
  Zap, 
  Car, 
  Fingerprint, 
  Calendar, 
  User, 
  ChevronRight, 
  Code2, 
  Trash2,
  CalendarPlus,
  Clock,
  Sparkles,
  DollarSign,
  FileText,
  FileCheck,
  QrCode
} from 'lucide-react';
import { LifeAdminItem, LifeAdminCategory } from '../types/document';
import { getItemStatusInfo } from '../utils/storage';
import { downloadCalendarReminder } from '../utils/calendar';

interface DocumentCardProps {
  item: LifeAdminItem;
  privacyMode?: boolean;
  onInspect: (item: LifeAdminItem) => void;
  onViewJson: (item: LifeAdminItem) => void;
  onDelete: (id: string) => void;
  onOpenUpi?: (item: LifeAdminItem) => void;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({
  item,
  privacyMode = false,
  onInspect,
  onViewJson,
  onDelete,
  onOpenUpi,
}) => {
  const { status, label, badgeClass, days } = getItemStatusInfo(item);

  const maskValue = (val: string | null) => {
    if (!val) return 'null';
    if (!privacyMode) return val;
    return '••••••••';
  };

  const getCategoryIcon = (category: LifeAdminCategory) => {
    switch (category) {
      case 'Credit Card Bill':
        return <CreditCard className="w-4 h-4 text-amber-400" />;
      case 'Birthday/Event':
        return <Cake className="w-4 h-4 text-pink-400" />;
      case 'Identity':
        return <Fingerprint className="w-4 h-4 text-cyan-400" />;
      case 'Insurance':
        return <Shield className="w-4 h-4 text-emerald-400" />;
      case 'Warranty':
        return <Zap className="w-4 h-4 text-indigo-400" />;
      case 'Vehicle':
        return <Car className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <div className="group relative rounded-3xl bg-slate-900/75 hover:bg-slate-900/95 border border-slate-800 hover:border-slate-700/80 transition-all duration-200 shadow-sm hover:shadow-xl flex flex-col justify-between overflow-hidden">
      {/* Top Section */}
      <div className="p-5 space-y-3.5">
        {/* Header: Category & Entry Type */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-slate-800/80 flex items-center justify-center border border-slate-700/50">
              {getCategoryIcon(item.category)}
            </div>
            <span className="text-xs font-semibold text-slate-300">
              {item.category}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Recurring Sub Badge */}
            {(item.recurring?.frequency || item.financial_details.recurring?.frequency) && 
             (item.recurring?.frequency !== 'none' && item.financial_details.recurring?.frequency !== 'none') && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 uppercase">
                🔁 {item.recurring?.frequency || item.financial_details.recurring?.frequency}
              </span>
            )}

            {/* Entry Type Badge */}
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
              item.entry_type === 'Scanned Document'
                ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20'
                : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
            }`}>
              {item.entry_type === 'Scanned Document' ? 'Scanned' : 'Manual'}
            </span>

            {/* Countdown / Status Badge */}
            <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${badgeClass}`}>
              {label}
            </span>
          </div>
        </div>

        {/* Title / Item Name */}
        <div>
          <h3 
            onClick={() => onInspect(item)}
            className="text-base font-bold text-white hover:text-emerald-400 transition-colors cursor-pointer line-clamp-1"
          >
            {item.document_or_event_name}
          </h3>
          {item.holder_or_person_name && (
            <p className="text-xs text-slate-400 font-medium mt-0.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-500" />
              <span>{item.holder_or_person_name}</span>
            </p>
          )}
        </div>

        {/* Financial / ID Box */}
        {(item.financial_details.total_amount_due || item.identification_numbers.primary_id) && (
          <div className="bg-slate-950/70 rounded-2xl p-3 border border-slate-800/70 space-y-2 text-xs">
            {/* Credit Card Financial Breakdown */}
            {item.financial_details.total_amount_due && (
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Total Amount Due:</span>
                <span className="font-mono font-bold text-amber-300 text-sm">
                  {maskValue(item.financial_details.total_amount_due)}
                </span>
              </div>
            )}
            {item.financial_details.minimum_amount_due && (
              <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/60 pt-1">
                <span>Minimum Amount Due:</span>
                <span className="font-mono text-slate-300">
                  {maskValue(item.financial_details.minimum_amount_due)}
                </span>
              </div>
            )}

            {/* Identifiers */}
            {item.identification_numbers.primary_id && (
              <div className="flex items-center justify-between text-[11px] border-t border-slate-800/50 pt-1">
                <span className="text-slate-500">ID / Card No:</span>
                <span className="font-mono font-semibold text-emerald-300">
                  {maskValue(item.identification_numbers.primary_id)}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Important Dates */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
          <div>
            <span className="text-slate-500">
              {item.category === 'Birthday/Event' ? 'DOB: ' : 'Issued: '}
            </span>
            <span className="font-mono text-slate-300">
              {item.important_dates.issue_date_or_dob || 'N/A'}
            </span>
          </div>
          <div>
            <span className="text-slate-500">
              {item.category === 'Credit Card Bill' ? 'Due: ' : item.category === 'Birthday/Event' ? 'Next: ' : 'Expires: '}
            </span>
            <span className="font-mono font-semibold text-white">
              {item.important_dates.expiry_date_or_due_date || 'Permanent'}
            </span>
          </div>
        </div>

        {/* User Friendly Summary */}
        <p className="text-xs text-slate-300 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/50 leading-relaxed">
          {item.user_friendly_summary}
        </p>

        {/* Action Required Pill */}
        {item.action_required && (
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400">Action:</span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 text-emerald-300 border border-emerald-500/30">
              ⚡ {item.action_required}
            </span>
          </div>
        )}
      </div>

      {/* Card Footer */}
      <div className="px-5 py-3 bg-slate-950/50 border-t border-slate-800/60 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          {/* Calendar export */}
          {item.important_dates.expiry_date_or_due_date && (
            <button
              onClick={() => downloadCalendarReminder(item)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition"
              title="Add reminder to Calendar (.ics)"
            >
              <CalendarPlus className="w-4 h-4" />
            </button>
          )}

          {/* View Pure JSON */}
          <button
            onClick={() => onViewJson(item)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition"
            title="View pure JSON output schema"
          >
            <Code2 className="w-4 h-4" />
          </button>

          {/* Delete */}
          <button
            onClick={() => onDelete(item.id)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition"
            title="Delete from assistant"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          {Boolean(item.financial_details.total_amount_due || item.category === 'Credit Card Bill') && onOpenUpi && (
            <button
              onClick={() => onOpenUpi(item)}
              className="flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 px-2.5 py-1.5 rounded-xl border border-amber-500/30 transition shadow-sm"
              title="Pay bill via Indian UPI (GPay, PhonePe, Paytm)"
            >
              <QrCode className="w-3.5 h-3.5 text-amber-400" />
              <span>UPI Pay</span>
            </button>
          )}

          {/* Inspect */}
          <button
            onClick={() => onInspect(item)}
            className="flex items-center gap-1 text-xs font-semibold text-slate-200 hover:text-white bg-slate-800/80 hover:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700/60 transition group-hover:border-emerald-500/40"
          >
            <span>Inspect</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};
