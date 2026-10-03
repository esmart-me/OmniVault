import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  Fingerprint, 
  HeartPulse, 
  Car, 
  Copy, 
  Check, 
  Printer, 
  AlertCircle,
  FileCheck,
  Lock,
  Unlock,
  KeyRound
} from 'lucide-react';
import { LifeAdminItem } from '../types/document';
import { 
  isLockConfigured, 
  isCurrentlyLocked, 
  verifyPin, 
  authenticateBiometric, 
  hasBiometricEnabled, 
  isBiometricAvailable,
  setSessionUnlocked
} from '../services/securityLockService';

interface EmergencyWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: LifeAdminItem[];
  onOpenSecuritySettings?: () => void;
}

export const EmergencyWalletModal: React.FC<EmergencyWalletModalProps> = ({
  isOpen,
  onClose,
  items,
  onOpenSecuritySettings,
}) => {
  const [copied, setCopied] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const locked = isCurrentlyLocked();
      setIsLocked(locked);
      setPinInput('');
      setPinError(false);

      if (locked) {
        isBiometricAvailable().then(avail => {
          setBiometricAvailable(avail || hasBiometricEnabled());
          if (avail && hasBiometricEnabled()) {
            handleBiometricUnlock();
          }
        });
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleUnlockPin = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await verifyPin(pinInput);
    if (ok) {
      setIsLocked(false);
    } else {
      setPinError(true);
      setPinInput('');
    }
  };

  const handleBiometricUnlock = async () => {
    const ok = await authenticateBiometric();
    if (ok) {
      setIsLocked(false);
    }
  };

  const identityDocs = items.filter(i => i.category === 'Identity');
  const insuranceDocs = items.filter(i => i.category === 'Insurance');
  const vehicleDocs = items.filter(i => i.category === 'Vehicle');

  const emergencyDossierText = `🚨 EMERGENCY LIFE-ADMIN DOSSIER - OMNIVAULT AI 🚨\nGenerated: ${new Date().toLocaleDateString()}\n\n` +
    `🪪 PRIMARY IDENTIFICATION:\n` +
    (identityDocs.length > 0 ? identityDocs.map(d => `• ${d.document_or_event_name}: ID ${d.identification_numbers.primary_id || 'N/A'}, Expiry: ${d.important_dates.expiry_date_or_due_date || 'N/A'}, Holder: ${d.holder_or_person_name || 'N/A'}`).join('\n') : '• None recorded') +
    `\n\n🏥 HEALTH & LIFE INSURANCE:\n` +
    (insuranceDocs.length > 0 ? insuranceDocs.map(d => `• ${d.document_or_event_name}: Policy ${d.identification_numbers.primary_id || 'N/A'}, Valid Until: ${d.important_dates.expiry_date_or_due_date || 'N/A'}, Action: ${d.action_required || 'N/A'}`).join('\n') : '• None recorded') +
    `\n\n🚗 VEHICLE & ROADSIDE ASSISTANCE:\n` +
    (vehicleDocs.length > 0 ? vehicleDocs.map(d => `• ${d.document_or_event_name}: Reg ${d.identification_numbers.primary_id || 'N/A'}, Valid Until: ${d.important_dates.expiry_date_or_due_date || 'N/A'}`).join('\n') : '• None recorded');

  const handleCopy = () => {
    navigator.clipboard.writeText(emergencyDossierText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Emergency Dossier Card</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20">
                  {isLocked ? 'SECURE LOCKED' : 'PRO SAFETY'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                1-click access to your Passports, Health Insurance, and Vehicle records
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
        {isLocked ? (
          /* Biometric / PIN Lock Gate */
          <div className="p-8 sm:p-12 text-center space-y-5 flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <Lock className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-bold text-white">Emergency Dossier is Locked</h4>
              <p className="text-xs text-slate-400 max-w-sm">
                Authenticate with your Biometrics (Fingerprint / Face ID) or PIN to access sensitive identity and medical policies.
              </p>
            </div>

            {biometricAvailable && (
              <button
                onClick={handleBiometricUnlock}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-emerald-300 border border-emerald-500/30 transition shadow"
              >
                <Fingerprint className="w-4 h-4 text-emerald-400" />
                <span>Unlock with Biometrics</span>
              </button>
            )}

            <form onSubmit={handleUnlockPin} className="space-y-3 w-64 pt-2">
              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                value={pinInput}
                onChange={e => {
                  setPinInput(e.target.value);
                  setPinError(false);
                }}
                placeholder="Enter PIN"
                className="w-full text-center px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-rose-500 text-white font-mono text-base tracking-widest outline-none transition"
              />

              {pinError && (
                <p className="text-[11px] text-rose-400 font-semibold flex items-center justify-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Incorrect PIN. Try again.
                </p>
              )}

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold text-xs transition"
              >
                Unlock Dossier
              </button>
            </form>
          </div>
        ) : (
          <div className="p-6 overflow-y-auto flex-1 space-y-5">
            {/* Identity Section */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <Fingerprint className="w-4 h-4" />
                <span>Identity & Travel ({identityDocs.length})</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {identityDocs.map(doc => (
                  <div key={doc.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                    <p className="font-bold text-white truncate">{doc.document_or_event_name}</p>
                    <p className="font-mono text-emerald-300 mt-0.5 select-all">
                      No: {doc.identification_numbers.primary_id || 'N/A'}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Expiry: {doc.important_dates.expiry_date_or_due_date || 'N/A'}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Insurance Section */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>Health & Medical Coverage ({insuranceDocs.length})</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {insuranceDocs.map(doc => (
                  <div key={doc.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                    <p className="font-bold text-white truncate">{doc.document_or_event_name}</p>
                    <p className="font-mono text-emerald-300 mt-0.5 select-all">
                      Policy: {doc.identification_numbers.primary_id || 'N/A'}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Renewal Due: {doc.important_dates.expiry_date_or_due_date || 'N/A'}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Vehicle Section */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                <Car className="w-4 h-4" />
                <span>Vehicle & Assistance ({vehicleDocs.length})</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {vehicleDocs.map(doc => (
                  <div key={doc.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                    <p className="font-bold text-white truncate">{doc.document_or_event_name}</p>
                    <p className="font-mono text-blue-300 mt-0.5 select-all">
                      Reg: {doc.identification_numbers.primary_id || 'N/A'}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Valid Until: {doc.important_dates.expiry_date_or_due_date || 'N/A'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        {!isLocked && (
          <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between gap-3">
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Printer className="w-4 h-4" />
              <span>Print Dossier</span>
            </button>

            <button
              onClick={handleCopy}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-indigo-500 hover:from-rose-400 hover:to-indigo-400 text-white font-bold text-xs flex items-center gap-1.5 transition shadow"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied Dossier!' : 'Copy Emergency Dossier'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
