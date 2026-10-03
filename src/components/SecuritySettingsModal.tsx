import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  Fingerprint, 
  Lock, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Trash2
} from 'lucide-react';
import { 
  isLockConfigured, 
  setupLock, 
  disableLock, 
  isBiometricAvailable, 
  registerBiometric,
  hasBiometricEnabled,
  setSessionUnlocked
} from '../services/securityLockService';

interface SecuritySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLockImmediately: () => void;
}

export const SecuritySettingsModal: React.FC<SecuritySettingsModalProps> = ({
  isOpen,
  onClose,
  onLockImmediately,
}) => {
  const [lockEnabled, setLockEnabled] = useState(false);
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);
  const [biometricSupported, setBiometricSupported] = useState(false);
  const [autoLockMins, setAutoLockMins] = useState('5');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setLockEnabled(isLockConfigured());
      setBiometricsEnabled(hasBiometricEnabled());
      setAutoLockMins(localStorage.getItem('omnivault_autolock_mins') || '5');
      setPin('');
      setConfirmPin('');
      setError(null);
      setSuccess(null);

      isBiometricAvailable().then(avail => {
        setBiometricSupported(avail);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSavePin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (pin.length < 4) {
      setError('PIN must be at least 4 digits.');
      return;
    }

    if (pin !== confirmPin) {
      setError('PINs do not match. Please re-enter.');
      return;
    }

    try {
      const ok = await setupLock(pin, biometricsEnabled);
      if (ok) {
        localStorage.setItem('omnivault_autolock_mins', autoLockMins);
        setLockEnabled(true);
        setSuccess('Vault Lock successfully configured!');
        setTimeout(() => {
          setSuccess(null);
          onClose();
        }, 1200);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to setup lock.');
    }
  };

  const handleToggleBiometrics = async () => {
    if (!biometricsEnabled) {
      const registered = await registerBiometric();
      if (registered) {
        setBiometricsEnabled(true);
      } else {
        setError('Biometric registration was cancelled or not supported on this browser.');
      }
    } else {
      localStorage.removeItem('omnivault_biometric_enabled');
      setBiometricsEnabled(false);
    }
  };

  const handleDisableLock = () => {
    if (confirm('Are you sure you want to disable App Lock? Your Vault will be accessible without a PIN.')) {
      disableLock();
      setLockEnabled(false);
      setSuccess('Vault lock disabled.');
      setTimeout(() => {
        setSuccess(null);
        onClose();
      }, 1000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">App Lock & Biometrics</h3>
              <p className="text-xs text-slate-400">
                Secure your documents, bills & emergency dossier
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
          {/* Status Banner */}
          <div className={`p-4 rounded-2xl border flex items-center justify-between ${
            lockEnabled
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-slate-950 border-slate-800 text-slate-400'
          }`}>
            <div className="flex items-center gap-2.5">
              <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <p className="font-bold text-white">
                  Vault Lock is {lockEnabled ? 'Active' : 'Disabled'}
                </p>
                <p className="text-[11px] text-slate-400">
                  {lockEnabled ? 'PIN & Biometric gate protects your records' : 'Set a PIN below to enable protection'}
                </p>
              </div>
            </div>
            {lockEnabled && (
              <button
                onClick={onLockImmediately}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold border border-slate-700 transition"
              >
                Lock Now
              </button>
            )}
          </div>

          {/* Setup / Change PIN Form */}
          <form onSubmit={handleSavePin} className="space-y-4">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
              <span>{lockEnabled ? 'Change Security PIN' : 'Set 4-Digit Security PIN'}</span>
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Enter PIN (4-6 digits)</label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  value={pin}
                  onChange={e => setPin(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="••••"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-center font-mono text-base tracking-widest text-white focus:border-emerald-500 outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Confirm PIN</label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  value={confirmPin}
                  onChange={e => setConfirmPin(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="••••"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-center font-mono text-base tracking-widest text-white focus:border-emerald-500 outline-none"
                />
              </div>
            </div>

            {/* Biometric Toggle */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Fingerprint className="w-4 h-4 text-emerald-400" />
                <div>
                  <p className="font-semibold text-white">Biometric Unlock</p>
                  <p className="text-[11px] text-slate-400">
                    Use Touch ID, Face ID, or Windows Hello
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleToggleBiometrics}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition ${
                  biometricsEnabled
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {biometricsEnabled ? 'Enabled' : 'Enable'}
              </button>
            </div>

            {/* Auto Lock Timer */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Auto-Lock After Inactivity:</span>
              </div>
              <select
                value={autoLockMins}
                onChange={e => {
                  setAutoLockMins(e.target.value);
                  localStorage.setItem('omnivault_autolock_mins', e.target.value);
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white outline-none"
              >
                <option value="0">Immediately</option>
                <option value="1">1 minute</option>
                <option value="5">5 minutes</option>
                <option value="15">15 minutes</option>
              </select>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-slate-950 font-bold text-xs shadow-md transition"
            >
              {lockEnabled ? 'Update Lock Settings' : 'Enable App Lock'}
            </button>
          </form>

          {/* Disable Lock Button */}
          {lockEnabled && (
            <div className="pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={handleDisableLock}
                className="w-full py-2 rounded-xl text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Turn Off App Lock</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
