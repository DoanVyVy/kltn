// Client-side schema definitions
// These types mirror the server-side types without importing from @trpc/server

export enum UserRole {
  USER = "user",
  MODERATOR = "moderator",
  ADMIN = "admin",
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

// Add other type definitions as needed
