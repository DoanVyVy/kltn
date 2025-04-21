import { getCurrentUser } from "@/lib/server-auth";

// Lấy danh sách ngữ pháp đã học
getLearnedGrammar: baseProcedure
  .input(
    paginationRequestSchema.extend({
      categoryId: z.number().optional(),
    })
  )
  .query(async ({ ctx: { db }, input }) => {
    try {
      const user = await getCurrentUser();
      if (!user || !user.user || !user.user.id) {
        return {
          grammarContents: [],
          total: 0,
        };
      }

      // Tìm các processId của user (để lọc theo khóa học nếu cần)
      const processesQuery = {
        userId: user.user.id,
        ...(input.categoryId ? { categoryId: input.categoryId } : {}),
      };

      const processes = await db.userProgress.findMany({
        where: processesQuery,
        select: {
          progressId: true,
          categoryId: true,
        },
      });

      const processIds = processes.map((p) => p.progressId);

      if (processIds.length === 0) {
        return {
          grammarContents: [],
          total: 0,
        };
      }

      // Lấy các danh mục đã học
      const categoryIds = processes.map((p) => p.categoryId);

      // Tìm nội dung ngữ pháp từ các khóa học đã đăng ký
      const whereClause = {
        categoryId: {
          in: categoryIds.filter(Boolean),
        },
        ...(input.search
          ? {
              title: {
                contains: input.search,
                mode: "insensitive",
              },
            }
          : {}),
      };

      // Đếm tổng số nội dung ngữ pháp
      const total = await db.grammarContent.count({
        where: whereClause,
      });

      // Phân trang
      const page = input.page || 1;
      const limit = input.limit || 10;
      const skip = (page - 1) * limit;

      // Lấy nội dung ngữ pháp
      const grammarContents = await db.grammarContent.findMany({
        where: whereClause,
        include: {
          category: true,
        },
        orderBy: {
          contentId: "desc",
        },
        skip,
        take: limit,
      });

      // Thêm thống kê cho mỗi nội dung ngữ pháp
      const grammarWithStats = grammarContents.map((grammar) => {
        return {
          ...grammar,
          stats: {
            correctCount: 0,
            incorrectCount: 0,
            totalAnswers: 0,
            lastAnswered: new Date().toISOString(),
          },
        };
      });

      return {
        grammarContents: grammarWithStats,
        total,
      };
    } catch (error) {
      console.error("Lỗi khi lấy danh sách ngữ pháp đã học:", error);
      return {
        grammarContents: [],
        total: 0,
      };
    }
  }), 