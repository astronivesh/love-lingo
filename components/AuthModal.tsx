import React, { useState } from 'react';
import { X, Mail, CheckCircle, Unlock, ArrowRight } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (email: string) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) return; // Basic validation
    
    setIsSubmitting(true);
    // Simulate API delay for realism
    setTimeout(() => {
        onSubmit(email);
        setIsSubmitting(false);
    }, 800);
  };

  const handleGoogleSim = () => {
     setIsSubmitting(true);
     setTimeout(() => {
         // Simulate retrieving email from Google
         onSubmit("user.google.simulated@gmail.com"); 
         setIsSubmitting(false);
     }, 1000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-md transition-opacity"></div>

      {/* Modal Content */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden animate-fade-in-up">
        
        {/* Header Image/Icon */}
        <div className="bg-slate-50 p-6 flex justify-center border-b border-slate-100">
             <div className="bg-white p-4 rounded-full shadow-lg shadow-brand-100 mb-2 ring-1 ring-slate-100 relative">
                <Unlock size={32} className="text-brand-500" />
                <div className="absolute -bottom-1 -right-1 bg-green-500 text-white p-1 rounded-full border-2 border-white">
                    <CheckCircle size={12} />
                </div>
             </div>
        </div>

        <div className="p-8">
            <h2 className="text-2xl font-bold text-slate-900 text-center mb-2">Unlock Daily Access</h2>
            <p className="text-slate-500 text-center text-sm mb-8 leading-relaxed">
                You've used your free guest pass. Create a free account to get <strong>5 decodes every single day</strong>.
            </p>

            <div className="space-y-4">
                {/* Simulated Google Login */}
                <button 
                    onClick={handleGoogleSim}
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:shadow-md active:scale-[0.98]"
                >
                     <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
                     <span>Continue with Google</span>
                </button>

                <div className="relative flex items-center py-2">
                    <div className="flex-grow border-t border-slate-200"></div>
                    <span className="flex-shrink-0 mx-4 text-slate-400 text-xs font-semibold uppercase tracking-wider">Or with Email</span>
                    <div className="flex-grow border-t border-slate-200"></div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="email" 
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="name@example.com"
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-50 transition-all outline-none text-slate-800 placeholder:text-slate-400 text-sm"
                        />
                    </div>
                    <button 
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 hover:from-black hover:to-slate-900 text-white font-bold text-sm shadow-xl shadow-slate-200 flex items-center justify-center gap-2 transform active:scale-[0.98] transition-all"
                    >
                        {isSubmitting ? (
                            <span className="animate-pulse">Verifying...</span>
                        ) : (
                            <>
                                <span>Unlock 5 Credits</span>
                                <ArrowRight size={16} />
                            </>
                        )}
                    </button>
                </form>
            </div>
            
            <p className="text-center text-[10px] text-slate-400 mt-6">
                By continuing, you agree to our Terms of Service. We respect your privacy.
            </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;