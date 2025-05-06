import { trpc } from "@/trpc/client";

// Define proper types
export interface GameWord {
  word: string;
  definition: string;
  found: boolean;
}

export interface Game {
  id: number;
  title: string;
  description: string;
  type: "word-search" | "matching" | "quiz";
  difficulty: string;
  courseId: number;
  courseTitle: string;
  totalWords: number;
  progress: number;
  lastPlayed: string | null;
  timeLimit: number;
  words: GameWord[];
}

export interface GameListItem {
  id: number;
  title: string;
  description: string;
  type: "word-search" | "matching" | "quiz";
  difficulty: string;
  courseId: number;
  courseTitle: string;
  totalWords: number;
  progress: number;
  lastPlayed: string | null;
  timeLimit: number;
}

// Sample data for vocabulary games
const gamesData: Game[] = [
  {
    id: 1,
    title: "Tìm từ: Văn phòng và Công sở",
    description: "Tìm các từ vựng liên quan đến môi trường làm việc văn phòng",
    type: "word-search",
    difficulty: "Trung bình",
    courseId: 1,
    courseTitle: "500 Từ vựng TOEIC cơ bản",
    totalWords: 8,
    progress: 0,
    lastPlayed: null,
    timeLimit: 180,
    words: [
      { word: "PERSONNEL", definition: "nhân sự", found: false },
      { word: "DEADLINE", definition: "thời hạn", found: false },
      { word: "MEETING", definition: "cuộc họp", found: false },
      { word: "OFFICE", definition: "văn phòng", found: false },
      { word: "MANAGER", definition: "người quản lý", found: false },
      { word: "REPORT", definition: "báo cáo", found: false },
      { word: "SALARY", definition: "lương", found: false },
      { word: "TEAM", definition: "đội nhóm", found: false },
    ],
  },
  {
    id: 2,
    title: "Tìm từ: Marketing và Quảng cáo",
    description: "Tìm các từ vựng liên quan đến marketing và quảng cáo",
    type: "word-search",
    difficulty: "Khó",
    courseId: 1,
    courseTitle: "500 Từ vựng TOEIC cơ bản",
    totalWords: 10,
    progress: 40,
    lastPlayed: "Hôm qua",
    timeLimit: 240,
    words: [
      { word: "MARKETING", definition: "tiếp thị", found: false },
      { word: "CAMPAIGN", definition: "chiến dịch", found: false },
      { word: "BRAND", definition: "thương hiệu", found: false },
      { word: "CUSTOMER", definition: "khách hàng", found: false },
      { word: "PRODUCT", definition: "sản phẩm", found: false },
      { word: "STRATEGY", definition: "chiến lược", found: false },
      { word: "PROMOTION", definition: "khuyến mãi", found: false },
      { word: "AUDIENCE", definition: "khán giả", found: false },
      { word: "RESEARCH", definition: "nghiên cứu", found: false },
      { word: "DIGITAL", definition: "kỹ thuật số", found: false },
    ],
  },
  {
    id: 3,
    title: "Tìm từ: Giao tiếp hàng ngày",
    description: "Tìm các từ vựng thông dụng trong cuộc sống hàng ngày",
    type: "word-search",
    difficulty: "Dễ",
    courseId: 2,
    courseTitle: "Từ vựng giao tiếp hàng ngày",
    totalWords: 6,
    progress: 100,
    lastPlayed: "3 ngày trước",
    timeLimit: 120,
    words: [
      { word: "HELLO", definition: "xin chào", found: false },
      { word: "GOODBYE", definition: "tạm biệt", found: false },
      { word: "PLEASE", definition: "làm ơn", found: false },
      { word: "THANKS", definition: "cảm ơn", found: false },
      { word: "SORRY", definition: "xin lỗi", found: false },
      { word: "FRIEND", definition: "bạn bè", found: false },
    ],
  },
];

/**
 * Get list of games without the words (for performance)
 *
 * Trong tương lai, hàm này sẽ gọi API để lấy danh sách trò chơi từ server
 * Ví dụ:
 * ```
 * const { data = [] } = await trpc.vocabularyGame.getAll.useQuery();
 * return data.map(game => ({
 *   id: game.id,
 *   title: game.title,
 *   ...
 * }));
 * ```
 */
export const getGamesList = (): GameListItem[] => {
  return gamesData.map(
    ({
      id,
      title,
      description,
      type,
      difficulty,
      courseId,
      courseTitle,
      totalWords,
      progress,
      lastPlayed,
      timeLimit,
    }) => ({
      id,
      title,
      description,
      type,
      difficulty,
      courseId,
      courseTitle,
      totalWords,
      progress,
      lastPlayed,
      timeLimit,
    })
  );
};

/**
 * Get a specific game by ID
 *
 * Trong tương lai, hàm này sẽ gọi API để lấy thông tin chi tiết trò chơi từ server
 * Ví dụ:
 * ```
 * const { data } = await trpc.vocabularyGame.getById.useQuery({ gameId: id });
 * return data;
 * ```
 */
export const getGameById = (id: number): Game | undefined => {
  return gamesData.find((game) => game.id === id);
};
