import { PartnerType } from "../types";

// This service simulates a robust backend analytics collector (like Mixpanel, Segment, or a custom DB)

export interface UserSessionData {
  userAgent: string;
  language: string;
  platform: string;
  screenResolution: string;
  timezone: string;
  geolocation?: {
    lat: number;
    lng: number;
  } | null;
  timestamp: string;
  email?: string;
}

export interface AnalysisEvent {
  messageLength: number;
  partnerType: PartnerType;
  hasContext: boolean;
  detectedSentiment?: string; // Filled after API response
  dangerLevel?: number;       // Filled after API response
  hasProfile?: boolean;
}

class AnalyticsService {
  private sessionData: UserSessionData | null = null;

  constructor() {
    this.initSession();
  }

  // 1. Capture Technical & Demographic Data on Load
  private initSession() {
    this.sessionData = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      timestamp: new Date().toISOString(),
      geolocation: null, // Will be updated if permission granted
    };
    
    // Check for existing email in storage
    const storedEmail = localStorage.getItem('love_lingo_user_email');
    if (storedEmail) {
      this.sessionData.email = storedEmail;
    }

    console.log("📊 [Analytics] Session Initialized:", this.sessionData);
  }

  // 2. Update Location Data (Crucial for mapping user base)
  public updateLocation(lat: number, lng: number) {
    if (this.sessionData) {
      this.sessionData.geolocation = { lat, lng };
      console.log("📍 [Analytics] Location Captured:", { lat, lng });
    }
  }

  // 3. Identify User (When they log in / enter email)
  public identify(email: string) {
    if (this.sessionData) {
      this.sessionData.email = email;
      localStorage.setItem('love_lingo_user_email', email);
      console.log("🆔 [Analytics] User Identified:", email);
    }
  }

  // 4. Track User Behavior (The "What are they doing?" part)
  public trackDecodeEvent(data: AnalysisEvent) {
    const payload = {
      session: this.sessionData,
      event: "DECODE_MESSAGE",
      data: {
        ...data,
        timestamp: new Date().toISOString()
      }
    };

    // In a real app, this would be: await fetch('https://api.lovelingo.com/track', { ... })
    console.group("🚀 [Analytics] User Activity Tracked");
    console.log("User:", this.sessionData?.email || "Anonymous");
    console.log("Target:", data.partnerType);
    console.log("Payload:", payload);
    console.groupEnd();
  }

  public trackSimulationEvent(partnerType: PartnerType) {
    console.log("🎮 [Analytics] Simulation Feature Used", { partnerType });
  }
}

export const analytics = new AnalyticsService();