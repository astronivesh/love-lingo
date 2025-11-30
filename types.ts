export enum PartnerType {
  GF = 'Girlfriend',
  BF = 'Boyfriend',
  PARTNER = 'Partner',
  CRUSH = 'Crush',
  EX = 'Ex'
}

export enum MediaType {
  TEXT = 'text',
  AUDIO = 'audio',
  VIDEO = 'video'
}

export interface RelationshipProfile {
  userName: string;
  userStyle: string; // e.g. Anxious, Secure, Sarcastic
  partnerName: string;
  partnerStyle: string; // e.g. Avoidant, Direct, Dry Texter
  relationshipStatus: string; // e.g. New, 3 Years, Complicated
}

export interface AnalysisResult {
  translation: string;
  tone: string;
  dangerLevel: number; // 1-10
  advice: string;
  suggestedReplies: Suggestion[];
}

export interface Suggestion {
  category: string;
  text: string;
}

export interface DecodeRequest {
  message: string;
  context?: string;
  partnerType: PartnerType;
  profile?: RelationshipProfile | null;
  mediaType: MediaType;
  mediaData?: string; // Base64
  mimeType?: string;
}

export interface ChatState {
  userMessage: string;
  partnerReply: string;
  isLoading: boolean;
}