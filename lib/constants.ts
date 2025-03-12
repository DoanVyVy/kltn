import {
  BookOpen,
  BookText,
  Brain,
  Gamepad2,
  MessageSquare,
  Pencil,
} from "lucide-react";

// Game categories
export const GAME_CATEGORIES = {
  VOCABULARY: "vocabulary",
  GRAMMAR: "grammar",
} as const;

// Game data
export const GAMES = [
  {
    id: 1,
    title: "Flashcards Từ Vựng",
    description: "Học từ vựng mới thông qua thẻ ghi nhớ",
    icon: BookText,
    color: "bg-game-primary",
    progress: 65,
    category: GAME_CATEGORIES.VOCABULARY,
  },
  {
    id: 2,
    title: "Ghép Từ Với Nghĩa",
    description: "Kết nối từ vựng với định nghĩa đúng",
    icon: Gamepad2,
    color: "bg-game-secondary",
    progress: 40,
    category: GAME_CATEGORIES.VOCABULARY,
  },
  {
    id: 3,
    title: "Điền Vào Chỗ Trống",
    description: "Luyện tập ngữ pháp với bài tập điền từ",
    icon: Pencil,
    color: "bg-game-accent",
    progress: 25,
    category: GAME_CATEGORIES.GRAMMAR,
  },
  {
    id: 4,
    title: "Sắp Xếp Câu",
    description: "Xây dựng câu đúng ngữ pháp từ các từ cho sẵn",
    icon: MessageSquare,
    color: "bg-game-primary",
    progress: 90,
    category: GAME_CATEGORIES.GRAMMAR,
  },
];

// Achievement data
export const ACHIEVEMENTS = [
  {
    id: 1,
    title: "Từ Vựng Cơ Bản",
    description: "Học 100 từ vựng cơ bản",
    icon: BookOpen,
    completed: true,
    category: GAME_CATEGORIES.VOCABULARY,
  },
  {
    id: 2,
    title: "Thì Hiện Tại",
    description: "Hoàn thành các bài tập về thì hiện tại",
    icon: Brain,
    completed: true,
    category: GAME_CATEGORIES.GRAMMAR,
  },
  {
    id: 3,
    title: "Từ Vựng Nâng Cao",
    description: "Học 50 từ vựng nâng cao",
    icon: BookOpen,
    completed: false,
    category: GAME_CATEGORIES.VOCABULARY,
  },
];

// User stats
export const USER_STATS = {
  learningStreak: 7,
  dailyXpGoal: 100,
  currentXp: 75,
  totalWords: 520,
  totalGrammarRules: 48,
};
