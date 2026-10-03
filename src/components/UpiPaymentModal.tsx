import React, { useState, useEffect } from 'react';
import { 
  X, 
  CreditCard, 
  QrCode, 
  Smartphone, 
  CheckCircle2, 
  Copy, 
  Check, 
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  Repeat
} from 'lucide-react';
import QRCode from 'qrcode';
import { LifeAdminItem } from '../types/document';
import { calculateNextDueDate } from '../utils/recurringService';

interface UpiPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: LifeAdminItem | null;
  onMarkAsPaid?: (item: LifeAdminItem, utr: string, autoAdvanceNext?: boolean) => void;
}

export const UpiPaymentModal: React.FC<UpiPaymentModalProps> = ({
  isOpen,
  onClose,
  item,
  onMarkAsPaid,
}) => {
  const [upiId, setUpiId] = useState('paytm-bills@paytm');
  const [payeeName, setPayeeName] = useState('Bill Payment Desk');
  const [amount, setAmount] = useState('0');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [utr, setUtr] = useState('');
  const [paidConfirmed, setPaidConfirmed] = useState(false);
  const [autoAdvanceNext, setAutoAdvanceNext] = useState(true);

  const frequency = item?.recurring?.frequency || item?.financial_details.recurring?.frequency || 'none';
  const isRecurring = frequency !== 'none';
  const nextScheduledDate = item?.important_dates.expiry_date_or_due_date && isRecurring
    ? calculateNextDueDate(item.important_dates.expiry_date_or_due_date, frequency)
    : null;

  useEffect(() => {
    if (item && isOpen) {
      // Determine default UPI ID based on item
      let defaultUpi = 'techsakeer@okaxis';
      let defaultPayee = item.holder_or_person_name || 'OmniVault Payee';
      let defaultAmount = '500';

      if (item.category === 'Credit Card Bill') {
        defaultUpi = 'hdfcbank@hdfcbank';
        defaultPayee = 'HDFC Credit Card';
      } else if (item.document_or_event_name.toLowerCase().includes('electricity')) {
        defaultUpi = 'kseb@sbi';
        defaultPayee = 'KSEB Electricity Board';
      } else if (item.category === 'Insurance') {
        defaultUpi = 'licindia@sbi';
        defaultPayee = 'Insurance Premium';
      }

      if (item.financial_details.total_amount_due) {
        const cleaned = item.financial_details.total_amount_due.replace(/[^0-9.]/g, '');
        if (cleaned) defaultAmount = cleaned;
      }

      setUpiId(defaultUpi);
      setPayeeName(defaultPayee);
      setAmount(defaultAmount);
      setUtr('');
      setPaidConfirmed(false);
    }
  }, [item, isOpen]);

  // Generate QR Code when UPI details change
  useEffect(() => {
    if (!isOpen || !amount) return;

    const note = item ? `${item.document_or_event_name} Bill` : 'OmniVault Bill Payment';
    const upiUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`;

    QRCode.toDataURL(upiUri, {
      width: 240,
      margin: 1,
      color: {
        dark: '#020617',
        light: '#ffffff',
      },
    })
      .then(url => setQrDataUrl(url))
      .catch(err => console.error('Failed generating QR Code:', err));
  }, [upiId, payeeName, amount, item, isOpen]);

  if (!isOpen || !item) return null;

  const note = `${item.document_or_event_name} Payment`;
  const upiDeepLink = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleConfirmPaid = () => {
    setPaidConfirmed(true);
    if (onMarkAsPaid) {
      onMarkAsPaid(item, utr, autoAdvanceNext && isRecurring);
    }
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-xl overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900/90 border border-slate-800/80 rounded-3xl shadow-2xl backdrop-blur-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800/80 bg-slate-950/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Indian UPI Payment</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  INSTANT INR
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Scan or launch GPay, PhonePe, Paytm, BHIM & Cred
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
        <div className="p-6 space-y-5 text-xs">
          {/* Bill Overview Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-indigo-500/10 border border-amber-500/20 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-white">{item.document_or_event_name}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Due: {item.important_dates?.expiry_date_or_due_date || 'N/A'} • {item.action_required || 'Pay Now'}
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Payable Amount</span>
              <span className="font-mono text-lg font-extrabold text-amber-300">
                ₹{parseFloat(amount || '0').toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* QR Code and Scan Section */}
          <div className="flex flex-col items-center justify-center p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
            <div className="p-3 bg-white rounded-2xl shadow-xl">
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="UPI QR Code" className="w-48 h-48 object-contain" />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center text-slate-400">
                  Generating QR...
                </div>
              )}
            </div>

            <div className="text-center space-y-1">
              <p className="text-xs font-bold text-white flex items-center justify-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                <span>Scan with any UPI App</span>
              </p>
              <p className="text-[11px] text-slate-400">
                Google Pay • PhonePe • Paytm • BHIM • Cred • Amazon Pay
              </p>
            </div>

            {/* UPI ID Pill with Copy */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 rounded-xl border border-slate-800 text-[11px]">
              <span className="text-slate-400">VPA:</span>
              <span className="font-mono text-emerald-300 font-semibold">{upiId}</span>
              <button
                onClick={handleCopyUpi}
                className="text-slate-400 hover:text-white transition ml-1"
                title="Copy UPI ID"
              >
                {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Quick UPI App Deep Link (Mobile) */}
          <div className="space-y-2">
            <a
              href={upiDeepLink}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-400 via-cyan-400 to-indigo-500 hover:from-emerald-300 hover:to-indigo-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition active:scale-98"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Open in UPI App (GPay / PhonePe / Paytm)</span>
            </a>
          </div>

          {/* Edit Amount or VPA */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                Amount (INR)
              </label>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:border-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                Payee UPI ID
              </label>
              <input
                type="text"
                value={upiId}
                onChange={e => setUpiId(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:border-emerald-500 outline-none"
              />
            </div>
          </div>

          {/* Recurring Auto-Advance Schedule Checkbox */}
          {isRecurring && nextScheduledDate && (
            <label className="flex items-start gap-2.5 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 cursor-pointer">
              <input
                type="checkbox"
                checked={autoAdvanceNext}
                onChange={e => setAutoAdvanceNext(e.target.checked)}
                className="mt-0.5 rounded accent-emerald-500"
              />
              <div className="text-[11px] leading-relaxed">
                <span className="font-bold flex items-center gap-1.5">
                  <Repeat className="w-3.5 h-3.5 text-emerald-400" />
                  Auto-Advance Recurring Schedule ({frequency})
                </span>
                <span className="text-slate-400 block mt-0.5">
                  Automatically rolls to next instance (<strong className="text-white">{nextScheduledDate}</strong>) and flags it as <span className="text-amber-300 font-semibold">'Upcoming'</span> in your renewal radar.
                </span>
              </div>
            </label>
          )}

          {/* Record UTR / Mark as Paid */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-semibold">Mark Payment Completed</span>
              <span className="text-[10px] text-slate-500">Optional UTR reference</span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={utr}
                onChange={e => setUtr(e.target.value)}
                placeholder="12-digit UTR / Ref No (e.g. 427819401823)"
                className="flex-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs outline-none focus:border-emerald-500 font-mono"
              />
              <button
                onClick={handleConfirmPaid}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition"
              >
                {paidConfirmed ? 'Recorded!' : 'Mark Paid'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
