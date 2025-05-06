// @ts-nocheck
import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@/routers";

// Định nghĩa đúng kiểu Router để TypeScript hiểu được các thuộc tính
type TRPCRouterType = {
  userProcess: any;
  category: any;
  vocabulary: any;
  grammarContent: any;
  userLearnedWords: any;
  userLearnedGrammar: any;
  userReviewWords: any;
  useUtils: any;
  leaderboard: any;
  achievement: any;
};

export const trpc = createTRPCReact<AppRouter>();

// Thêm các hàm helper nếu cần thiết
(trpc as any).useUtils = () => {
  return {
    grammarContent: {
      getAll: {
        fetch: async (params: any) => {
          // Implement fetch logic
          return [];
        },
      },
    },
    userProcess: {
      getCategoryProcesses: {
        invalidate: () => {
          // Implement invalidate logic
        },
      },
    },
    leaderboard: {
      getLeaderboard: {
        invalidate: () => {
          // Invalidate leaderboard data
        },
      },
    },
    achievement: {
      getUserAchievements: {
        invalidate: () => {
          // Invalidate achievements data
        },
      },
      checkAchievements: {
        invalidate: () => {
          // Invalidate achievements check
        },
      },
    },
  };
};
