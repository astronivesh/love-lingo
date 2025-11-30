import React, { useState, useRef, useEffect } from 'react';
import { PARTNER_OPTIONS, QUICK_SCENARIOS } from '../constants';
import { PartnerType, RelationshipProfile, MediaType } from '../types';
import { Send, Sparkles, HelpCircle, Settings2, CheckCircle2, Mic, Video, StopCircle, Camera, TextCursor, X, AlertCircle } from 'lucide-react';

interface InputFormProps {
  onDecode: (message: string, partnerType: PartnerType, context: string, mediaType: MediaType, mediaData?: string, mimeType?: string) => void;
  isLoading: boolean;
  onOpenProfile: () => void;
  profile: RelationshipProfile | null;
}

const MIN_RECORDING_MS = 3000; // 3 seconds minimum

const InputForm: React.FC<InputFormProps> = ({ onDecode, isLoading, onOpenProfile, profile }) => {
  const [activeTab, setActiveTab] = useState<'text' | 'scanner'>('text');
  
  // Text State
  const [message, setMessage] = useState('');
  const [context, setContext] = useState('');
  const [partnerType, setPartnerType] = useState<PartnerType>(PartnerType.GF);

  // Media State
  const [isRecording, setIsRecording] = useState(false);
  const [mediaBlob, setMediaBlob] = useState<Blob | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [scannerMode, setScannerMode] = useState<'video' | 'audio'>('video');
  const [recordingWarning, setRecordingWarning] = useState<string | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordingStartTimeRef = useRef<number>(0);
  const isShortRecordingRef = useRef<boolean>(false);
  const timerIntervalRef = useRef<number | null>(null);

  // Cleanup stream on unmount
  useEffect(() => {
    return () => {
      stopStream();
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const startStream = async (mode: 'video' | 'audio') => {
    stopStream();
    setRecordingWarning(null);
    try {
      const constraints = mode === 'video' 
        ? { video: { facingMode: "user" }, audio: true }
        : { audio: true, video: false };
        
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current && mode === 'video') {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing media devices:", err);
      alert("Could not access camera/microphone. Please check permissions.");
    }
  };

  const handleTabChange = (tab: 'text' | 'scanner') => {
    setActiveTab(tab);
    if (tab === 'scanner') {
      startStream(scannerMode);
    } else {
      stopStream();
      setMediaBlob(null);
      setMediaPreview(null);
      setRecordingWarning(null);
    }
  };

  const handleScannerModeChange = (mode: 'video' | 'audio') => {
    setScannerMode(mode);
    setMediaBlob(null);
    setMediaPreview(null);
    setRecordingWarning(null);
    startStream(mode);
  };

  const startRecording = () => {
    if (!streamRef.current) return;

    setRecordingWarning(null);
    setMediaBlob(null);
    setMediaPreview(null);
    setRecordingDuration(0);
    isShortRecordingRef.current = false;
    
    chunksRef.current = [];
    const mediaRecorder = new MediaRecorder(streamRef.current);
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    mediaRecorder.onstop = () => {
      if (isShortRecordingRef.current) {
        // Discard data if too short
        return;
      }
      
      const type = scannerMode === 'video' ? 'video/webm' : 'audio/webm';
      const blob = new Blob(chunksRef.current, { type });
      setMediaBlob(blob);
      setMediaPreview(URL.createObjectURL(blob));
    };

    mediaRecorder.start();
    setIsRecording(true);
    recordingStartTimeRef.current = Date.now();

    // Start Timer
    timerIntervalRef.current = window.setInterval(() => {
        const duration = Date.now() - recordingStartTimeRef.current;
        setRecordingDuration(duration);
    }, 100);
    
    // Auto stop after 15 seconds max
    setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
            stopRecording();
        }
    }, 15000);
  };

  const stopRecording = () => {
    if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
    }

    const duration = Date.now() - recordingStartTimeRef.current;
    
    if (duration < MIN_RECORDING_MS) {
        isShortRecordingRef.current = true;
        setRecordingWarning("Not enough data to tell, keep recording more to understand.");
    }

    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleResetMedia = () => {
    setMediaBlob(null);
    setMediaPreview(null);
    setRecordingWarning(null);
    setRecordingDuration(0);
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        // Remove "data:video/webm;base64," prefix
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (activeTab === 'text') {
      if (message.trim()) {
        onDecode(message, partnerType, context, MediaType.TEXT);
      }
    } else {
      if (mediaBlob) {
        const base64 = await blobToBase64(mediaBlob);
        const mimeType = mediaBlob.type; // e.g. 'video/webm'
        onDecode(
            scannerMode === 'video' ? "Video Analysis" : "Audio Analysis", 
            partnerType, 
            context, 
            scannerMode === 'video' ? MediaType.VIDEO : MediaType.AUDIO,
            base64,
            mimeType
        );
      }
    }
  };

  const handleScenarioClick = (sMessage: string, sContext: string) => {
    setActiveTab('text');
    setMessage(sMessage);
    setContext(sContext);
  };

  const hasProfileData = profile && (profile.userStyle || profile.partnerStyle);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      
      {/* Tabs */}
      <div className="flex border-b border-slate-100">
        <button
          onClick={() => handleTabChange('text')}
          className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
            activeTab === 'text' 
              ? 'text-brand-600 bg-brand-50/50 border-b-2 border-brand-500' 
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
          }`}
        >
          <TextCursor size={16} />
          Text Decoder
        </button>
        <button
          onClick={() => handleTabChange('scanner')}
          className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
            activeTab === 'scanner' 
              ? 'text-indigo-600 bg-indigo-50/50 border-b-2 border-indigo-500' 
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Camera size={16} />
          Live Scanner
        </button>
      </div>

      <div className="p-6 space-y-6">
        
        {/* Top Bar: Partner & Profile */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="w-full">
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                Who are we analyzing?
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {PARTNER_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  const isSelected = partnerType === option.value;
                  const activeColor = activeTab === 'text' ? 'brand' : 'indigo';
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setPartnerType(option.value)}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200 ${
                        isSelected
                          ? `bg-${activeColor}-50 border-${activeColor}-500 text-${activeColor}-700 ring-2 ring-${activeColor}-200 ring-offset-1`
                          : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <Icon size={20} className={isSelected ? `text-${activeColor}-500` : 'text-slate-400'} />
                      <span className="text-xs font-medium mt-1.5">{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
        </div>

        {/* Relationship DNA Button */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onOpenProfile}
            className={`text-xs font-medium px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
              hasProfileData 
              ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100'
              : 'bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100 hover:text-slate-700'
            }`}
          >
            {hasProfileData ? <CheckCircle2 size={14} /> : <Settings2 size={14} />}
            {hasProfileData ? 'DNA Active' : 'Add Relationship DNA'}
          </button>
        </div>

        {/* --- TEXT MODE --- */}
        {activeTab === 'text' && (
          <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in">
            <div>
              <label htmlFor="message" className="block text-sm font-semibold text-slate-700 mb-1">
                The Message
              </label>
              <div className="relative">
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder='e.g., "I&apos;m fine." or "Do whatever you want."'
                  className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-100 transition-all resize-none text-slate-800 placeholder:text-slate-400"
                  rows={3}
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1 mb-1">
                <label htmlFor="context" className="block text-sm font-semibold text-slate-700">
                  Context (Optional)
                </label>
              </div>
              <input
                id="context"
                type="text"
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder='e.g., "I forgot our anniversary"'
                className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-100 transition-all text-slate-800 placeholder:text-slate-400"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !message.trim()}
              className={`w-full py-4 rounded-xl font-bold text-white shadow-lg shadow-brand-200 flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] ${
                isLoading || !message.trim()
                  ? 'bg-slate-300 cursor-not-allowed shadow-none'
                  : 'bg-gradient-to-r from-brand-500 to-rose-600 hover:from-brand-600 hover:to-rose-700'
              }`}
            >
              {isLoading ? (
                <>
                  <Sparkles className="animate-spin" size={20} />
                  <span>Decoding Signal...</span>
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  <span>Decode Meaning</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* --- SCANNER MODE --- */}
        {activeTab === 'scanner' && (
          <div className="space-y-4 animate-fade-in">
             <div className="flex gap-2 justify-center mb-2">
                <button 
                  onClick={() => handleScannerModeChange('video')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 ${scannerMode === 'video' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'}`}
                >
                  <Video size={14} /> Video Body Language
                </button>
                <button 
                  onClick={() => handleScannerModeChange('audio')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 ${scannerMode === 'audio' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'}`}
                >
                  <Mic size={14} /> Voice Tone Analysis
                </button>
             </div>

             {/* Media Preview Area */}
             <div className="relative bg-black rounded-2xl overflow-hidden aspect-[4/3] flex items-center justify-center border-4 border-slate-100 shadow-inner group">
                 
                 {mediaBlob ? (
                    /* Recorded Preview */
                    <div className="w-full h-full relative">
                        {scannerMode === 'video' ? (
                          <video src={mediaPreview!} controls className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-indigo-900 text-white flex-col gap-2">
                             <div className="flex gap-1 h-8 items-end">
                                <span className="w-2 bg-indigo-400 h-4 animate-pulse"></span>
                                <span className="w-2 bg-indigo-400 h-8 animate-pulse delay-75"></span>
                                <span className="w-2 bg-indigo-400 h-6 animate-pulse delay-150"></span>
                                <span className="w-2 bg-indigo-400 h-3 animate-pulse"></span>
                             </div>
                             <span className="text-xs font-mono">AUDIO CAPTURED</span>
                          </div>
                        )}
                        <button 
                          onClick={handleResetMedia}
                          className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-red-500 transition-colors z-10"
                        >
                          <X size={16} />
                        </button>
                    </div>
                 ) : (
                    /* Live Stream */
                    <>
                        {scannerMode === 'video' ? (
                          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform scale-x-[-1]" />
                        ) : (
                          <div className="flex flex-col items-center text-indigo-300 gap-4">
                             <div className="w-24 h-24 rounded-full border-2 border-indigo-500/30 flex items-center justify-center animate-pulse">
                                <Mic size={40} />
                             </div>
                             <p className="text-xs">Listening for Vocal Cues...</p>
                          </div>
                        )}
                        
                        {/* Overlay UI */}
                        {!isRecording && !recordingWarning && (
                           <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                              <button
                                onClick={startRecording}
                                className="w-14 h-14 rounded-full border-4 border-white flex items-center justify-center bg-red-500 hover:bg-red-600 transition-colors shadow-lg transform hover:scale-105"
                              >
                                <div className="w-6 h-6 bg-white rounded-sm"></div>
                              </button>
                           </div>
                        )}
                        
                        {/* Warning Message Overlay */}
                        {recordingWarning && !isRecording && (
                             <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
                                <div className="bg-red-500/20 p-4 rounded-full mb-3">
                                    <AlertCircle size={32} className="text-red-400" />
                                </div>
                                <h4 className="text-white font-bold text-lg mb-2">Clip Too Short</h4>
                                <p className="text-slate-200 text-sm mb-6 max-w-xs">{recordingWarning}</p>
                                <button
                                    onClick={startRecording}
                                    className="px-6 py-2 bg-white text-slate-900 rounded-full font-bold text-sm hover:bg-slate-100 transition-colors"
                                >
                                    Try Again
                                </button>
                             </div>
                        )}
                    </>
                 )}

                 {/* Recording State Overlay */}
                 {isRecording && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/10 z-20">
                       <div className="absolute top-4 bg-black/50 px-3 py-1 rounded-full flex items-center gap-2">
                           <div className={`w-2 h-2 rounded-full ${recordingDuration > MIN_RECORDING_MS ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`}></div>
                           <span className="text-white font-mono text-xs">{(recordingDuration / 1000).toFixed(1)}s</span>
                       </div>

                       {/* Progress Bar for Minimum Duration */}
                       {recordingDuration < MIN_RECORDING_MS && (
                           <div className="absolute top-12 w-24 h-1 bg-white/20 rounded-full overflow-hidden">
                               <div 
                                style={{ width: `${(recordingDuration / MIN_RECORDING_MS) * 100}%` }}
                                className="h-full bg-red-500 transition-all duration-100"
                               ></div>
                           </div>
                       )}

                       <div className="animate-ping absolute w-20 h-20 rounded-full bg-red-500/20"></div>
                       <button
                          onClick={stopRecording}
                          className="relative z-30 w-16 h-16 rounded-full bg-red-600 flex items-center justify-center text-white font-bold shadow-xl border-4 border-white/20 hover:scale-105 transition-transform"
                       >
                         <StopCircle size={32} />
                       </button>
                       <p className="mt-4 bg-black/50 px-2 py-1 rounded text-white text-xs font-mono">
                           {recordingDuration < MIN_RECORDING_MS ? "KEEP GOING..." : "RECORDING"}
                       </p>
                    </div>
                 )}
             </div>

             <div>
                <input
                  type="text"
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder='Optional: What are they talking about?'
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all text-slate-800 placeholder:text-slate-400 text-sm"
                />
             </div>

             <button
              onClick={handleSubmit}
              disabled={isLoading || !mediaBlob}
              className={`w-full py-4 rounded-xl font-bold text-white shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] ${
                isLoading || !mediaBlob
                  ? 'bg-slate-300 cursor-not-allowed shadow-none'
                  : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700'
              }`}
            >
              {isLoading ? (
                <>
                  <Sparkles className="animate-spin" size={20} />
                  <span>Analyzing Biometrics...</span>
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  <span>Analyze {scannerMode === 'video' ? 'Body Language' : 'Voice'}</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Quick Scenarios (Only for Text) */}
      {activeTab === 'text' && (
        <div className="px-6 pb-6 pt-0">
            <div className="pt-4 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Quick Scenarios
                </p>
                <div className="flex flex-wrap gap-2">
                {QUICK_SCENARIOS.map((scenario, idx) => (
                    <button
                    key={idx}
                    onClick={() => handleScenarioClick(scenario.message, scenario.context)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs rounded-full transition-colors border border-transparent hover:border-slate-300"
                    >
                    {scenario.message}
                    </button>
                ))}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default InputForm;