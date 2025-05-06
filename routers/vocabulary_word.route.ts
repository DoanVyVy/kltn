import { paginationRequestSchema } from "@/schema/pagination";
import { baseProcedure, createTRPCRouter } from "./init";
import { z } from "zod";
import { createVocabularySchema } from "@/schema/vocabulary";
import prisma from "@/lib/prismaClient";
import { getCurrentUser } from "@/lib/server-auth";

// Định nghĩa kiểu dữ liệu cho category để khắc phục lỗi
interface Category {
  categoryId: number;
  name: string;
  description?: string;
  imageUrl?: string;
}

export default createTRPCRouter({
  getWord: baseProcedure
    .input(z.object({ wordId: z.number().int() }))
    .query(async ({ input }) => {
      const word = await prisma.vocabularyWord.findUnique({
        where: {
          wordId: input.wordId,
        },
        include: {
          examples: true,
        },
      });

      if (word) {
        // Kiểm tra xem người dùng đã đăng nhập chưa
        const user = await getCurrentUser();

        let isReviewing = false;
        // Nếu người dùng đã đăng nhập, kiểm tra xem từ này có trong danh sách ôn tập không
        if (user?.user?.id) {
          const reviewRecord = await prisma.userReviewWord.findFirst({
            where: {
              userId: user.user.id,
              wordId: word.wordId,
            },
          });
          isReviewing = !!reviewRecord;
        }

        // Thêm trường isReviewing vào kết quả trả về
        return { ...word, isReviewing };
      }

      return null;
    }),

  getWords: baseProcedure
    .input(
      paginationRequestSchema.extend({
        searchText: z.string().optional(),
        categoryId: z.number().optional(),
        sortBy: z.string().optional(),
        sortDirection: z.string().optional(), // asc or desc
      })
    )
    .query(async ({ input }) => {
      const { page, limit, search, categoryId, sortBy, sortDirection } = input;
      const skip = (page - 1) * limit;
      const take = limit;

      // Xây dựng điều kiện tìm kiếm
      const whereCondition: any = {};

      if (search) {
        whereCondition.OR = [
          { word: { contains: search, mode: "insensitive" } },
          { definition: { contains: search, mode: "insensitive" } },
        ];
      }

      if (categoryId) {
        whereCondition.categoryId = categoryId;
      }

      // Xây dựng sắp xếp
      const orderBy: any = {};
      if (sortBy) {
        orderBy[sortBy] =
          sortDirection?.toLowerCase() === "desc" ? "desc" : "asc";
      } else {
        orderBy.wordId = "desc"; // Mặc định sắp xếp theo ID giảm dần
      }

      // Truy vấn và đếm tổng số kết quả
      const [words, total] = await Promise.all([
        prisma.vocabularyWord.findMany({
          where: whereCondition,
          skip,
          take,
          orderBy,
          include: {
            category: true,
          },
        }),
        prisma.vocabularyWord.count({
          where: whereCondition,
        }),
      ]);

      return {
        results: words,
        metadata: {
          totalCount: total,
          pageCount: Math.ceil(total / limit),
          page,
          pageSize: limit,
        },
      };
    }),

  getCategories: baseProcedure
    .input(
      z.object({
        showAll: z.boolean().default(false),
      })
    )
    .query(async ({ input }) => {
      // Sử dụng raw query thay vì prisma.category để khắc phục lỗi
      const categories = await prisma.$queryRaw<Category[]>`
        SELECT * FROM "public"."categories"
        ORDER BY "name" ASC
      `;

      if (input.showAll) {
        return categories;
      }

      // Nếu người dùng đăng nhập, lấy các danh mục mà người dùng đã đăng ký
      const user = await getCurrentUser();
      if (user?.user?.id) {
        const userCategoryProgress = await prisma.$queryRaw<
          { categoryId: number }[]
        >`
          SELECT DISTINCT "category_id" 
          FROM "public"."user_progress" 
          WHERE "user_id" = ${user.user.id} 
          AND "content_type" = 'vocabulary'
        `;

        // Lọc ra các danh mục mà người dùng đã đăng ký
        const userCategoryIds = new Set(
          userCategoryProgress.map((p) => p.categoryId)
        );

        return categories.filter((c) => userCategoryIds.has(c.categoryId));
      }

      return [];
    }),

  getCategory: baseProcedure
    .input(z.object({ categoryId: z.number() }))
    .query(async ({ input }) => {
      // Sử dụng raw query thay vì prisma.category để khắc phục lỗi
      const categories = await prisma.$queryRaw<Category[]>`
        SELECT * FROM "public"."categories"
        WHERE "category_id" = ${input.categoryId}
        LIMIT 1
      `;

      return categories.length > 0 ? categories[0] : null;
    }),

  createWord: baseProcedure
    .input(
      createVocabularySchema.extend({
        exampleSentences: z
          .array(
            z.object({
              sentence: z.string(),
              translation: z.string(),
            })
          )
          .optional(),
        categoryId: z.number(),
        partOfSpeech: z.string().optional(),
        level: z.string().optional(),
        imageUrl: z.string().optional(),
        audioUrl: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const user = await getCurrentUser();

      if (!user) {
        throw new Error("Unauthorized");
      }

      const {
        word,
        translation,
        definition,
        pronunciation,
        exampleSentences,
        categoryId,
        partOfSpeech,
        level,
        imageUrl,
        audioUrl,
      } = input;

      // Kiểm tra xem từ này đã tồn tại chưa
      const existingWord = await prisma.vocabularyWord.findFirst({
        where: {
          word: { equals: word, mode: "insensitive" },
          categoryId,
        },
      });

      if (existingWord) {
        throw new Error(`The word "${word}" already exists in this category.`);
      }

      // Tạo từ mới
      const newWord = await prisma.vocabularyWord.create({
        data: {
          word,
          translation,
          definition,
          pronunciation: pronunciation || "",
          categoryId,
          partOfSpeech: partOfSpeech || "",
          level: level || "intermediate",
          imageUrl: imageUrl || "",
          audioUrl: audioUrl || "",
          authorId: user.user.id,
        },
      });

      // Tạo các ví dụ câu nếu có
      if (exampleSentences && exampleSentences.length > 0) {
        await prisma.wordExample.createMany({
          data: exampleSentences.map((ex) => ({
            wordId: newWord.wordId,
            sentence: ex.sentence,
            translation: ex.translation,
          })),
        });
      }

      return {
        ...newWord,
        examples: exampleSentences || [],
      };
    }),

  updateWord: baseProcedure
    .input(
      z.object({
        wordId: z.number(),
        word: z.string(),
        translation: z.string(),
        definition: z.string(),
        pronunciation: z.string().optional(),
        exampleSentences: z
          .array(
            z.object({
              id: z.number().optional(),
              sentence: z.string(),
              translation: z.string(),
            })
          )
          .optional(),
        categoryId: z.number(),
        partOfSpeech: z.string().optional(),
        level: z.string().optional(),
        imageUrl: z.string().optional(),
        audioUrl: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const user = await getCurrentUser();

      if (!user) {
        throw new Error("Unauthorized");
      }

      const {
        wordId,
        word,
        translation,
        definition,
        pronunciation,
        exampleSentences,
        categoryId,
        partOfSpeech,
        level,
        imageUrl,
        audioUrl,
      } = input;

      // Kiểm tra sự tồn tại của từ và quyền sở hữu hoặc quyền admin
      const existingWord = await prisma.vocabularyWord.findUnique({
        where: { wordId },
      });

      if (!existingWord) {
        throw new Error("Word not found");
      }

      if (
        existingWord.authorId !== user.user.id &&
        user.user.role !== "admin"
      ) {
        throw new Error("You don't have permission to edit this word");
      }

      // Kiểm tra xem từ mới có bị trùng không (nếu từ đã thay đổi)
      if (existingWord.word !== word) {
        const duplicateCheck = await prisma.vocabularyWord.findFirst({
          where: {
            word: { equals: word, mode: "insensitive" },
            categoryId,
            wordId: { not: wordId },
          },
        });

        if (duplicateCheck) {
          throw new Error(
            `The word "${word}" already exists in this category.`
          );
        }
      }

      // Nếu category thay đổi, cập nhật số lượng từ ở cả category cũ và mới
      if (existingWord.categoryId !== categoryId) {
        // Giảm số từ ở category cũ
        await prisma.category.update({
          where: { categoryId: existingWord.categoryId },
          data: { totalWords: { decrement: 1 } },
        });

        // Tăng số từ ở category mới
        await prisma.category.update({
          where: { categoryId },
          data: { totalWords: { increment: 1 } },
        });
      }

      // Cập nhật từ
      const updatedWord = await prisma.vocabularyWord.update({
        where: { wordId },
        data: {
          word,
          translation,
          definition,
          pronunciation: pronunciation || "",
          categoryId,
          partOfSpeech: partOfSpeech || "",
          level: level || "intermediate",
          imageUrl: imageUrl || "",
          audioUrl: audioUrl || "",
        },
      });

      // Xử lý các câu ví dụ
      if (exampleSentences) {
        // Lấy danh sách các ví dụ hiện tại
        const currentExamples = await prisma.wordExample.findMany({
          where: { wordId },
        });

        // ID của các ví dụ hiện tại
        const currentExampleIds = new Set(currentExamples.map((ex) => ex.id));

        // ID của các ví dụ sẽ cập nhật
        const exampleIdsToUpdate = new Set(
          exampleSentences
            .filter((ex) => ex.id !== undefined)
            .map((ex) => ex.id as number)
        );

        // Tìm ID cần xóa (những ví dụ hiện tại không có trong danh sách cập nhật)
        const exampleIdsToDelete = [...currentExampleIds].filter(
          (id) => !exampleIdsToUpdate.has(id)
        );

        // Xóa các ví dụ không còn cần thiết
        if (exampleIdsToDelete.length > 0) {
          await prisma.wordExample.deleteMany({
            where: {
              id: { in: exampleIdsToDelete },
            },
          });
        }

        // Cập nhật hoặc tạo mới các ví dụ
        for (const example of exampleSentences) {
          if (example.id) {
            // Cập nhật ví dụ hiện tại
            await prisma.wordExample.update({
              where: { id: example.id },
              data: {
                sentence: example.sentence,
                translation: example.translation,
              },
            });
          } else {
            // Tạo ví dụ mới
            await prisma.wordExample.create({
              data: {
                wordId,
                sentence: example.sentence,
                translation: example.translation,
              },
            });
          }
        }
      }

      // Lấy các ví dụ đã cập nhật
      const updatedExamples = await prisma.wordExample.findMany({
        where: { wordId },
      });

      return {
        ...updatedWord,
        examples: updatedExamples,
      };
    }),

  delete: baseProcedure
    .input(z.number())
    .mutation(async ({ ctx: { db }, input }) => {
      // Lấy thông tin từ vựng trước khi xóa để biết categoryId
      const word = await db.vocabularyWord.findUnique({
        where: { wordId: input },
      });

      if (!word) {
        throw new Error("Từ vựng không tồn tại");
      }

      // Xóa từ vựng
      const result = await db.vocabularyWord.delete({
        where: {
          wordId: input,
        },
      });

      // Cập nhật giảm số lượng từ trong category
      await db.category.update({
        where: {
          categoryId: word.categoryId,
        },
        data: {
          totalWords: {
            decrement: 1,
          },
        },
      });

      return result;
    }),
});
