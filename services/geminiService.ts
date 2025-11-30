import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult, PartnerType, RelationshipProfile, MediaType } from "../types";

const genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    translation: {
      type: Type.STRING,
      description: "The brutal truth of what they mean. For video/audio, analyze body language and vocal tone. If audio/video is silent, unclear, or too short, explicitly state: 'Not enough data to tell. Please record a longer clip.'",
    },
    tone: {
      type: Type.STRING,
      description: "The emotional tone (e.g., Lying, Nervous, Aggressive, Sincere, or Unknown).",
    },
    dangerLevel: {
      type: Type.INTEGER,
      description: "A score from 1 to 10 indicating relationship peril. If input is unclear/silent, return 0 or 1.",
    },
    advice: {
      type: Type.STRING,
      description: "Actionable advice on how to handle the situation best.",
    },
    suggestedReplies: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          category: { type: Type.STRING, description: "Type of reply (e.g., Safe, Funny, Confrontational)" },
          text: { type: Type.STRING, description: "The actual text message reply." },
        },
        required: ["category", "text"],
      },
    },
  },
  required: ["translation", "tone", "dangerLevel", "advice", "suggestedReplies"],
};

export const decodeMessage = async (
  message: string, // Can be text prompt or "Video Analysis" label
  partnerType: PartnerType,
  context: string = "",
  profile?: RelationshipProfile | null,
  mediaType: MediaType = MediaType.TEXT,
  mediaData?: string, // Base64
  mimeType?: string
): Promise<AnalysisResult> => {
  try {
    const model = "gemini-2.5-flash";
    
    let profileContext = "";
    if (profile) {
      profileContext = `
      RELATIONSHIP DNA:
      - Me: ${profile.userName} (${profile.userStyle})
      - Partner: ${profile.partnerName} (${profile.partnerStyle})
      - Status: ${profile.relationshipStatus}
      Use this to inform if their behavior is normal or strange.
      `;
    }

    let systemPrompt = "";
    let userContent: any[] = [];

    if (mediaType === MediaType.TEXT) {
      systemPrompt = `
        Act as a relationship expert. Decode this text message from my ${partnerType}.
        ${profileContext}
        Is it a trap? Are they happy? Rate danger 1-10.
      `;
      userContent.push({ text: `Message: "${message}". Context: "${context}"` });
    } else {
      // MULTIMODAL PROMPT (Video/Audio)
      systemPrompt = `
        Act as a Body Language and Behavioral Analyst Expert.
        I am analyzing a ${mediaType} recording of my ${partnerType}.
        ${profileContext}
        
        Analyze the following:
        1. Vocal Tone & Pitch (Are they stressed, lying, sarcastic?)
        2. Body Language / Facial Micro-expressions (if video provided).
        3. The content of what they are saying.

        Context provided by user: "${context}"
        
        IMPORTANT: If the audio/video is silent, indiscernible, or too short to analyze, return:
        - translation: "Not enough data to tell. Keep recording more to understand."
        - tone: "Unknown"
        - dangerLevel: 1
        
        Otherwise, tell me the "Translation" (what they are actually thinking/feeling).
        Rate the Danger Level (1-10).
      `;
      
      if (mediaData && mimeType) {
        userContent.push({
          inlineData: {
            mimeType: mimeType,
            data: mediaData
          }
        });
        userContent.push({ text: "Analyze this clip. What is the subtext?" });
      }
    }

    const response = await genAI.models.generateContent({
      model: model,
      contents: {
        role: 'user',
        parts: [...userContent, { text: systemPrompt }]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.7, 
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as AnalysisResult;
    }
    
    throw new Error("Empty response from AI");
  } catch (error) {
    console.error("Gemini decode error:", error);
    throw error;
  }
};

export const simulateReply = async (
  partnerType: PartnerType,
  originalMessage: string,
  originalContext: string,
  userReply: string,
  detectedTone: string,
  profile?: RelationshipProfile | null
): Promise<string> => {
  try {
    const model = "gemini-2.5-flash";
    
    let profileContext = "";
    if (profile) {
      profileContext = `
      Persona: ${profile.partnerName || 'Partner'} (${profile.partnerStyle || 'Unknown'}).
      User: ${profile.userName || 'User'} (${profile.userStyle || 'Unknown'}).
      `;
    }

    const prompt = `
      Roleplay Simulation.
      You are acting as my ${partnerType}.
      ${profileContext}
      Context: You said/did: "${originalMessage}" (Tone: ${detectedTone})
      I replied: "${userReply}"
      Reply back to me in character (under 25 words).
    `;

    const response = await genAI.models.generateContent({
      model: model,
      contents: prompt,
      config: { temperature: 0.8 },
    });

    return response.text || "...";
  } catch (error) {
    console.error("Simulation error:", error);
    return "Error simulating reply.";
  }
};