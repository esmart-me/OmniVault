import React from 'react';
import { 
  X, 
  AlertTriangle, 
  Copy, 
  RefreshCw, 
  PlusCircle, 
  Trash2, 
  CheckCircle2, 
  Calendar, 
  CreditCard, 
  Fingerprint, 
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { LifeAdminItem } from '../types/document';
import { DuplicateMatchResult } from '../services/duplicateDetectionService';

interface DuplicateConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  pendingItem: LifeAdminItem | null;
  duplicateMatch: DuplicateMatchResult | null;
  onOverwriteExisting: (existingItem: LifeAdminItem, newItem: LifeAdminItem) => void;
  onSaveAsNew: (newItem: LifeAdminItem) => void;
  onDiscard: () => void;
}

export const DuplicateConfirmationModal: React.FC<DuplicateConfirmationModalProps> = ({
  isOpen,
  onClose,
  pendingItem,
  duplicateMatch,
  onOverwriteExisting,
  onSaveAsNew,
  onDiscard,
}) => {
  if (!isOpen || !pendingItem || !duplicateMatch?.existingItem) return null;

  const existing = duplicateMatch.existingItem;
  const confidenceColor =
    duplicateMatch.confidence === 'High'
      ? 'text-rose-400 bg-rose-500/15 border-rose-500/30'
      : duplicateMatch.confidence === 'Medium'
      ? 'text-amber-400 bg-amber-500/15 border-amber-500/30'
      : 'text-cyan-400 bg-cyan-500/15 border-cyan-500/30';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-xl overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900/95 border border-slate-800/80 rounded-3xl shadow-2xl backdrop-blur-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800/80 bg-slate-950/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Potential Duplicate Detected</h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${confidenceColor}`}>
                  {duplicateMatch.confidence} Confidence ({duplicateMatch.score}%)
                </span>
              </div>
              <p className="text-xs text-slate-400">
                A matching document or identification number already exists in your vault
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

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 text-xs">
          {/* Match Reasons Pill */}
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-200 space-y-1.5">
            <span className="font-bold flex items-center gap-1.5 text-xs text-amber-300">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              Match Triggers:
            </span>
            <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-300">
              {duplicateMatch.matchedReasons.map((reason, idx) => (
                <li key={idx}>{reason}</li>
              ))}
            </ul>
          </div>

          {/* Side-by-side comparison */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Existing Item */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Existing Vault Record
                </span>
                <span className="text-[10px] text-slate-500">
                  Added: {new Date(existing.created_at).toLocaleDateString()}
                </span>
              </div>

              <div>
                <p className="font-bold text-white text-sm line-clamp-1">{existing.document_or_event_name}</p>
                <span className="text-[10px] text-emerald-400 font-semibold">{existing.category}</span>
              </div>

              <div className="space-y-1.5 text-[11px] text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-500">Primary ID:</span>
                  <span className="font-mono text-white font-semibold">
                    {existing.identification_numbers?.primary_id || '—'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Holder / Person:</span>
                  <span className="text-white">{existing.holder_or_person_name || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Due / Expiry Date:</span>
                  <span className="font-mono text-cyan-300 font-semibold">
                    {existing.important_dates?.expiry_date_or_due_date || '—'}
                  </span>
                </div>
                {existing.financial_details?.total_amount_due && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Amount Due:</span>
                    <span className="font-mono font-bold text-amber-300">
                      {existing.financial_details.total_amount_due}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* New Ingestion Item */}
            <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-3">
              <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  Newly Ingested Record
                </span>
                <span className="text-[10px] text-emerald-300 font-mono">Just scanned</span>
              </div>

              <div>
                <p className="font-bold text-white text-sm line-clamp-1">{pendingItem.document_or_event_name}</p>
                <span className="text-[10px] text-emerald-400 font-semibold">{pendingItem.category}</span>
              </div>

              <div className="space-y-1.5 text-[11px] text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-500">Primary ID:</span>
                  <span className="font-mono text-emerald-300 font-semibold">
                    {pendingItem.identification_numbers?.primary_id || '—'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Holder / Person:</span>
                  <span className="text-white">{pendingItem.holder_or_person_name || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Due / Expiry Date:</span>
                  <span className="font-mono text-cyan-300 font-semibold">
                    {pendingItem.important_dates?.expiry_date_or_due_date || '—'}
                  </span>
                </div>
                {pendingItem.financial_details?.total_amount_due && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Amount Due:</span>
                    <span className="font-mono font-bold text-amber-300">
                      {pendingItem.financial_details.total_amount_due}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed text-center pt-1">
            Choose whether to update your existing record with the new statement/details, keep both records separately, or discard the new scan.
          </p>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-slate-800/80 bg-slate-950/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <button
            onClick={onDiscard}
            className="px-4 py-2.5 rounded-xl border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Discard Ingestion</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onSaveAsNew(pendingItem)}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
            >
              <PlusCircle className="w-3.5 h-3.5 text-cyan-400" />
              <span>Save as New Record</span>
            </button>

            <button
              onClick={() => onOverwriteExisting(existing, pendingItem)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-lg shadow-emerald-500/20"
            >
              <RefreshCw className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Update Existing Record</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
