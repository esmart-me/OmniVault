import React, { useState, useRef } from 'react';
import { 
  X, 
  UploadCloud, 
  Camera, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Cake,
  CreditCard,
  Fingerprint,
  Shield,
  Zap,
  Car,
  FileCheck
} from 'lucide-react';
import { LifeAdminCategory, LifeAdminExtractionResult, LifeAdminItem } from '../types/document';
import { SAMPLE_LIFE_ADMIN_PRESETS } from '../data/sampleDocuments';
import { scanForPotentialDuplicates, DuplicateMatchResult } from '../services/duplicateDetectionService';
import { DuplicateConfirmationModal } from './DuplicateConfirmationModal';

interface IngestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onItemExtracted: (item: LifeAdminItem) => void;
  onItemUpdated?: (item: LifeAdminItem) => void;
  existingVaultItems?: LifeAdminItem[];
}

export const IngestModal: React.FC<IngestModalProps> = ({
  isOpen,
  onClose,
  onItemExtracted,
  onItemUpdated,
  existingVaultItems = [],
}) => {
  if (!isOpen) return null;

  const [inputMode, setInputMode] = useState<'text' | 'preset' | 'upload' | 'camera'>('text');
  const [selectedPresetId, setSelectedPresetId] = useState<string>(SAMPLE_LIFE_ADMIN_PRESETS[0].id);
  const [categoryHint, setCategoryHint] = useState<string>('');
  const [customText, setCustomText] = useState<string>('');
  
  // Duplicate detection state
  const [duplicateMatch, setDuplicateMatch] = useState<DuplicateMatchResult | null>(null);
  const [pendingItem, setPendingItem] = useState<LifeAdminItem | null>(null);
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
  
  // File upload state
  const [fileBase64, setFileBase64] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string | null>(null);

  // Camera state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Processing state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStep, setCurrentStep] = useState<string>('');
  const [extractionResult, setExtractionResult] = useState<LifeAdminExtractionResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setMimeType(file.type || 'image/jpeg');

    const reader = new FileReader();
    reader.onloadend = () => {
      setFileBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.error('Camera access failed', err);
      alert('Unable to access camera. Please enter text or upload a photo.');
    }
  };

  const captureCameraPhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setFileBase64(dataUrl);
      setFileName('camera_document_scan.jpg');
      setMimeType('image/jpeg');
      stopCamera();
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  const handleRunAnalysis = async () => {
    setErrorMsg(null);
    setIsAnalyzing(true);
    setCurrentStep('Analyzing life-admin input...');

    try {
      let payload: any = {
        categoryHint: categoryHint || undefined,
        fileName: fileName || undefined,
      };

      if (inputMode === 'preset') {
        const preset = SAMPLE_LIFE_ADMIN_PRESETS.find(p => p.id === selectedPresetId);
        if (!preset) throw new Error('Preset not found');
        payload.textContent = preset.raw_text;
        payload.fileName = preset.title;
        payload.categoryHint = preset.category;
      } else if (inputMode === 'upload' || inputMode === 'camera') {
        if (!fileBase64) {
          throw new Error('Please upload or capture an image first.');
        }
        payload.fileBase64 = fileBase64;
        payload.mimeType = mimeType;
      } else if (inputMode === 'text') {
        if (!customText.trim()) {
          throw new Error('Please enter text (e.g., "My son Rahul\'s birthday is on Oct 12 2015" or credit card details).');
        }
        payload.textContent = customText.trim();
      }

      setTimeout(() => setCurrentStep('Extracting financial amounts, IDs & dates...'), 500);
      setTimeout(() => setCurrentStep('Calculating exact countdown days & status...'), 1200);

      const response = await fetch('/api/analyze-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Server error.');
      }

      const result: LifeAdminExtractionResult = await response.json();
      setCurrentStep('Complete! Formatted into clean schema.');
      setExtractionResult(result);

      if (existingVaultItems && existingVaultItems.length > 0) {
        const dup = scanForPotentialDuplicates(result, existingVaultItems);
        setDuplicateMatch(dup);
      }
    } catch (err: any) {
      console.error('Analysis error:', err);
      setErrorMsg(err.message || 'Failed to process input.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveToVault = () => {
    if (!extractionResult) return;

    let rawInput = '';
    if (inputMode === 'preset') {
      const p = SAMPLE_LIFE_ADMIN_PRESETS.find(s => s.id === selectedPresetId);
      rawInput = p ? p.raw_text : '';
    } else if (inputMode === 'text') {
      rawInput = customText;
    }

    const newItem: LifeAdminItem = {
      ...extractionResult,
      id: `item-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      file_name: fileName || `${extractionResult.document_or_event_name}.txt`,
      file_data_url: fileBase64 || undefined,
      file_type: fileBase64 ? 'image' : 'text',
      raw_input_text: rawInput || undefined,
      verified_by_user: true,
    };

    // Scan for duplicate before committing
    if (existingVaultItems && existingVaultItems.length > 0) {
      const dup = scanForPotentialDuplicates(newItem, existingVaultItems);
      if (dup.isDuplicate && dup.existingItem) {
        setPendingItem(newItem);
        setDuplicateMatch(dup);
        setIsDuplicateModalOpen(true);
        return;
      }
    }

    onItemExtracted(newItem);
    handleClose();
  };

  const handleOverwriteExisting = (existing: LifeAdminItem, newIngest: LifeAdminItem) => {
    const merged: LifeAdminItem = {
      ...existing,
      document_or_event_name: newIngest.document_or_event_name || existing.document_or_event_name,
      holder_or_person_name: newIngest.holder_or_person_name || existing.holder_or_person_name,
      identification_numbers: {
        primary_id: newIngest.identification_numbers?.primary_id || existing.identification_numbers?.primary_id,
        secondary_id: newIngest.identification_numbers?.secondary_id || existing.identification_numbers?.secondary_id,
      },
      financial_details: {
        total_amount_due: newIngest.financial_details?.total_amount_due || existing.financial_details?.total_amount_due,
        minimum_amount_due: newIngest.financial_details?.minimum_amount_due || existing.financial_details?.minimum_amount_due,
        recurring: newIngest.financial_details?.recurring || existing.financial_details?.recurring,
      },
      important_dates: {
        issue_date_or_dob: newIngest.important_dates?.issue_date_or_dob || existing.important_dates?.issue_date_or_dob,
        expiry_date_or_due_date: newIngest.important_dates?.expiry_date_or_due_date || existing.important_dates?.expiry_date_or_due_date,
      },
      countdown_calculations: newIngest.countdown_calculations,
      user_friendly_summary: `${newIngest.user_friendly_summary} (Updated from new scan)`,
      action_required: newIngest.action_required || existing.action_required,
      updated_at: new Date().toISOString(),
      file_name: newIngest.file_name || existing.file_name,
      file_data_url: newIngest.file_data_url || existing.file_data_url,
      file_type: newIngest.file_type || existing.file_type,
      raw_input_text: newIngest.raw_input_text || existing.raw_input_text,
    };

    if (onItemUpdated) {
      onItemUpdated(merged);
    } else {
      onItemExtracted(merged);
    }

    setIsDuplicateModalOpen(false);
    handleClose();
  };

  const handleSaveAsNew = (newIngest: LifeAdminItem) => {
    onItemExtracted(newIngest);
    setIsDuplicateModalOpen(false);
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-400 via-cyan-400 to-indigo-500 flex items-center justify-center text-slate-950 shadow-md shadow-emerald-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                Add Life-Admin Item / Document
              </h2>
              <p className="text-xs text-slate-400">
                Analyze photos of bills & IDs, or type manual text (birthdays, cards, insurance).
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent hover:border-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Mode Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-1.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-semibold">
            <button
              onClick={() => { setInputMode('text'); stopCamera(); }}
              className={`py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 ${
                inputMode === 'text'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Manual Entry / Text</span>
            </button>
            <button
              onClick={() => { setInputMode('upload'); stopCamera(); }}
              className={`py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 ${
                inputMode === 'upload'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Upload Photo / Bill</span>
            </button>
            <button
              onClick={() => { setInputMode('camera'); }}
              className={`py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 ${
                inputMode === 'camera'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Camera Scan</span>
            </button>
            <button
              onClick={() => { setInputMode('preset'); stopCamera(); }}
              className={`py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 ${
                inputMode === 'preset'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>Sample Examples</span>
            </button>
          </div>

          {/* Mode 1: Manual Entry / Plain Text */}
          {inputMode === 'text' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Type or Paste Life-Admin Note:
                </label>
                <span className="text-[11px] text-cyan-400">Natural language supported</span>
              </div>
              <textarea
                value={customText}
                onChange={e => setCustomText(e.target.value)}
                placeholder={`Examples:\n• "My son Rahul's birthday is on Oct 12 2015. Buy a superhero toy!"\n• "HDFC Regalia credit card bill due on 18th Oct. Total due ₹38,450, minimum due ₹2,500. Card ending in 4921."\n• "Health insurance policy no POL-99218 for family due on Nov 20."\n• "Car emission pollution test PUC due next month for KL-07-CB-4521."`}
                rows={5}
                className="w-full p-4 rounded-2xl bg-slate-950 border border-slate-800 focus:border-emerald-500 text-xs text-slate-200 placeholder-slate-600 outline-none transition font-sans leading-relaxed"
              />
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="text-[11px] text-slate-500">Quick Prompts:</span>
                <button
                  type="button"
                  onClick={() => setCustomText("My son Rahul's birthday is on Oct 12 2015")}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                >
                  🎂 Rahul's Birthday
                </button>
                <button
                  type="button"
                  onClick={() => setCustomText("HDFC credit card bill of ₹38,450 (min ₹2,500) is due on Oct 18 2026. Card ending 4921.")}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                >
                  💳 HDFC Card Bill
                </button>
                <button
                  type="button"
                  onClick={() => setCustomText("Vehicle RC Book KL-40-M-9812 Toyota Innova owned by Sakeer Hussain. Fitness valid till 2036-08-14.")}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                >
                  🚗 Vehicle RC
                </button>
              </div>
            </div>
          )}

          {/* Mode 2: File Upload */}
          {inputMode === 'upload' && (
            <div className="space-y-4">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Upload Scanned Document, Statement, or Invoice:
              </label>
              <div className="relative border-2 border-dashed border-slate-700 hover:border-emerald-500/60 rounded-3xl p-8 text-center bg-slate-950/50 transition">
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center justify-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400">
                    <UploadCloud className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      Click to browse or drag & drop file
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Credit card statement, Passport, Insurance policy, or Warranty invoice
                    </p>
                  </div>
                  {fileName && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-300 text-xs font-medium border border-emerald-500/30">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{fileName}</span>
                    </div>
                  )}
                </div>
              </div>

              {fileBase64 && (
                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center gap-3">
                  <img src={fileBase64} alt="Preview" className="w-16 h-16 object-cover rounded-xl border border-slate-800" />
                  <div className="text-xs">
                    <p className="font-semibold text-white">{fileName}</p>
                    <p className="text-slate-400">Ready for Scanned Document extraction</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mode 3: Camera Capture */}
          {inputMode === 'camera' && (
            <div className="space-y-4">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Device Camera Scanner:
              </label>
              
              {!isCameraActive && !fileBase64 && (
                <div className="p-8 text-center bg-slate-950 rounded-3xl border border-slate-800 space-y-3">
                  <Camera className="w-10 h-10 text-cyan-400 mx-auto" />
                  <p className="text-xs text-slate-300">
                    Capture photo of your credit card bill, passport, warranty card, or insurance sheet.
                  </p>
                  <button
                    onClick={startCamera}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition border border-slate-700"
                  >
                    Start Camera
                  </button>
                </div>
              )}

              {isCameraActive && (
                <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-black aspect-video flex items-center justify-center">
                  <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                  <div className="absolute inset-4 border-2 border-emerald-400/50 rounded-xl pointer-events-none flex items-center justify-center">
                    <div className="text-[11px] bg-black/60 px-3 py-1 rounded-full text-emerald-300 font-mono">
                      Align document inside guide
                    </div>
                  </div>
                  <div className="absolute bottom-3 flex items-center gap-3">
                    <button
                      onClick={captureCameraPhoto}
                      className="px-5 py-2 rounded-full bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg hover:bg-emerald-300 transition"
                    >
                      Capture Photo
                    </button>
                    <button
                      onClick={stopCamera}
                      className="px-3 py-2 rounded-full bg-slate-800 text-white text-xs hover:bg-slate-700 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {fileBase64 && !isCameraActive && (
                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={fileBase64} alt="Captured" className="w-14 h-14 object-cover rounded-xl" />
                    <div>
                      <p className="text-xs font-semibold text-white">Document Photo Captured</p>
                      <p className="text-[11px] text-slate-400">Ready for Scanned Document extraction</p>
                    </div>
                  </div>
                  <button
                    onClick={startCamera}
                    className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
                  >
                    Retake
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Mode 4: Presets */}
          {inputMode === 'preset' && (
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Select a Life-Admin Test Example:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {SAMPLE_LIFE_ADMIN_PRESETS.map(preset => (
                  <div
                    key={preset.id}
                    onClick={() => setSelectedPresetId(preset.id)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition text-left ${
                      selectedPresetId === preset.id
                        ? 'bg-slate-800 border-emerald-500 ring-1 ring-emerald-500/40 shadow-md'
                        : 'bg-slate-950/60 hover:bg-slate-800/50 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                        {preset.category}
                      </span>
                      <span className="text-[10px] font-mono text-indigo-300">{preset.entry_type}</span>
                    </div>
                    <h4 className="text-xs font-bold text-white line-clamp-1">{preset.title}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">{preset.description}</p>
                    <div className="mt-2 text-[10px] font-mono text-cyan-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 truncate">
                      {preset.preview_badge}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Optional Category Hint */}
          <div className="flex items-center justify-between gap-4 pt-2">
            <div className="text-xs text-slate-400">
              <span className="font-semibold text-slate-300">Category: </span>
              <span className="text-[11px]">(Auto-detected if unselected)</span>
            </div>
            <select
              value={categoryHint}
              onChange={e => setCategoryHint(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 outline-none"
            >
              <option value="">Auto-Detect Category</option>
              <option value="Credit Card Bill">Credit Card Bill</option>
              <option value="Birthday/Event">Birthday/Event</option>
              <option value="Identity">Identity (Passport, ID)</option>
              <option value="Insurance">Insurance Policy</option>
              <option value="Warranty">Warranty / Invoice</option>
              <option value="Vehicle">Vehicle / PUC</option>
            </select>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-xs text-rose-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Progress */}
          {isAnalyzing && (
            <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/30 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-emerald-400 font-semibold flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                  {currentStep}
                </span>
                <span className="text-slate-500 font-mono text-[10px]">Life-Admin Engine</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-400 to-cyan-400 h-full w-3/4 animate-pulse"></div>
              </div>
            </div>
          )}

          {/* Extraction Preview */}
          {extractionResult && (
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-emerald-500/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Life-Admin Metadata Extracted:
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  {extractionResult.entry_type}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-500">Name:</span>
                  <p className="font-semibold text-white mt-0.5">{extractionResult.document_or_event_name}</p>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-500">Category:</span>
                  <p className="font-semibold text-emerald-300 mt-0.5">{extractionResult.category}</p>
                </div>
                {extractionResult.financial_details.total_amount_due && (
                  <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-slate-500">Total Amount Due:</span>
                    <p className="font-mono font-bold text-amber-300 mt-0.5">
                      {extractionResult.financial_details.total_amount_due}
                    </p>
                  </div>
                )}
                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-500">Countdown Remaining:</span>
                  <p className="font-mono font-bold text-cyan-300 mt-0.5">
                    {extractionResult.countdown_calculations.days_remaining_countdown !== null
                      ? `${extractionResult.countdown_calculations.days_remaining_countdown} days`
                      : 'N/A'}
                  </p>
                </div>
              </div>

              {/* Potential Duplicate Alert Banner */}
              {duplicateMatch?.isDuplicate && duplicateMatch.existingItem && (
                <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-200 space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Potential Duplicate Detected: "{duplicateMatch.existingItem.document_or_event_name}"</span>
                  </div>
                  <p className="text-[11px] text-slate-300 pl-6">
                    {duplicateMatch.matchedReasons.join(' • ')}. You will be prompted to overwrite or save as new on confirmation.
                  </p>
                </div>
              )}

              <div className="text-xs bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-slate-200">
                <span className="text-slate-400">Summary: </span>
                {extractionResult.user_friendly_summary}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 sm:p-6 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-500 hidden sm:block">
            Strict output JSON schema • Days countdown calculation • Action reminders
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <button
              onClick={handleClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              Cancel
            </button>

            {!extractionResult ? (
              <button
                onClick={handleRunAnalysis}
                disabled={isAnalyzing}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 shadow-lg shadow-emerald-500/20 transition disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isAnalyzing ? 'Extracting...' : 'Analyze Life-Admin Item'}</span>
              </button>
            ) : (
              <button
                onClick={handleSaveToVault}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 shadow-lg shadow-emerald-500/20 transition"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save to Assistant</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Duplicate Confirmation Modal */}
      <DuplicateConfirmationModal
        isOpen={isDuplicateModalOpen}
        onClose={() => setIsDuplicateModalOpen(false)}
        pendingItem={pendingItem}
        duplicateMatch={duplicateMatch}
        onOverwriteExisting={handleOverwriteExisting}
        onSaveAsNew={handleSaveAsNew}
        onDiscard={() => {
          setIsDuplicateModalOpen(false);
          setPendingItem(null);
        }}
      />
    </div>
  );
};
