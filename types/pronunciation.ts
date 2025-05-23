/**
 * Types for the Pronunciation Check game and Gemini API integration
 */

export interface PronunciationFeedback {
  overall: number;
  details: {
    accuracy: number;
    fluency: number;
    prosody: number;
    textMatch?: number;
  };
  feedback: string[];
  wordAnalysis?: WordAnalysis[];
  transcribedText?: string;
  originalText?: string;
  audioUrl?: string;
  prompt?: {
    text: string;
    type: string;
  };
  expectedPhonemes?: string[];
  userPhonemes?: string[];
  correctPhonemes?: string[];
  mistakes?: {
    position: number;
    expected: string;
    actual: string;
  }[];
  pitchMean?: number;
  energyMean?: number;
}

export interface WordAnalysis {
  word: string;
  correctlyPronounced: boolean;
  feedback: string;
}

export interface TranscriptionResult {
  transcript: string;
  confidence: number;
  success: boolean;
  source?: string;
  error?: string;
}

export interface PronunciationContent {
  id: number;
  type: "word" | "sentence" | "paragraph";
  content: string;
  audioUrl?: string;
  translation?: string;
  ipa?: string;
  difficulty?: number;
  category?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PronunciationGameData {
  id: number;
  title: string;
  description: string;
  contents: PronunciationContent[];
  createdAt: string;
  updatedAt: string;
}
