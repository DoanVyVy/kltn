// Client-side schema definitions
// These types mirror the server-side types without importing from @trpc/server

export enum UserRole {
  USER = "user",
  MODERATOR = "moderator",
  ADMIN = "admin",
}

// Definición de Category basada en el esquema Prisma
export interface Category {
  categoryId: number;
  categoryName: string;
  description?: string | null;
  difficultyLevel: number;
  orderIndex?: number | null;
  totalWords: number;
  totalGrammar: number;
  status: string;
  isVocabularyCourse: boolean;
}

export interface GrammarTopic {
  topicId: number;
  topicName: string;
  description?: string;
  orderIndex?: number;
}

export interface GrammarContent {
  contentId: number;
  title: string;
  topicId: number;
  explanation: string;
  examples?: string;
  notes?: string;
  orderIndex?: number;
}

export interface GrammarContentWithTopic extends GrammarContent {
  topic?: GrammarTopic;
}

export interface GrammarTopicListElement {
  topicId: number;
  topicName: string;
  description?: string;
  orderIndex?: number;
}

// Game related types
export interface GameStats {
  streak: number;
  totalPoints: number;
  gamesPlayed: number;
  pronunciationSessions: number;
  pronunciationScore: number;
}

export interface GameCompletionResult {
  success: boolean;
  pointsEarned?: number;
}

export interface ExperienceResult {
  success: boolean;
  newTotal: number;
}

export interface PronunciationGameData {
  content: {
    id: number;
    type: "word" | "sentence" | "paragraph";
    content: string;
    audioUrl?: string;
    translation?: string;
  }[];
}

// Add other type definitions as needed
