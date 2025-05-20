import { z } from "zod";
import { baseProcedure, createTRPCRouter } from "./init";
import { db } from "@/database";

// Schema for pronunciation content management
const pronunciationContentSchema = z.object({
  type: z.enum(["word", "sentence", "paragraph"]),
  content: z.string().min(1, "Content is required"),
  audioUrl: z.string().optional(),
  translation: z.string().optional(),
  difficulty: z.number().min(1).max(3).default(1),
  category: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const pronunciationRouter = createTRPCRouter({
  // Get all pronunciation content sets
  getContentSets: baseProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(50).optional(),
          cursor: z.number().optional(),
        })
        .optional()
    )
    .query(async ({ ctx: { db }, input }) => {
      const limit = input?.limit ?? 10;
      const cursor = input?.cursor;

      try {
        const contentSets = await db.pronunciationContentSet.findMany({
          take: limit,
          ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
          where: {
            isActive: true,
          },
          orderBy: {
            order: "asc",
          },
          include: {
            _count: {
              select: {
                contents: true,
              },
            },
          },
        });

        const nextCursor =
          contentSets.length === limit ? contentSets[limit - 1].id : undefined;

        return {
          items: contentSets,
          nextCursor,
        };
      } catch (error) {
        console.error("Error fetching pronunciation content sets:", error);
        throw error;
      }
    }),

  // Get pronunciation content for a specific set
  getContentsBySetId: baseProcedure
    .input(
      z.object({
        setId: z.number(),
        limit: z.number().min(1).max(50).optional(),
        cursor: z.number().optional(),
      })
    )
    .query(async ({ input }) => {
      const { setId, limit = 10, cursor } = input;

      try {
        const contents = await db.pronunciationContent.findMany({
          take: limit,
          ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
          where: {
            setId,
            isActive: true,
          },
          orderBy: {
            difficulty: "asc",
          },
        });

        const nextCursor =
          contents.length === limit ? contents[limit - 1].id : undefined;

        return {
          items: contents,
          nextCursor,
        };
      } catch (error) {
        console.error("Error fetching pronunciation contents:", error);
        throw error;
      }
    }),

  // Get user's pronunciation progress
  getUserProgress: baseProcedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .query(async ({ input }) => {
      const { userId } = input;

      try {
        const progress = await db.userPronunciationProgress.findMany({
          where: {
            userId,
          },
          include: {
            contentSet: true,
          },
          orderBy: {
            lastAttemptedAt: "desc",
          },
        });

        return progress;
      } catch (error) {
        console.error("Error fetching user pronunciation progress:", error);
        throw error;
      }
    }),

  // Save a pronunciation attempt
  saveAttempt: baseProcedure
    .input(
      z.object({
        userId: z.string(),
        contentId: z.number(),
        score: z.number(),
        accuracy: z.number(),
        fluency: z.number(),
        prosody: z.number(),
        textMatch: z.number().optional(),
        isSuccessful: z.boolean().default(false),
        audioUrl: z.string().optional(),
        transcribedText: z.string().optional(),
        feedback: z.any(), // JSON object
        wordAnalysis: z.any().optional(), // JSON object
        phonemeAnalysis: z.any().optional(), // JSON object
        attemptNumber: z.number().default(1),
        xpEarned: z.number().default(0),
      })
    )
    .mutation(async ({ input }) => {
      const {
        userId,
        contentId,
        score,
        accuracy,
        fluency,
        prosody,
        textMatch,
        isSuccessful,
        audioUrl,
        transcribedText,
        feedback,
        wordAnalysis,
        phonemeAnalysis,
        attemptNumber,
        xpEarned,
      } = input;

      try {
        // First, check if the content exists and get the setId
        const content = await db.pronunciationContent.findUnique({
          where: { id: contentId },
          select: { setId: true },
        });

        if (!content || !content.setId) {
          throw new Error("Content not found or not associated with a set");
        }

        // Create the attempt
        const attempt = await db.pronunciationAttempt.create({
          data: {
            userId,
            contentId,
            score,
            accuracy,
            fluency,
            prosody,
            textMatch,
            isSuccessful,
            audioUrl,
            transcribedText,
            feedback,
            wordAnalysis,
            phonemeAnalysis,
            attemptNumber,
            xpEarned,
          },
        });

        // Update the content stats
        await db.pronunciationContent.update({
          where: { id: contentId },
          data: {
            timesAttempted: { increment: 1 },
            // Update success rate and average score logic can be added here
          },
        });

        // Update or create user progress for this content set
        await db.userPronunciationProgress.upsert({
          where: {
            userId_contentSetId: {
              userId,
              contentSetId: content.setId,
            },
          },
          update: {
            totalAttempts: { increment: 1 },
            lastAttemptedAt: new Date(),
            bestScore: {
              set:
                score >
                db.userPronunciationProgress
                  .findFirst({
                    where: { userId, contentSetId: content.setId },
                    select: { bestScore: true },
                  })
                  .then((p) => p?.bestScore || 0)
                  ? score
                  : undefined,
            },
            // Update completion status logic can be added here
            contentItemsProgress: db.userPronunciationProgress
              .findFirst({
                where: { userId, contentSetId: content.setId },
                select: { contentItemsProgress: true },
              })
              .then((p) => {
                const progress = (p?.contentItemsProgress as any[]) || [];
                const existingItemIndex = progress.findIndex(
                  (item: any) => item.contentId === contentId
                );

                if (existingItemIndex >= 0) {
                  const updatedProgress = [...progress];
                  updatedProgress[existingItemIndex] = {
                    ...updatedProgress[existingItemIndex],
                    attempts:
                      (updatedProgress[existingItemIndex].attempts || 0) + 1,
                    bestScore: Math.max(
                      updatedProgress[existingItemIndex].bestScore || 0,
                      score
                    ),
                    completed:
                      updatedProgress[existingItemIndex].completed ||
                      isSuccessful,
                  };
                  return updatedProgress;
                } else {
                  return [
                    ...progress,
                    {
                      contentId,
                      attempts: 1,
                      bestScore: score,
                      completed: isSuccessful,
                    },
                  ];
                }
              }),
          },
          create: {
            userId,
            contentSetId: content.setId,
            totalAttempts: 1,
            bestScore: score,
            lastAttemptedAt: new Date(),
            completionStatus: isSuccessful ? "completed" : "in_progress",
            contentItemsProgress: [
              {
                contentId,
                attempts: 1,
                bestScore: score,
                completed: isSuccessful,
              },
            ],
          },
        });

        // If successful, add XP to user
        if (isSuccessful && xpEarned > 0) {
          await db.user.update({
            where: { userId },
            data: {
              currentExp: { increment: xpEarned },
            },
          });
        }
        return attempt;
      } catch (error) {
        console.error("Error saving pronunciation attempt:", error);
        throw error;
      }
    }),

  // Get pronunciation game content
  getPronunciationGameContent: baseProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(50).default(15),
          difficulty: z.number().min(1).max(3).optional(),
          category: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ input }) => {
      try {
        // Build where condition
        const where: any = {
          isActive: true,
        };

        if (input?.difficulty) {
          where.difficulty = input.difficulty;
        }

        if (input?.category) {
          where.category = input.category;
        }

        const pronunciationContent = await db.pronunciationContent.findMany({
          where,
          orderBy: {
            id: "asc",
          },
          take: input?.limit || 15,
        });

        // Map to the expected format
        return {
          content: pronunciationContent.map((item) => ({
            id: item.id,
            type: item.type,
            content: item.content,
            audioUrl: item.audioUrl,
            translation: item.translation,
            difficulty: item.difficulty,
            category: item.category,
          })),
        };
      } catch (error) {
        console.error("Error fetching pronunciation game content:", error);
        throw error;
      }
    }),

  // CRUD operations for managing pronunciation content
  getAllPronunciationContent: baseProcedure
    .input(
      z.object({
        page: z.number().default(1),
        limit: z.number().min(1).max(50).default(10),
        search: z.string().optional(),
        difficulty: z.number().optional(),
        type: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const { page, limit, search, difficulty, type } = input;
      const skip = (page - 1) * limit;

      try {
        // Build where condition
        const where: any = {};

        if (search) {
          where.OR = [
            { content: { contains: search, mode: "insensitive" } },
            { translation: { contains: search, mode: "insensitive" } },
          ];
        }

        if (difficulty) {
          where.difficulty = difficulty;
        }

        if (type) {
          where.type = type;
        }

        // Get pronunciation content with pagination
        const [items, totalCount] = await Promise.all([
          db.pronunciationContent.findMany({
            where,
            orderBy: { id: "desc" },
            take: limit,
            skip,
          }),
          db.pronunciationContent.count({ where }),
        ]);

        return {
          items,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
          currentPage: page,
        };
      } catch (error) {
        console.error("Error fetching pronunciation content:", error);
        throw error;
      }
    }),

  createPronunciationContent: baseProcedure
    .input(pronunciationContentSchema)
    .mutation(async ({ input }) => {
      try {
        return await db.pronunciationContent.create({
          data: input,
        });
      } catch (error) {
        console.error("Error creating pronunciation content:", error);
        throw error;
      }
    }),

  updatePronunciationContent: baseProcedure
    .input(
      z.object({
        id: z.number(),
        ...pronunciationContentSchema.partial().shape,
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...updateData } = input;

      try {
        return await db.pronunciationContent.update({
          where: { id },
          data: updateData,
        });
      } catch (error) {
        console.error("Error updating pronunciation content:", error);
        throw error;
      }
    }),

  deletePronunciationContent: baseProcedure
    .input(
      z.object({
        id: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        return await db.pronunciationContent.delete({
          where: { id: input.id },
        });
      } catch (error) {
        console.error("Error deleting pronunciation content:", error);
        throw error;
      }
    }),
});

export default pronunciationRouter;
