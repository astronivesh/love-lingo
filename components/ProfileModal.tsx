import React, { useState, useEffect } from 'react';
import { X, UserCircle, Users, HeartHandshake, Save } from 'lucide-react';
import { RelationshipProfile } from '../types';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (profile: RelationshipProfile) => void;
  initialProfile: RelationshipProfile | null;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, onSave, initialProfile }) => {
  const [formData, setFormData] = useState<RelationshipProfile>({
    userName: '',
    userStyle: '',
    partnerName: '',
    partnerStyle: '',
    relationshipStatus: ''
  });

  useEffect(() => {
    if (initialProfile) {
      setFormData(initialProfile);
    }
  }, [initialProfile, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-fade-in-up flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-white border-b border-slate-100 p-6 flex justify-between items-center sticky top-0 z-10">
          <div>
             <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
               <Users className="text-brand-500" size={24} />
               Relationship DNA
             </h2>
             <p className="text-xs text-slate-500 mt-1">Help the AI understand your specific dynamic.</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Form */}
        <div className="overflow-y-auto p-6 space-y-8">
            <form id="profile-form" onSubmit={handleSubmit} className="space-y-8">
                
                {/* Section: Me */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-brand-600 font-semibold border-b border-brand-100 pb-2">
                        <UserCircle size={18} />
                        <span>About You</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Name / Nickname</label>
                            <input 
                                type="text"
                                className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition-all text-sm"
                                placeholder="Me"
                                value={formData.userName}
                                onChange={e => setFormData({...formData, userName: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">My Vibe / Style</label>
                            <input 
                                type="text"
                                className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition-all text-sm"
                                placeholder="e.g. Anxious, Sarcastic, Chill"
                                value={formData.userStyle}
                                onChange={e => setFormData({...formData, userStyle: e.target.value})}
                            />
                        </div>
                    </div>
                </div>

                {/* Section: Partner */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-rose-600 font-semibold border-b border-rose-100 pb-2">
                        <HeartHandshake size={18} />
                        <span>About Partner</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Name / Nickname</label>
                            <input 
                                type="text"
                                className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition-all text-sm"
                                placeholder="Them"
                                value={formData.partnerName}
                                onChange={e => setFormData({...formData, partnerName: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Their Vibe / Style</label>
                            <input 
                                type="text"
                                className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition-all text-sm"
                                placeholder="e.g. Avoidant, Dry Texter, Busy"
                                value={formData.partnerStyle}
                                onChange={e => setFormData({...formData, partnerStyle: e.target.value})}
                            />
                        </div>
                    </div>
                </div>

                {/* Section: Relationship */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-slate-600 font-semibold border-b border-slate-100 pb-2">
                        <Users size={18} />
                        <span>The Situation</span>
                    </div>
                     <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Status & Duration</label>
                        <input 
                            type="text"
                            className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition-all text-sm"
                            placeholder="e.g. Dating for 2 months, Married 5 years, It's Complicated"
                            value={formData.relationshipStatus}
                            onChange={e => setFormData({...formData, relationshipStatus: e.target.value})}
                        />
                    </div>
                </div>
                
                <div className="bg-amber-50 p-3 rounded-lg border border-amber-100 text-xs text-amber-800">
                    <strong>Note:</strong> We know this info is biased (it's from your POV). The AI will take that into account!
                </div>

            </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50">
             <button 
              type="submit" 
              form="profile-form"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-rose-600 hover:from-brand-700 hover:to-rose-700 text-white font-bold shadow-lg shadow-brand-200/50 flex items-center justify-center gap-2 transform active:scale-[0.98] transition-all"
            >
              <Save size={18} />
              Save Profile
            </button>
        </div>

      </div>
    </div>
  );
};

export default ProfileModal;