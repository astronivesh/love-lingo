import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import InputForm from './components/InputForm';
import ResultCard from './components/ResultCard';
import ProfileModal from './components/ProfileModal';
import AuthModal from './components/AuthModal';
import { AnalysisResult, PartnerType, RelationshipProfile, MediaType } from './types';
import { decodeMessage } from './services/geminiService';
import { analytics } from './services/analyticsService';
import { AlertCircle, Globe2, Clock } from 'lucide-react';

// Configuration
const DAILY_LIMIT = 5;
const GUEST_LIMIT = 1;

const App: React.FC = () => {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Profile State
  const [profile, setProfile] = useState<RelationshipProfile | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  
  // Analytics State
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  
  // Auth & Limits State
  const [dailyUsage, setDailyUsage] = useState(0);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
  // Keep track of current query for the simulator
  const [currentMessage, setCurrentMessage] = useState('');
  const [currentPartner, setCurrentPartner] = useState<PartnerType>(PartnerType.GF);
  const [currentContext, setCurrentContext] = useState('');

  useEffect(() => {
    // 1. Collect Location
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          analytics.updateLocation(latitude, longitude);
        },
        (error) => console.log("Analytics: Location unavailable.")
      );
    }
    
    // 2. Load Persisted Profile
    const savedProfile = localStorage.getItem('love_lingo_profile');
    if (savedProfile) {
        try { setProfile(JSON.parse(savedProfile)); } catch (e) { console.error(e); }
    }

    // 3. Load Email / Auth Status
    const savedEmail = localStorage.getItem('love_lingo_user_email');
    if (savedEmail) {
        setUserEmail(savedEmail);
    }

    // 4. Load & Reset Daily Limit logic
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const savedDate = localStorage.getItem('love_lingo_usage_date');
    const savedCount = parseInt(localStorage.getItem('love_lingo_usage_count') || '0', 10);

    if (savedDate !== today) {
        // New day, reset count
        setDailyUsage(0);
        localStorage.setItem('love_lingo_usage_date', today);
        localStorage.setItem('love_lingo_usage_count', '0');
    } else {
        setDailyUsage(savedCount);
    }

  }, []);

  const handleSaveProfile = (newProfile: RelationshipProfile) => {
      setProfile(newProfile);
      localStorage.setItem('love_lingo_profile', JSON.stringify(newProfile));
  };

  const incrementUsage = () => {
    const newCount = dailyUsage + 1;
    setDailyUsage(newCount);
    localStorage.setItem('love_lingo_usage_count', newCount.toString());
  };

  const handleAuthSubmit = (email: string) => {
    analytics.identify(email);
    setUserEmail(email);
    setIsAuthModalOpen(false);
  };

  const handleDecode = async (
    message: string, 
    partnerType: PartnerType, 
    context: string,
    mediaType: MediaType,
    mediaData?: string,
    mimeType?: string
  ) => {
    setError(null);

    // --- LIMIT CHECKING LOGIC ---
    if (dailyUsage >= DAILY_LIMIT) {
        setError(`You have reached your daily limit of ${DAILY_LIMIT} credits. Please come back tomorrow!`);
        return;
    }
    if (dailyUsage >= GUEST_LIMIT && !userEmail) {
        setIsAuthModalOpen(true);
        return;
    }
    // ----------------------------

    setLoading(true);
    setResult(null);
    
    // Store for simulation context
    setCurrentMessage(message);
    setCurrentPartner(partnerType);
    setCurrentContext(context);
    
    try {
      // Pass the media data to the service
      const data = await decodeMessage(message, partnerType, context, profile, mediaType, mediaData, mimeType);
      setResult(data);
      incrementUsage();
      
      // Track successful decode
      analytics.trackDecodeEvent({
        messageLength: message.length,
        partnerType: partnerType,
        hasContext: !!context,
        detectedSentiment: data.tone,
        dangerLevel: data.dangerLevel,
        hasProfile: !!profile
      });

    } catch (err) {
      console.error(err);
      setError("We couldn't analyze that signal. Please try again or check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 pb-20 selection:bg-brand-100 selection:text-brand-900">
      <Header dailyUsage={dailyUsage} dailyLimit={DAILY_LIMIT} />
      
      <main className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        
        {/* Hero Section */}
        <div className="text-center space-y-4 mb-10 mt-4">
          <div className="flex justify-center mb-4">
             {userLocation ? (
               <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-bold tracking-wide shadow-sm animate-fade-in">
                 <Globe2 size={12} />
                 LOCATION SECURED
               </div>
             ) : (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-400 border border-slate-200 text-[10px] font-bold tracking-wide shadow-sm">
                 <Globe2 size={12} />
                 ESTABLISHING UPLINK...
               </div>
             )}
          </div>
          <h2 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Know exactly <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-rose-600">what they meant.</span>
          </h2>
          <p className="text-slate-500 text-lg md:text-xl font-medium max-w-lg mx-auto leading-relaxed">
            AI-powered relationship translator. Decodes texts, body language, and voice tone instantly.
          </p>
        </div>

        {dailyUsage >= DAILY_LIMIT && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center space-y-2 animate-fade-in">
                <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Clock size={24} />
                </div>
                <h3 className="text-lg font-bold text-amber-900">Daily Limit Reached</h3>
                <p className="text-amber-700">You've used all 5 of your daily credits. Come back tomorrow!</p>
            </div>
        )}

        <InputForm 
            onDecode={handleDecode} 
            isLoading={loading} 
            onOpenProfile={() => setIsProfileModalOpen(true)}
            profile={profile}
        />

        {error && (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-start gap-3 text-red-600 animate-fade-in">
            <AlertCircle className="shrink-0 mt-0.5" size={20} />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <ResultCard 
          result={result} 
          isLoading={loading} 
          originalMessage={currentMessage}
          partnerType={currentPartner}
          context={currentContext}
          profile={profile}
        />
        
      </main>

      <footer className="text-center text-slate-400 text-sm py-12 border-t border-slate-200 mt-12 bg-white">
        <p className="font-medium text-slate-500">Love Lingo &copy; {new Date().getFullYear()}</p>
        <p className="mt-2 text-xs opacity-70">Powered by Gemini 2.5 Multimodal AI.</p>
      </footer>

      <ProfileModal 
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onSave={handleSaveProfile}
        initialProfile={profile}
      />

      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSubmit={handleAuthSubmit}
      />
    </div>
  );
};

export default App;