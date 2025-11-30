import React from 'react';
import { X, Check, Crown, Zap, Shield, Sparkles } from 'lucide-react';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
}

const PremiumModal: React.FC<PremiumModalProps> = ({ isOpen, onClose, onUpgrade }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-fade-in-up">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-black/5 hover:bg-black/10 rounded-full transition-colors z-10"
        >
          <X size={20} className="text-slate-600" />
        </button>

        {/* Hero Section */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500 rounded-full blur-[80px] opacity-20 -mr-10 -mt-10"></div>
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-200 to-yellow-500 rounded-2xl flex items-center justify-center shadow-lg shadow-yellow-500/30 mb-4 transform rotate-3">
              <Crown size={32} className="text-yellow-900" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Unlock Full Access</h2>
            <p className="text-slate-300 text-sm">Become a relationship master.</p>
          </div>
        </div>

        {/* Features */}
        <div className="p-8 space-y-6">
          <div className="space-y-4">
            <FeatureRow icon={Zap} text="Unlimited AI Decodes" />
            <FeatureRow icon={Sparkles} text="Unlimited Reply Simulations" />
            <FeatureRow icon={Shield} text="Advanced Danger Detection" />
          </div>

          <div className="pt-4">
            <button 
              onClick={onUpgrade}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-brand-500 to-rose-600 hover:from-brand-600 hover:to-rose-700 text-white font-bold text-lg shadow-xl shadow-brand-200/50 transform transition-all active:scale-[0.98]"
            >
              Upgrade for $4.99/mo
            </button>
            <p className="text-center text-xs text-slate-400 mt-3">
              Secure payment processed by Stripe (Demo)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const FeatureRow = ({ icon: Icon, text }: { icon: any, text: string }) => (
  <div className="flex items-center gap-3">
    <div className="p-2 bg-green-50 rounded-lg text-green-600">
      <Check size={18} />
    </div>
    <span className="font-medium text-slate-700">{text}</span>
  </div>
);

export default PremiumModal;