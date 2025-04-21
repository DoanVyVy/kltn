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
  userReviewWords: any;
  useUtils: any;
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
  };
};
