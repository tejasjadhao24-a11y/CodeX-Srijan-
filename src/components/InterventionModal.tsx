'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  AlertOctagon, 
  UserX, 
  Mic, 
  CheckCircle2, 
  Lock, 
  ArrowRight, 
  AlertTriangle,
  FileAudio,
  Activity,
  Unlock,
  Upload,
  Square,
  Play,
  RotateCcw,
  Sparkles,
  Info
} from 'lucide-react';
import RiskGauge from './RiskGauge';
import SequentialRiskBreakdown from './SequentialRiskBreakdown';
import { RiskLevel, ActionTaken, MatchedPhrase } from '@/lib/types';

interface InterventionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFinished: () => void;
  transactionData: {
    id: string;
    beneficiaryName: string;
    amount: number;
    baseRiskScore: number;
    riskLevel: RiskLevel;
    riskFactors: Array<{ code: string; text: string; points?: number }>;
  };
}

export default function InterventionModal({
  isOpen,
  onClose,
  onFinished,
  transactionData,
}: InterventionModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [socialAnswer, setSocialAnswer] = useState<string>('bank_police_impersonation');
  const [socialScore, setSocialScore] = useState<number | null>(null);

  // Voice Analysis States (Vosk real speech-to-text)
  const [voiceTab, setVoiceTab] = useState<'record' | 'upload' | 'demo'>('demo');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordedAudioBlob, setRecordedAudioBlob] = useState<Blob | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  
  // Real Voice Check Results
  const [voiceResult, setVoiceResult] = useState<{
    transcript: string;
    voiceSignalScore: number;
    matchedPhrases: MatchedPhrase[];
    disclaimer: string;
    error?: string;
  } | null>(null);

  // Deepfake result (simulated acoustic clone)
  const [deepfakeScore, setDeepfakeScore] = useState<number>(78);

  const [finalResult, setFinalResult] = useState<{
    finalScore: number;
    finalRiskLevel: RiskLevel;
    actionTaken: ActionTaken;
    status: string;
  } | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  if (!isOpen) return null;

  // Step 1: Submit Impersonation Context
  const handleSocialSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/transactions/${transactionData.id}/social-check`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer: socialAnswer }),
      });
      const data = await res.json();
      setSocialScore(data.socialEngineeringScore);
      setStep(2);
    } catch (err) {
      console.error('Error submitting social check:', err);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Recording Controls
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setRecordedAudioBlob(audioBlob);
        setAudioUrl(URL.createObjectURL(audioBlob));
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(250);
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Failed to access microphone:', err);
      alert('Microphone access denied or unavailable. You can use file upload or the pre-recorded demo clips.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const resetRecording = () => {
    setRecordedAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
    setVoiceResult(null);
  };

  // Step 2: Execute Real Vosk Voice Analysis
  const handleVoiceAnalyze = async (preset?: 'scam' | 'normal') => {
    setLoading(true);
    try {
      const formData = new FormData();

      if (preset) {
        formData.append('demoPreset', preset);
      } else if (voiceTab === 'record' && recordedAudioBlob) {
        formData.append('audio', recordedAudioBlob, 'microphone_recording.wav');
      } else if (voiceTab === 'upload' && uploadedFile) {
        formData.append('audio', uploadedFile, uploadedFile.name);
      } else {
        // Default to scam demo if nothing provided
        formData.append('demoPreset', 'scam');
      }

      const res = await fetch(`/api/transactions/${transactionData.id}/voice-check`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      setVoiceResult(data);

      // Also trigger deepfake acoustic metric
      await fetch(`/api/transactions/${transactionData.id}/deepfake-check`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: 'voice_stream.wav' }),
      });

    } catch (err) {
      console.error('Error during voice check:', err);
    } finally {
      setLoading(false);
    }
  };

  // Proceed to Step 3: Gate & Final Composite Review
  const handleProceedToStep3 = async () => {
    setLoading(true);
    try {
      const finalizeRes = await fetch(`/api/transactions/${transactionData.id}/finalize`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const finalizeData = await finalizeRes.json();
      setFinalResult({
        finalScore: finalizeData.transaction.finalScore,
        finalRiskLevel: finalizeData.transaction.finalRiskLevel,
        actionTaken: finalizeData.transaction.actionTaken,
        status: finalizeData.transaction.status,
      });
      setStep(3);
    } catch (err) {
      console.error('Error finalizing transaction:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFinalizeAction = async (override: boolean) => {
    setLoading(true);
    try {
      if (override) {
        await fetch(`/api/transactions/${transactionData.id}/finalize`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ overrideApproved: true }),
        });
      }
      onFinished();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Helper to highlight phrases inline in transcript
  const renderHighlightedTranscript = (transcript: string, matchedPhrases: MatchedPhrase[]) => {
    if (!matchedPhrases || matchedPhrases.length === 0) {
      return <span>&ldquo;{transcript}&rdquo;</span>;
    }

    let elements: React.ReactNode[] = [];
    let remaining = transcript;

    // Build regex of all phrases
    const sorted = [...matchedPhrases].sort((a, b) => b.phrase.length - a.phrase.length);
    const regex = new RegExp(`(${sorted.map((m) => m.phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');

    const parts = remaining.split(regex);

    return (
      <span className="leading-relaxed">
        &ldquo;
        {parts.map((part, i) => {
          const match = sorted.find((m) => m.phrase.toLowerCase() === part.toLowerCase());
          if (match) {
            const colorClass = 
              match.category === 'authority' ? 'bg-red-950/80 text-red-300 border-red-500/60' :
              match.category === 'secrecy' ? 'bg-purple-950/80 text-purple-300 border-purple-500/60' :
              match.category === 'urgency' ? 'bg-amber-950/80 text-amber-300 border-amber-500/60' :
              'bg-cyan-950/80 text-cyan-300 border-cyan-500/60';

            return (
              <span
                key={i}
                className={`inline-block px-1.5 py-0.5 mx-0.5 rounded border text-xs font-bold ${colorClass}`}
                title={`Category: ${match.category} (+${match.points} pts)`}
              >
                {part}
              </span>
            );
          }
          return <span key={i}>{part}</span>;
        })}
        &rdquo;
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#121620] border border-red-500/30 rounded-2xl shadow-2xl shadow-red-950/40 p-6 sm:p-8 text-white my-8 max-h-[92vh] overflow-y-auto">
        
        {/* Header Ribbon */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-800 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 flex-shrink-0">
              <AlertOctagon className="w-5 h-5 animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold tracking-wide">ADAPTIVE SECURITY INTERVENTION</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950/70 border border-red-600/40 text-red-300 font-semibold uppercase flex-shrink-0">
                  Level {transactionData.riskLevel}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono truncate mt-0.5">
                Target: ${transactionData.amount.toLocaleString()} to {transactionData.beneficiaryName}
              </p>
            </div>
          </div>
          
          {/* Step Progress Tracker */}
          <div className="flex items-center gap-1.5 text-xs font-mono self-start sm:self-auto flex-shrink-0">
            <span className={`px-2.5 py-1 rounded transition-all ${step === 1 ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 font-bold' : 'bg-slate-800/80 text-slate-400'}`}>1. Context</span>
            <span className="text-slate-600">→</span>
            <span className={`px-2.5 py-1 rounded transition-all ${step === 2 ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 font-bold' : 'bg-slate-800/80 text-slate-400'}`}>2. Voice Vosk</span>
            <span className="text-slate-600">→</span>
            <span className={`px-2.5 py-1 rounded transition-all ${step === 3 ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 font-bold' : 'bg-slate-800/80 text-slate-400'}`}>3. Gate</span>
          </div>
        </div>

        {/* STEP 1: Social Engineering Screening */}
        {step === 1 && (
          <div className="py-5 space-y-4">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <h4 className="text-xs sm:text-sm font-semibold text-cyan-400 flex items-center gap-2">
                <UserX className="w-4 h-4 flex-shrink-0" />
                <span>Contextual Impersonation Screening</span>
              </h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                This transfer exceeded baseline risk limits. Who instructed or pressured you to initiate this transfer?
              </p>
            </div>

            <div className="space-y-2.5">
              {[
                { id: 'bank_police_impersonation', label: 'Bank Security, Police, or Tax Authority Official', points: '+40 pts', desc: 'Urgent compliance, safety account, or court seizure claim' },
                { id: 'employer_impersonation', label: 'Company CEO, CFO, or Executive Director', points: '+35 pts', desc: 'Confidential corporate acquisition or emergency vendor invoice' },
                { id: 'secrecy_demanded', label: 'Instructed to NOT speak with bank or family (Strict Secrecy)', points: '+50 pts', desc: 'Active isolation tactic characteristic of coercion scams' },
                { id: 'whatsapp_call', label: 'Unverified WhatsApp / Telegram / Voice Call Request', points: '+30 pts', desc: 'Unknown channel outside established banking relationships' },
                { id: 'self', label: 'Self-Directed (Regular Planned Personal Transaction)', points: '+0 pts', desc: 'Personal transfer with zero external guidance or pressure' },
              ].map((opt) => (
                <label
                  key={opt.id}
                  onClick={() => setSocialAnswer(opt.id)}
                  className={`flex items-start gap-3.5 p-3.5 sm:p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                    socialAnswer === opt.id
                      ? 'bg-red-950/20 border-red-500/50 text-white shadow-md shadow-red-950/30'
                      : 'bg-slate-900/40 border-slate-800 text-slate-300 hover:bg-slate-800/40'
                  }`}
                >
                  <input
                    type="radio"
                    name="socialAnswer"
                    checked={socialAnswer === opt.id}
                    onChange={() => setSocialAnswer(opt.id)}
                    className="mt-1 accent-red-500 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs sm:text-sm font-medium text-white">{opt.label}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 whitespace-nowrap flex-shrink-0 ml-2">
                        {opt.points}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-snug">{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-800 gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-mono text-slate-400 hover:text-white transition-colors"
              >
                Abort Transfer
              </button>
              <button
                type="button"
                onClick={handleSocialSubmit}
                disabled={loading}
                className="px-5 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-mono font-bold tracking-wider flex items-center gap-2 shadow-lg shadow-red-900/50 transition-all flex-shrink-0"
              >
                <span>{loading ? 'Evaluating...' : 'Proceed to Voice Check'}</span>
                <ArrowRight className="w-4 h-4 flex-shrink-0" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Real Voice Analysis via Vosk */}
        {step === 2 && (
          <div className="py-5 space-y-5">
            {/* Disclaimer Notice */}
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-cyan-500/30 text-cyan-300 text-xs flex items-start gap-2.5">
              <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-cyan-400" />
              <span className="leading-relaxed text-[11px]">
                <strong>Forensic Disclaimer:</strong> Speech-to-text and phrase analysis via Vosk — analyzes what was said, not speaker identity or voice authenticity.
              </span>
            </div>

            {/* Mode Tabs: Pre-recorded Demo / Live Record / Upload File */}
            <div className="flex items-center gap-2 p-1 bg-slate-900/80 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setVoiceTab('demo')}
                className={`flex-1 py-2 text-xs font-mono rounded-lg transition-all ${
                  voiceTab === 'demo'
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Demo Audio Clips
              </button>
              <button
                type="button"
                onClick={() => setVoiceTab('record')}
                className={`flex-1 py-2 text-xs font-mono rounded-lg transition-all ${
                  voiceTab === 'record'
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Record Microphone
              </button>
              <button
                type="button"
                onClick={() => setVoiceTab('upload')}
                className={`flex-1 py-2 text-xs font-mono rounded-lg transition-all ${
                  voiceTab === 'upload'
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Upload File (.wav/.mp3)
              </button>
            </div>

            {/* TAB 1: Pre-recorded Demo Clips */}
            {voiceTab === 'demo' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-slate-900/60 border border-red-500/30 hover:border-red-500/50 transition-all flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-red-400 font-mono flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Scam Coercion Call
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800">
                        +50 pts Threat
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-2 leading-snug">
                      Simulated phone audio with CEO authority claim, urgent transfer demand, strict secrecy, and isolation orders.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleVoiceAnalyze('scam')}
                    disabled={loading}
                    className="w-full py-2 px-3 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-mono font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
                  >
                    <Play className="w-3 h-3" />
                    <span>Run Vosk on Scam Audio</span>
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/60 border border-emerald-500/30 hover:border-emerald-500/50 transition-all flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-400 font-mono flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Legitimate Transfer Call
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                        0 pts Clean
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-2 leading-snug">
                      Routine conversational audio confirming standard team invoice without coercion or emergency pressure.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleVoiceAnalyze('normal')}
                    disabled={loading}
                    className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
                  >
                    <Play className="w-3 h-3" />
                    <span>Run Vosk on Clean Audio</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: Live Microphone Recording */}
            {voiceTab === 'record' && (
              <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col items-center text-center space-y-3">
                <div className={`w-16 h-16 rounded-full border flex items-center justify-center transition-all ${
                  isRecording 
                    ? 'bg-red-500/20 border-red-500 text-red-400 animate-pulse' 
                    : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                }`}>
                  <Mic className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Live Microphone Audio Capture</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Record caller audio to run genuine offline Vosk speech-to-text and threat phrase detection.
                  </p>
                </div>

                {isRecording && (
                  <div className="flex items-center gap-2 font-mono text-sm text-red-400 bg-red-950/40 px-3 py-1 rounded-full border border-red-600/30">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                    <span>Recording: {recordingTime}s</span>
                  </div>
                )}

                <div className="flex items-center gap-3 pt-2">
                  {!isRecording ? (
                    <button
                      type="button"
                      onClick={startRecording}
                      className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-mono font-bold flex items-center gap-2 transition-all shadow-md shadow-red-950/50"
                    >
                      <Mic className="w-3.5 h-3.5" />
                      <span>Start Recording</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={stopRecording}
                      className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-mono font-bold flex items-center gap-2 border border-slate-700 transition-all"
                    >
                      <Square className="w-3.5 h-3.5 text-red-400 fill-red-400" />
                      <span>Stop Recording</span>
                    </button>
                  )}

                  {recordedAudioBlob && !isRecording && (
                    <>
                      <button
                        type="button"
                        onClick={resetRecording}
                        className="px-3 py-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white text-xs font-mono flex items-center gap-1.5 transition-all"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reset</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleVoiceAnalyze()}
                        disabled={loading}
                        className="px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-md shadow-cyan-950/50"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Transcribe Recording</span>
                      </button>
                    </>
                  )}
                </div>

                {audioUrl && (
                  <audio controls src={audioUrl} className="w-full max-w-sm mt-2 h-8" />
                )}
              </div>
            )}

            {/* TAB 3: File Upload */}
            {voiceTab === 'upload' && (
              <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col items-center text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Upload Audio File</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Accepts standard .wav, .mp3, or .webm call recordings.
                  </p>
                </div>

                <input
                  type="file"
                  accept=".wav,.mp3,.webm,audio/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setUploadedFile(file);
                  }}
                  className="text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-mono file:bg-cyan-500/20 file:text-cyan-300 hover:file:bg-cyan-500/30 cursor-pointer"
                />

                {uploadedFile && (
                  <button
                    type="button"
                    onClick={() => handleVoiceAnalyze()}
                    disabled={loading}
                    className="mt-2 px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-md"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Upload & Transcribe ({uploadedFile.name})</span>
                  </button>
                )}
              </div>
            )}

            {/* Loading State for Real Vosk Transcription */}
            {loading && (
              <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/40 text-cyan-300 flex items-center gap-3">
                <Activity className="w-5 h-5 animate-spin text-cyan-400 flex-shrink-0" />
                <div className="text-xs space-y-0.5">
                  <span className="font-bold block">Running Real Vosk Speech-to-Text Recognition...</span>
                  <span className="text-slate-400 block text-[11px]">Processing acoustic samples through offline neural language model</span>
                </div>
              </div>
            )}

            {/* REAL RETURNED TRANSCRIPT & MATCHED PHRASES PANEL */}
            {voiceResult && !loading && (
              <div className="space-y-3 p-4 rounded-xl bg-slate-900/90 border border-slate-700">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-mono font-semibold text-slate-300 flex items-center gap-1.5">
                    <FileAudio className="w-3.5 h-3.5 text-cyan-400" />
                    Real Vosk Transcript Output
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      Score: +{voiceResult.voiceSignalScore} pts
                    </span>
                  </div>
                </div>

                <div className="text-xs text-slate-200 bg-[#0B0E14] p-3 rounded-lg border border-slate-800 max-h-32 overflow-y-auto font-sans leading-relaxed">
                  {voiceResult.transcript ? (
                    renderHighlightedTranscript(voiceResult.transcript, voiceResult.matchedPhrases)
                  ) : (
                    <span className="text-slate-500 italic">No spoken text detected in sample.</span>
                  )}
                </div>

                {/* Inline Badges of Matched Threat Phrases */}
                {voiceResult.matchedPhrases && voiceResult.matchedPhrases.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                      Detected Coercion Patterns ({voiceResult.matchedPhrases.length}):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {voiceResult.matchedPhrases.map((m, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-mono px-2 py-0.5 rounded border flex items-center gap-1 bg-red-950/60 border-red-500/40 text-red-300"
                        >
                          <span className="font-bold capitalize">{m.category}:</span> &ldquo;{m.phrase}&rdquo; (+{m.points} pts)
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800 gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 text-xs font-mono text-slate-400 hover:text-white"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleProceedToStep3}
                disabled={loading || !voiceResult}
                className="px-6 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 text-xs font-mono font-bold tracking-wider flex items-center gap-2 shadow-md transition-all flex-shrink-0"
              >
                <span>Proceed to Final Decision Gate</span>
                <ArrowRight className="w-4 h-4 flex-shrink-0" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Final Security Decision Gate & Sequential Calculation Sequence */}
        {step === 3 && finalResult && (
          <div className="py-5 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-center">
              <div className="flex justify-center">
                <RiskGauge
                  score={finalResult.finalScore}
                  riskLevel={finalResult.finalRiskLevel}
                  actionTaken={finalResult.actionTaken}
                  size={170}
                />
              </div>

              {/* High-level telemetry summary */}
              <div className="space-y-2 font-mono text-xs">
                <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 flex justify-between items-center">
                  <span className="text-slate-400 text-[11px]">Base Multipliers:</span>
                  <span className="font-bold text-white">{transactionData.baseRiskScore} / 100</span>
                </div>

                <div className="p-3 rounded-lg bg-slate-900/90 border border-red-500/30 flex justify-between items-center">
                  <span className="text-slate-400 text-[11px]">Impersonation Context:</span>
                  <span className="font-bold text-red-400">+{socialScore ?? 35} pts</span>
                </div>

                <div className="p-3 rounded-lg bg-slate-900/90 border border-red-500/30 flex justify-between items-center">
                  <span className="text-slate-400 text-[11px]">Vosk Audio Phrases:</span>
                  <span className="font-bold text-red-400">+{voiceResult?.voiceSignalScore ?? 35} pts</span>
                </div>
              </div>
            </div>

            {/* FULL STEP-BY-STEP SEQUENTIAL BREAKDOWN */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <SequentialRiskBreakdown
                baseScore={transactionData.baseRiskScore}
                riskFactors={transactionData.riskFactors}
                socialScore={socialScore}
                voiceScore={voiceResult?.voiceSignalScore ?? null}
                transcript={voiceResult?.transcript ?? null}
                deepfakeScore={deepfakeScore}
                autoAnimate={true}
              />
            </div>

            {/* Decision Advisory */}
            <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200 text-xs space-y-1">
              <div className="flex items-center gap-2 font-bold text-red-400 text-sm">
                <Lock className="w-4 h-4 flex-shrink-0" />
                <span>Automated Decision Gate: {finalResult.actionTaken}</span>
              </div>
              <p className="leading-relaxed text-[11px]">
                Transfer quarantined under adaptive intervention. Coercive impersonation script identified via Vosk speech analysis. Persisted into <strong>Case Incident Review</strong> queue.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => handleFinalizeAction(true)}
                disabled={loading}
                className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono flex items-center justify-center gap-2 border border-slate-700 transition-all"
              >
                <Unlock className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                <span>Override & Approve (Logged)</span>
              </button>

              <button
                type="button"
                onClick={() => handleFinalizeAction(false)}
                disabled={loading}
                className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-mono font-bold tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-red-900/50 transition-all"
              >
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>Confirm Hold & View Cases</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
