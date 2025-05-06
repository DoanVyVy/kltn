import { paginationRequestSchema } from "@/schema/pagination";
import { baseProcedure, createTRPCRouter } from "./init";
import z from "zod";

// Schema for sentence in sentence-scramble game
const sentenceSchema = z.object({
  original: z.string(),
  hint: z.string().optional(),
});

// Schema for word association in word-association game
const associationSchema = z.object({
  word: z.string(),
  association: z.string(),
});

// Schema for idiom in idiom-challenge game
const idiomSchema = z.object({
  idiom: z.string(),
  meaning: z.string(),
  explanation: z.string().optional(),
});

// Schema for creating a new game activity
export const createGameActivitySchema = z.object({
  gameTypeId: z.number(),
  activityName: z.string().min(1, "Activity name is required"),
  description: z.string().optional(),
  skillFocus: z.string().optional(),
  difficultyLevel: z.number().default(1),
  pointsReward: z.number().default(10),
  timeLimitSeconds: z.number().optional(),
  instructions: z.string().optional(),
});

// Schema for creating a new game question
export const createGameQuestionSchema = z.object({
  activityId: z.number(),
  questionType: z.string(),
  questionText: z.string(),
  correctAnswer: z.string(),
  options: z.array(z.string()).optional(),
  hint: z.string().optional(),
  explanation: z.string().optional(),
  difficultyLevel: z.number().default(1),
  points: z.number().default(5),
  mediaUrl: z.string().optional(),
  relatedWordId: z.number().optional(),
  relatedGrammarId: z.number().optional(),
  // Game-specific data
  gameData: z
    .object({
      // For word-guess game
      words: z.array(z.string()).optional(),
      // For sentence-scramble game
      sentences: z.array(sentenceSchema).optional(),
      // For word-association game
      associations: z.array(associationSchema).optional(),
      // For idiom-challenge game
      idioms: z.array(idiomSchema).optional(),
    })
    .optional(),
});

// Schema for CSV import - uses any for now as validation happens during processing
const csvGameImportSchema = z.array(z.any());

// Schema for JSON import
const jsonGameImportSchema = z.array(createGameQuestionSchema);

// Combined import schema
const importGamesSchema = z.object({
  questions: z.union([csvGameImportSchema, jsonGameImportSchema]),
  format: z.enum(["csv", "json"]),
});

// Schema for completing a game activity and getting XP
const completeGameActivitySchema = z.object({
  activityId: z.number(),
  score: z.number(),
  timeTaken: z.number().optional(),
});

const gamesRouter = createTRPCRouter({
  getAllGameTypes: baseProcedure.query(async ({ ctx: { db } }) => {
    try {
      return await db.gameType.findMany({
        include: {
          gameActivities: true,
        },
      });
    } catch (error) {
      console.error("Error fetching game types:", error);
      throw error;
    }
  }),

  getAllGameQuestions: baseProcedure
    .input(
      paginationRequestSchema.extend({
        activityId: z.number().optional(),
        search: z.string().optional(),
      })
    )
    .query(async ({ ctx: { db }, input }) => {
      try {
        // Build where condition based on input filters
        const whereCondition: any = {};

        if (input.activityId) {
          whereCondition.activityId = input.activityId;
        }

        if (input.search && input.search.trim() !== "") {
          whereCondition.OR = [
            {
              questionText: {
                contains: input.search,
                mode: "insensitive" as const,
              },
            },
            {
              correctAnswer: {
                contains: input.search,
                mode: "insensitive" as const,
              },
            },
          ];
        }

        // Count total questions matching the filter
        const totalCount = await db.gameQuestion.count({
          where: whereCondition,
        });

        // Calculate total pages
        const totalPages = Math.ceil(totalCount / input.limit) || 1;

        // Fetch paginated game questions
        const questions = await db.gameQuestion.findMany({
          skip: (input.page - 1) * input.limit,
          take: input.limit,
          where: whereCondition,
          orderBy: {
            questionId: "desc",
          },
          include: {
            activity: {
              select: {
                activityId: true,
                activityName: true,
                gameType: true,
              },
            },
          },
        });

        return {
          items: questions,
          totalCount,
          totalPages,
          currentPage: input.page,
        };
      } catch (error) {
        console.error("Error fetching game questions:", error);
        throw error;
      }
    }),

  getGameActivities: baseProcedure
    .input(
      paginationRequestSchema.extend({
        search: z.string().optional(),
        gameTypeId: z.number().optional(),
        difficultyLevel: z.number().optional(),
      })
    )
    .query(async ({ ctx: { db }, input }) => {
      try {
        // Build where condition based on input filters
        const whereCondition: any = {};

        if (input.search && input.search.trim() !== "") {
          whereCondition.OR = [
            {
              activityName: {
                contains: input.search,
                mode: "insensitive" as const,
              },
            },
            {
              description: {
                contains: input.search,
                mode: "insensitive" as const,
              },
            },
          ];
        }

        if (input.gameTypeId) {
          whereCondition.gameTypeId = input.gameTypeId;
        }

        if (input.difficultyLevel) {
          whereCondition.difficultyLevel = input.difficultyLevel;
        }

        // Count total activities matching the filter
        const totalCount = await db.gameActivity.count({
          where: whereCondition,
        });

        // Calculate total pages
        const totalPages = Math.ceil(totalCount / input.limit) || 1;

        // Fetch paginated game activities
        const activities = await db.gameActivity.findMany({
          skip: (input.page - 1) * input.limit,
          take: input.limit,
          where: whereCondition,
          orderBy: {
            activityId: "desc",
          },
          include: {
            gameType: true,
            gameQuestions: {
              select: {
                questionId: true,
                questionType: true,
                questionText: true,
              },
            },
          },
        });

        return {
          items: activities,
          totalCount,
          totalPages,
          currentPage: input.page,
        };
      } catch (error) {
        console.error("Error fetching game activities:", error);
        throw error;
      }
    }),

  getActivityById: baseProcedure
    .input(z.object({ activityId: z.number() }))
    .query(async ({ ctx: { db }, input }) => {
      try {
        return await db.gameActivity.findUnique({
          where: {
            activityId: input.activityId,
          },
          include: {
            gameType: true,
            gameQuestions: true,
          },
        });
      } catch (error) {
        console.error("Error fetching game activity by ID:", error);
        throw error;
      }
    }),

  getDailyActivity: baseProcedure
    .input(z.object({ gameTypeId: z.number() }))
    .query(async ({ ctx: { db }, input }) => {
      try {
        // Find activities for the specified game type
        const activities = await db.gameActivity.findMany({
          where: {
            gameTypeId: input.gameTypeId,
          },
          include: {
            gameQuestions: true,
            gameType: true,
          },
        });

        if (activities.length === 0) {
          throw new Error(
            `No activities available for game type ${input.gameTypeId}`
          );
        }

        // Pick a random activity from the available ones
        const selectedActivity =
          activities[Math.floor(Math.random() * activities.length)];

        return selectedActivity;
      } catch (error) {
        console.error("Error fetching daily game activity:", error);
        throw error;
      }
    }),

  createGameType: baseProcedure
    .input(
      z.object({
        gameName: z.string().min(1, "Game name is required"),
        description: z.string().optional(),
        iconUrl: z.string().optional(),
        instructions: z.string().optional(),
      })
    )
    .mutation(async ({ ctx: { db }, input }) => {
      try {
        return await db.gameType.create({
          data: {
            gameName: input.gameName,
            description: input.description || "",
            iconUrl: input.iconUrl,
            instructions: input.instructions,
          },
        });
      } catch (error) {
        console.error("Error creating game type:", error);
        throw error;
      }
    }),

  createGameActivity: baseProcedure
    .input(createGameActivitySchema)
    .mutation(async ({ ctx: { db }, input }) => {
      try {
        return await db.gameActivity.create({
          data: {
            gameTypeId: input.gameTypeId,
            activityName: input.activityName,
            description: input.description || "",
            skillFocus: input.skillFocus,
            difficultyLevel: input.difficultyLevel,
            pointsReward: input.pointsReward,
            timeLimitSeconds: input.timeLimitSeconds,
            instructions: input.instructions,
          },
        });
      } catch (error) {
        console.error("Error creating game activity:", error);
        throw error;
      }
    }),

  createGameQuestion: baseProcedure
    .input(createGameQuestionSchema)
    .mutation(async ({ ctx: { db }, input }) => {
      try {
        // Extract game-specific data to store in options field
        const options = input.options || [];
        let gameSpecificData = {};

        if (input.gameData) {
          gameSpecificData = {
            ...(input.gameData.words && { words: input.gameData.words }),
            ...(input.gameData.sentences && {
              sentences: input.gameData.sentences,
            }),
            ...(input.gameData.associations && {
              associations: input.gameData.associations,
            }),
            ...(input.gameData.idioms && { idioms: input.gameData.idioms }),
          };
        }

        return await db.gameQuestion.create({
          data: {
            activityId: input.activityId,
            questionType: input.questionType,
            questionText: input.questionText,
            correctAnswer: input.correctAnswer,
            options: options.length ? options : gameSpecificData,
            hint: input.hint,
            explanation: input.explanation,
            difficultyLevel: input.difficultyLevel,
            points: input.points,
            mediaUrl: input.mediaUrl,
            relatedWordId: input.relatedWordId,
            relatedGrammarId: input.relatedGrammarId,
          },
        });
      } catch (error) {
        console.error("Error creating game question:", error);
        throw error;
      }
    }),

  updateGameActivity: baseProcedure
    .input(
      createGameActivitySchema.extend({
        activityId: z.number(),
      })
    )
    .mutation(async ({ ctx: { db }, input }) => {
      try {
        const { activityId, ...activityData } = input;

        return await db.gameActivity.update({
          where: {
            activityId,
          },
          data: {
            gameTypeId: activityData.gameTypeId,
            activityName: activityData.activityName,
            description: activityData.description || "",
            skillFocus: activityData.skillFocus,
            difficultyLevel: activityData.difficultyLevel,
            pointsReward: activityData.pointsReward,
            timeLimitSeconds: activityData.timeLimitSeconds,
            instructions: activityData.instructions,
          },
        });
      } catch (error) {
        console.error("Error updating game activity:", error);
        throw error;
      }
    }),

  updateGameQuestion: baseProcedure
    .input(
      createGameQuestionSchema.extend({
        questionId: z.number(),
      })
    )
    .mutation(async ({ ctx: { db }, input }) => {
      try {
        const { questionId, gameData, ...questionData } = input;

        // Extract game-specific data to store in options field
        const options = questionData.options || [];
        let gameSpecificData = {};

        if (gameData) {
          gameSpecificData = {
            ...(gameData.words && { words: gameData.words }),
            ...(gameData.sentences && { sentences: gameData.sentences }),
            ...(gameData.associations && {
              associations: gameData.associations,
            }),
            ...(gameData.idioms && { idioms: gameData.idioms }),
          };
        }

        return await db.gameQuestion.update({
          where: {
            questionId,
          },
          data: {
            activityId: questionData.activityId,
            questionType: questionData.questionType,
            questionText: questionData.questionText,
            correctAnswer: questionData.correctAnswer,
            options: options.length ? options : gameSpecificData,
            hint: questionData.hint,
            explanation: questionData.explanation,
            difficultyLevel: questionData.difficultyLevel,
            points: questionData.points,
            mediaUrl: questionData.mediaUrl,
            relatedWordId: questionData.relatedWordId,
            relatedGrammarId: questionData.relatedGrammarId,
          },
        });
      } catch (error) {
        console.error("Error updating game question:", error);
        throw error;
      }
    }),

  updateGame: baseProcedure
    .input(
      z.object({
        gameId: z.number(),
        gameName: z.string().optional(),
        description: z.string().optional(),
        difficulty: z.number().optional(),
        category: z.string().optional(),
        status: z.enum(["active", "inactive"]).optional(),
        gameSettings: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ ctx: { db }, input }) => {
      try {
        const { gameId, ...updateData } = input;

        // Check if the game exists before updating
        const existingGame = await db.game.findUnique({
          where: { gameId },
        });

        if (!existingGame) {
          throw new Error(`Game with ID ${gameId} not found`);
        }

        // Update the game with the provided data
        return await db.game.update({
          where: { gameId },
          data: {
            ...(updateData.gameName && { gameName: updateData.gameName }),
            ...(updateData.description && {
              description: updateData.description,
            }),
            ...(updateData.difficulty && { difficulty: updateData.difficulty }),
            ...(updateData.category && { category: updateData.category }),
            ...(updateData.status && { status: updateData.status }),
            ...(updateData.gameSettings && {
              settings: updateData.gameSettings,
            }),
            updatedAt: new Date(),
          },
        });
      } catch (error) {
        console.error("Error updating game:", error);
        throw error;
      }
    }),

  deleteGameActivity: baseProcedure
    .input(z.object({ activityId: z.number() }))
    .mutation(async ({ ctx: { db }, input }) => {
      try {
        // Delete all questions associated with this activity first
        await db.gameQuestion.deleteMany({
          where: {
            activityId: input.activityId,
          },
        });

        // Then delete the activity
        return await db.gameActivity.delete({
          where: {
            activityId: input.activityId,
          },
        });
      } catch (error) {
        console.error("Error deleting game activity:", error);
        throw error;
      }
    }),

  deleteGameQuestion: baseProcedure
    .input(z.object({ questionId: z.number() }))
    .mutation(async ({ ctx: { db }, input }) => {
      try {
        return await db.gameQuestion.delete({
          where: {
            questionId: input.questionId,
          },
        });
      } catch (error) {
        console.error("Error deleting game question:", error);
        throw error;
      }
    }),

  importGameQuestions: baseProcedure
    .input(importGamesSchema)
    .mutation(async ({ ctx: { db }, input }) => {
      try {
        let questionsToImport = [];

        if (input.format === "csv") {
          // Process CSV data - handle CSV structure based on question type
          for (const row of input.questions as any[]) {
            const questionType = row.questionType;
            if (!questionType) continue;

            // Basic question data
            const questionData: any = {
              activityId: parseInt(row.activityId),
              questionType: questionType,
              questionText:
                row.questionText || `Imported ${questionType} question`,
              correctAnswer: row.correctAnswer || "",
              options: row.options ? JSON.parse(row.options) : [],
              hint: row.hint || "",
              explanation: row.explanation || "",
              difficultyLevel: parseInt(row.difficultyLevel || "1"),
              points: parseInt(row.points || "5"),
              mediaUrl: row.mediaUrl || "",
              relatedWordId: row.relatedWordId
                ? parseInt(row.relatedWordId)
                : undefined,
              relatedGrammarId: row.relatedGrammarId
                ? parseInt(row.relatedGrammarId)
                : undefined,
            };

            questionsToImport.push(questionData);
          }
        } else {
          // JSON format is already structured correctly
          questionsToImport = input.questions as z.infer<
            typeof createGameQuestionSchema
          >[];
        }

        // Validate and import each question
        const importedQuestions = [];

        for (const questionData of questionsToImport) {
          // Skip invalid questions
          if (!questionData.questionType || !questionData.questionText)
            continue;

          // Create the question in the database
          const question = await db.gameQuestion.create({
            data: {
              activityId: questionData.activityId,
              questionType: questionData.questionType,
              questionText: questionData.questionText,
              correctAnswer: questionData.correctAnswer,
              options: questionData.options || [],
              hint: questionData.hint || "",
              explanation: questionData.explanation || "",
              difficultyLevel: questionData.difficultyLevel || 1,
              points: questionData.points || 5,
              mediaUrl: questionData.mediaUrl,
              relatedWordId: questionData.relatedWordId,
              relatedGrammarId: questionData.relatedGrammarId,
            },
          });

          importedQuestions.push(question);
        }

        return {
          imported: importedQuestions.length,
          total: questionsToImport.length,
        };
      } catch (error) {
        console.error("Error importing game questions:", error);
        throw error;
      }
    }),

  completeGameActivity: baseProcedure
    .input(completeGameActivitySchema)
    .mutation(async ({ ctx: { db, user }, input }) => {
      if (!user || !user.userId) {
        throw new Error("User not authenticated");
      }

      try {
        // Check if the activity exists
        const activity = await db.gameActivity.findUnique({
          where: { activityId: input.activityId },
        });

        if (!activity) {
          throw new Error("Game activity not found");
        }

        // Get points reward from the activity
        const pointsReward = activity.pointsReward || 10;

        // Award points to the user
        await db.user.update({
          where: { userId: user.userId },
          data: {
            totalPoints: { increment: pointsReward },
            streakDays: { increment: 1 },
            lastActiveDate: new Date(),
          },
        });

        // Log the user progress
        // Find or create a user progress record for this user
        const userProgress = await db.userProgress.findFirst({
          where: {
            userId: user.userId,
            contentType: "game", // We're tracking game progress here
          },
        });

        if (userProgress) {
          // Update existing progress
          await db.userProgress.update({
            where: { progressId: userProgress.progressId },
            data: {
              timesPracticed: { increment: 1 },
              lastPracticed: new Date(),
              processPercentage: { increment: 5 }, // Increment progress percentage
            },
          });
        } else {
          // Create new progress record
          await db.userProgress.create({
            data: {
              userId: user.userId,
              timesPracticed: 1,
              lastPracticed: new Date(),
              contentType: "game",
              processPercentage: 5, // Starting percentage
            },
          });
        }

        // Record user learning answers for this activity's questions
        // This is optional and can be expanded based on specific requirements

        return {
          success: true,
          pointsEarned: pointsReward,
        };
      } catch (error) {
        console.error("Error completing game activity:", error);
        throw error;
      }
    }),
});

export default gamesRouter;
