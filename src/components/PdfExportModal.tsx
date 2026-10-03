import React, { useState } from 'react';
import { 
  X, 
  FileDown, 
  CheckSquare, 
  Square, 
  Printer, 
  Filter, 
  Check, 
  Sparkles,
  FileText,
  CreditCard,
  Shield,
  Calendar
} from 'lucide-react';
import { LifeAdminItem, LifeAdminCategory } from '../types/document';
import { generateVaultPdfReport } from '../services/pdfReportService';
import { useAuth } from '../context/AuthContext';

interface PdfExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: LifeAdminItem[];
}

export const PdfExportModal: React.FC<PdfExportModalProps> = ({
  isOpen,
  onClose,
  items,
}) => {
  const { user } = useAuth();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set(items.map(i => i.id)));
  const [selectedCategory, setSelectedCategory] = useState<LifeAdminCategory | 'All'>('All');
  const [reportTitle, setReportTitle] = useState('OmniVault Pro - Vault Summary Report');
  const [downloading, setDownloading] = useState(false);

  if (!isOpen) return null;

  const filteredItems = items.filter(item => {
    if (selectedCategory !== 'All' && item.category !== selectedCategory) {
      return false;
    }
    return true;
  });

  const handleToggleSelectAll = () => {
    if (selectedIds.size === filteredItems.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredItems.map(i => i.id)));
    }
  };

  const handleToggleItem = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const selectedItems = items.filter(i => selectedIds.has(i.id));

  const handleDownloadPdf = () => {
    if (selectedItems.length === 0) return;
    setDownloading(true);
    try {
      generateVaultPdfReport({
        items: selectedItems,
        userEmail: user?.email || undefined,
        userName: user?.displayName || undefined,
        title: reportTitle,
      });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-xl overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900/90 border border-slate-800/80 rounded-3xl shadow-2xl backdrop-blur-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800/80 bg-slate-950/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <FileDown className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Generate PDF Summary Report</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  PRINT READY
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Select documents to include in your offline printable vault dossier
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

        {/* Controls */}
        <div className="p-4 sm:p-5 border-b border-slate-800/80 bg-slate-950/40 space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Report Title
              </label>
              <input
                type="text"
                value={reportTitle}
                onChange={e => setReportTitle(e.target.value)}
                className="w-full sm:w-80 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-emerald-500 transition"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleSelectAll}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                {selectedIds.size === filteredItems.length ? (
                  <>
                    <CheckSquare className="w-4 h-4 text-emerald-400" />
                    <span>Deselect All</span>
                  </>
                ) : (
                  <>
                    <Square className="w-4 h-4" />
                    <span>Select All ({filteredItems.length})</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-1">
            {(['All', 'Credit Card Bill', 'Birthday/Event', 'Identity', 'Insurance', 'Vehicle', 'Warranty'] as const).map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Document Selection List */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-2">
          {filteredItems.map(item => {
            const isSelected = selectedIds.has(item.id);
            return (
              <div
                key={item.id}
                onClick={() => handleToggleItem(item.id)}
                className={`p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-emerald-950/20 border-emerald-500/30'
                    : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition ${
                    isSelected ? 'bg-emerald-500 border-emerald-500 text-slate-950' : 'border-slate-700 bg-slate-900'
                  }`}>
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-bold text-white truncate">
                      {item.document_or_event_name}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                      <span className="text-slate-300">{item.category}</span>
                      <span>•</span>
                      <span>Due: {item.important_dates?.expiry_date_or_due_date || 'N/A'}</span>
                      {item.identification_numbers?.primary_id && (
                        <>
                          <span>•</span>
                          <span className="font-mono text-emerald-300">
                            {item.identification_numbers.primary_id}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {item.financial_details?.total_amount_due && (
                  <span className="text-xs font-mono font-bold text-amber-300 shrink-0">
                    {item.financial_details.total_amount_due}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800/80 bg-slate-950/80 flex items-center justify-between gap-3">
          <span className="text-xs text-slate-400">
            Selected: <strong className="text-white">{selectedItems.length}</strong> items
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={selectedItems.length === 0 || downloading}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-slate-950 font-bold text-xs flex items-center gap-2 transition shadow-lg shadow-emerald-500/20 disabled:opacity-50"
            >
              <FileDown className="w-4 h-4" />
              <span>{downloading ? 'Generating PDF...' : 'Download PDF Report'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
