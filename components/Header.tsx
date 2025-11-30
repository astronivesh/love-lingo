import React from 'react';
import { MessageCircleHeart, Zap } from 'lucide-react';

interface HeaderProps {
  dailyUsage: number;
  dailyLimit: number;
}

const Header: React.FC<HeaderProps> = ({ dailyUsage, dailyLimit }) => {
  const creditsLeft = Math.max(0, dailyLimit - dailyUsage);
  const progress = (creditsLeft / dailyLimit) * 100;
  
  let creditColor = 'text-green-600 bg-green-50 border-green-200';
  if (creditsLeft <= 1) creditColor = 'text-red-600 bg-red-50 border-red-200';
  else if (creditsLeft <= 3) creditColor = 'text-amber-600 bg-amber-50 border-amber-200';

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
        
        {/* Branding */}
        <div className="flex items-center gap-2.5">
          <div className="bg-gradient-to-tr from-brand-500 to-rose-600 p-2 rounded-xl text-white shadow-lg shadow-brand-200">
            <MessageCircleHeart size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight leading-none">Love Lingo</h1>
            <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide mt-0.5">AI Relationship Translator</p>
          </div>
        </div>

        {/* Credits Counter */}
        <div className="flex items-center gap-2">
            <div className={`hidden sm:flex flex-col items-end px-3 py-1.5 rounded-lg border ${creditColor}`}>
                <div className="flex items-center gap-1.5">
                   <Zap size={14} className="fill-current" />
                   <span className="text-xs font-bold">{creditsLeft} Credits Left</span>
                </div>
                {/* Micro Progress Bar */}
                <div className="w-full h-1 bg-black/10 rounded-full mt-1 overflow-hidden">
                    <div 
                        className="h-full bg-current transition-all duration-500" 
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
            </div>
        </div>
      </div>
    </header>
  );
};

export default Header;