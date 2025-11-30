import React, { useRef, useState } from 'react';
import { AnalysisResult, Suggestion, PartnerType, RelationshipProfile } from '../types';
import { DANGER_LEVEL_LABELS } from '../constants';
import { simulateReply } from '../services/geminiService';
import { AlertTriangle, Quote, ThumbsUp, Copy, Check, MessageSquare, Send, RefreshCw, Share2 } from 'lucide-react';

interface ResultCardProps {
  result: AnalysisResult | null;
  isLoading: boolean;
  originalMessage: string;
  partnerType: PartnerType;
  context: string;
  profile: RelationshipProfile | null;
}

const ResultCard: React.FC<ResultCardProps> = ({ 
  result, 
  isLoading, 
  originalMessage, 
  partnerType, 
  context,
  profile 
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [simReply, setSimReply] = useState('');
  const [simResponse, setSimResponse] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  
  const resultRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (result && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Reset simulation when new result comes in
      setSimResponse(null);
      setSimReply('');
    }
  }, [result]);

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleShare = async () => {
    if (navigator.share && result) {
      try {
        await navigator.share({
          title: 'Relationship Decoder Result',
          text: `My ${partnerType} said: "${originalMessage}"\n\nTranslation: ${result.translation}\nDanger Level: ${result.dangerLevel}/10`,
          url: window.location.href
        });
      } catch (err) {
        console.log('Error sharing', err);
      }
    } else {
        // Fallback or just ignore if not supported
    }
  };

  const handleSimulate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!simReply.trim() || !result) return;

    setIsSimulating(true);
    setSimResponse(null);

    try {
      const response = await simulateReply(
        partnerType,
        originalMessage,
        context,
        simReply,
        result.tone,
        profile
      );
      setSimResponse(response);
      // Scroll to chat response
      setTimeout(() => {
        chatRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 100);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSimulating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse mt-8">
        <div className="h-64 bg-slate-200/50 rounded-2xl w-full"></div>
        <div className="h-32 bg-slate-200/50 rounded-2xl w-full"></div>
      </div>
    );
  }

  if (!result) return null;

  // Determine Danger Color
  const getDangerColor = (level: number) => {
    if (level <= 3) return 'bg-green-500';
    if (level <= 6) return 'bg-yellow-500';
    return 'bg-red-500';
  };
  
  const getDangerBg = (level: number) => {
    if (level <= 3) return 'bg-green-50 text-green-700 border-green-200';
    if (level <= 6) return 'bg-yellow-50 text-yellow-800 border-yellow-200';
    return 'bg-red-50 text-red-700 border-red-200';
  };

  const dangerColor = getDangerColor(result.dangerLevel);
  const dangerBg = getDangerBg(result.dangerLevel);
  const dangerLabel = DANGER_LEVEL_LABELS[result.dangerLevel] || "Unknown";

  return (
    <div ref={resultRef} className="space-y-8 pb-12 animate-fade-in-up">
      
      {/* Main Analysis Card */}
      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 overflow-hidden border border-slate-100 ring-1 ring-slate-200">
        
        {/* Header / Danger Meter */}
        <div className="p-6 sm:p-8 border-b border-slate-100 bg-slate-50/80 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <RefreshCw size={12} />
              Analysis Result
            </span>
            <div className="flex gap-2">
                 <button 
                  onClick={handleShare}
                  className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-full transition-colors"
                  title="Share Result"
                 >
                   <Share2 size={16} />
                 </button>
                <div className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 shadow-sm ${dangerBg}`}>
                  <AlertTriangle size={12} />
                  <span>Level {result.dangerLevel}: {dangerLabel}</span>
                </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="relative w-full h-3 bg-slate-200 rounded-full overflow-hidden">
             <div className="absolute inset-0 bg-slate-200/50 w-full h-full"></div>
             <div 
              className={`h-full rounded-full transition-all duration-1000 ease-out shadow-sm ${dangerColor}`} 
              style={{ width: `${result.dangerLevel * 10}%` }}
            ></div>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-8">
          
          {/* The Translation */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-brand-600">
              <Quote className="rotate-180 fill-current opacity-20" size={24} />
              <h3 className="font-bold text-xl text-slate-800">What it actually means</h3>
            </div>
            <p className="text-slate-700 text-lg sm:text-xl leading-relaxed font-medium pl-4 border-l-4 border-brand-200 rounded-sm">
              {result.translation}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             {/* Tone */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex flex-col justify-between">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Detected Tone</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-indigo-400"></div>
                <p className="text-slate-800 font-semibold capitalize text-lg">{result.tone}</p>
              </div>
            </div>

            {/* Advice */}
            <div className="bg-indigo-50 p-5 rounded-2xl border border-indigo-100">
              <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">Expert Advice</p>
              <p className="text-indigo-900 font-medium text-sm leading-relaxed">{result.advice}</p>
            </div>
          </div>

        </div>
      </div>

      {/* Suggested Replies */}
      <div>
        <h3 className="text-xl font-bold text-slate-800 mb-5 flex items-center gap-2 px-1">
          <ThumbsUp size={22} className="text-brand-500 fill-brand-100" />
          <span>Suggested Replies</span>
        </h3>
        <div className="grid gap-3">
          {result.suggestedReplies.map((reply: Suggestion, idx: number) => (
            <div 
              key={idx} 
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-brand-200 transition-all group flex items-start justify-between gap-4 cursor-pointer"
              onClick={() => {
                setSimReply(reply.text);
                window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
              }}
            >
              <div>
                <span className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider mb-2 ${
                    reply.category.toLowerCase().includes('risky') ? 'bg-red-100 text-red-600' :
                    reply.category.toLowerCase().includes('safe') ? 'bg-green-100 text-green-600' :
                    'bg-slate-100 text-slate-500'
                }`}>
                  {reply.category}
                </span>
                <p className="text-slate-700 font-medium text-lg">{reply.text}</p>
              </div>
              <button
                onClick={(e) => {
                    e.stopPropagation();
                    copyToClipboard(reply.text, idx);
                }}
                className="p-2 text-slate-300 hover:text-brand-500 hover:bg-brand-50 rounded-xl transition-colors"
                title="Copy to clipboard"
              >
                {copiedIndex === idx ? <Check size={20} className="text-green-500" /> : <Copy size={20} />}
              </button>
            </div>
          ))}
        </div>
        <p className="text-center text-slate-400 text-xs mt-3">Click a reply to test it in the simulator below</p>
      </div>

      {/* Simulator Section */}
      <div ref={chatRef} className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-2xl shadow-slate-900/20 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500 rounded-full blur-[100px] opacity-20 -mr-32 -mt-32"></div>
        
        <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm">
                    <MessageSquare size={20} className="text-brand-300" />
                </div>
                <div>
                    <h3 className="text-lg font-bold">Reply Simulator</h3>
                    <p className="text-slate-400 text-xs">Test your response before sending it for real.</p>
                </div>
            </div>

            <div className="space-y-4 mb-6">
                {/* User Bubble */}
                {simReply && (
                     <div className="flex justify-end animate-fade-in">
                        <div className="bg-brand-600 text-white px-4 py-3 rounded-2xl rounded-tr-none max-w-[85%] shadow-lg">
                            <p className="text-sm">{simReply}</p>
                        </div>
                     </div>
                )}
                
                {/* Partner Bubble */}
                {isSimulating ? (
                    <div className="flex justify-start">
                         <div className="bg-slate-800 text-slate-200 px-4 py-3 rounded-2xl rounded-tl-none flex gap-1 items-center">
                            <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></span>
                            <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-100"></span>
                            <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-200"></span>
                         </div>
                    </div>
                ) : simResponse ? (
                    <div className="flex justify-start animate-fade-in-up">
                        <div className="bg-slate-800 text-white px-4 py-3 rounded-2xl rounded-tl-none max-w-[85%] shadow-lg border border-slate-700">
                            <p className="text-xs text-slate-400 mb-1 capitalize">
                              {profile?.partnerName || partnerType}
                            </p>
                            <p className="text-sm">{simResponse}</p>
                        </div>
                    </div>
                ) : (
                    !simReply && <div className="text-center py-4 text-slate-500 text-sm italic">Type a reply below to start the simulation</div>
                )}
            </div>

            <form onSubmit={handleSimulate} className="relative">
                <input 
                    type="text" 
                    value={simReply}
                    onChange={(e) => setSimReply(e.target.value)}
                    placeholder="Type your reply..." 
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:border-brand-500 focus:bg-slate-800 transition-all placeholder:text-slate-500 text-white"
                />
                <button 
                    type="submit"
                    disabled={!simReply || isSimulating}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-brand-500 hover:bg-brand-400 text-white rounded-lg disabled:opacity-50 disabled:hover:bg-brand-500 transition-colors"
                >
                    <Send size={16} />
                </button>
            </form>
        </div>
      </div>

    </div>
  );
};

export default ResultCard;