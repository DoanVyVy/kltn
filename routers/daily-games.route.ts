import { z } from "zod";
import { baseProcedure, createTRPCRouter } from "./init";
import { db } from "@/database";

export const dailyGamesRouter = createTRPCRouter({
  // Daily Word Challenges
  getAllDailyWordChallenges: baseProcedure
    .input(
      z.object({
        page: z.number().default(1),
        limit: z.number().min(1).max(50).default(10),
        search: z.string().optional(),
        difficulty: z.number().optional(),
        dateFrom: z.date().optional(),
        dateTo: z.date().optional(),
      })
    )
    .query(async ({ input }) => {
      const { page, limit, search, difficulty, dateFrom, dateTo } = input;
      const skip = (page - 1) * limit;

      // Build where condition
      const where: any = {};

      if (search) {
        where.OR = [
          { word: { contains: search, mode: "insensitive" } },
          { definition: { contains: search, mode: "insensitive" } },
        ];
      }

      if (difficulty) {
        where.difficulty = difficulty;
      }

      if (dateFrom || dateTo) {
        where.activeDate = {};
        if (dateFrom) where.activeDate.gte = dateFrom;
        if (dateTo) where.activeDate.lte = dateTo;
      }

      try {
        const [items, totalCount] = await Promise.all([
          db.dailyWordChallenge.findMany({
            where,
            skip,
            take: limit,
            orderBy: { activeDate: "desc" },
          }),
          db.dailyWordChallenge.count({ where }),
        ]);

        return {
          items,
          totalPages: Math.ceil(totalCount / limit),
          currentPage: page,
          totalCount,
        };
      } catch (error) {
        console.error("Error fetching daily word challenges:", error);
        throw error;
      }
    }),

  createDailyWordChallenge: baseProcedure
    .input(
      z.object({
        word: z.string(),
        hint: z.string().optional(),
        definition: z.string(),
        difficulty: z.number().min(1).max(3),
        expReward: z.number().default(50),
        partOfSpeech: z.string().optional(),
        imageUrl: z.string().optional(),
        exampleSentence: z.string().optional(),
        activeDate: z.date(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        return await db.dailyWordChallenge.create({
          data: input,
        });
      } catch (error) {
        console.error("Error creating daily word challenge:", error);
        throw error;
      }
    }),

  updateDailyWordChallenge: baseProcedure
    .input(
      z.object({
        id: z.number(),
        word: z.string().optional(),
        hint: z.string().optional(),
        definition: z.string().optional(),
        difficulty: z.number().min(1).max(3).optional(),
        expReward: z.number().optional(),
        partOfSpeech: z.string().optional(),
        imageUrl: z.string().optional(),
        exampleSentence: z.string().optional(),
        activeDate: z.date().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;

      try {
        return await db.dailyWordChallenge.update({
          where: { id },
          data,
        });
      } catch (error) {
        console.error("Error updating daily word challenge:", error);
        throw error;
      }
    }),

  deleteDailyWordChallenge: baseProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const { id } = input;

      try {
        return await db.dailyWordChallenge.delete({
          where: { id },
        });
      } catch (error) {
        console.error("Error deleting daily word challenge:", error);
        throw error;
      }
    }),

  // Daily Sentence Scramble
  getAllDailySentenceScrambles: baseProcedure
    .input(
      z.object({
        page: z.number().default(1),
        limit: z.number().min(1).max(50).default(10),
        search: z.string().optional(),
        difficulty: z.number().optional(),
        dateFrom: z.date().optional(),
        dateTo: z.date().optional(),
      })
    )
    .query(async ({ input }) => {
      const { page, limit, search, difficulty, dateFrom, dateTo } = input;
      const skip = (page - 1) * limit;

      // Build where condition
      const where: any = {};

      if (search) {
        where.OR = [
          { sentence: { contains: search, mode: "insensitive" } },
          { scrambledSentence: { contains: search, mode: "insensitive" } },
        ];
      }

      if (difficulty) {
        where.difficulty = difficulty;
      }

      if (dateFrom || dateTo) {
        where.activeDate = {};
        if (dateFrom) where.activeDate.gte = dateFrom;
        if (dateTo) where.activeDate.lte = dateTo;
      }

      try {
        const [items, totalCount] = await Promise.all([
          db.dailySentenceScramble.findMany({
            where,
            skip,
            take: limit,
            orderBy: { activeDate: "desc" },
          }),
          db.dailySentenceScramble.count({ where }),
        ]);

        return {
          items,
          totalPages: Math.ceil(totalCount / limit),
          currentPage: page,
          totalCount,
        };
      } catch (error) {
        console.error("Error fetching daily sentence scrambles:", error);
        throw error;
      }
    }),

  createDailySentenceScramble: baseProcedure
    .input(
      z.object({
        sentence: z.string(),
        scrambledSentence: z.string(),
        difficulty: z.number().min(1).max(3),
        expReward: z.number().default(50),
        translation: z.string().optional(),
        hint: z.string().optional(),
        activeDate: z.date(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        return await db.dailySentenceScramble.create({
          data: input,
        });
      } catch (error) {
        console.error("Error creating daily sentence scramble:", error);
        throw error;
      }
    }),

  updateDailySentenceScramble: baseProcedure
    .input(
      z.object({
        id: z.number(),
        sentence: z.string().optional(),
        scrambledSentence: z.string().optional(),
        difficulty: z.number().min(1).max(3).optional(),
        expReward: z.number().optional(),
        translation: z.string().optional(),
        hint: z.string().optional(),
        activeDate: z.date().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;

      try {
        return await db.dailySentenceScramble.update({
          where: { id },
          data,
        });
      } catch (error) {
        console.error("Error updating daily sentence scramble:", error);
        throw error;
      }
    }),

  deleteDailySentenceScramble: baseProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const { id } = input;

      try {
        return await db.dailySentenceScramble.delete({
          where: { id },
        });
      } catch (error) {
        console.error("Error deleting daily sentence scramble:", error);
        throw error;
      }
    }),
  // Add similar CRUD operations for other daily game types:
  // - DailyVocabularyQuiz
  // - DailyGrammarChallenge
  // - DailyListeningChallenge

  // Daily Pronunciation Check operations
  getAllDailyPronunciationChecks: baseProcedure
    .input(
      z.object({
        page: z.number().default(1),
        limit: z.number().min(1).max(50).default(10),
        search: z.string().optional(),
        difficulty: z.number().optional(),
        dateFrom: z.date().optional(),
        dateTo: z.date().optional(),
      })
    )
    .query(async ({ input }) => {
      const { page, limit, search, difficulty, dateFrom, dateTo } = input;
      const skip = (page - 1) * limit;

      try {
        // Build where condition
        const where: any = {};

        if (search) {
          where.OR = [
            { word: { contains: search, mode: "insensitive" } },
            { ipa: { contains: search, mode: "insensitive" } },
          ];
        }

        if (difficulty) {
          where.difficulty = difficulty;
        }

        if (dateFrom || dateTo) {
          where.activeDate = {};
          if (dateFrom) where.activeDate.gte = dateFrom;
          if (dateTo) where.activeDate.lte = dateTo;
        }

        // Get daily pronunciation checks with pagination
        const [items, totalCount] = await Promise.all([
          db.dailyPronunciationCheck.findMany({
            where,
            orderBy: { activeDate: "desc" },
            take: limit,
            skip,
          }),
          db.dailyPronunciationCheck.count({ where }),
        ]);

        return {
          items,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
          currentPage: page,
        };
      } catch (error) {
        console.error("Error fetching daily pronunciation checks:", error);
        throw error;
      }
    }),

  createDailyPronunciationCheck: baseProcedure
    .input(
      z.object({
        word: z.string().min(1),
        ipa: z.string().min(1),
        audioUrl: z.string().min(1),
        sampleSentence: z.string().optional(),
        difficulty: z.number().min(1).max(3),
        expReward: z.number().min(1),
        activeDate: z.date(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        return await db.dailyPronunciationCheck.create({
          data: input,
        });
      } catch (error) {
        console.error("Error creating daily pronunciation check:", error);
        throw error;
      }
    }),

  updateDailyPronunciationCheck: baseProcedure
    .input(
      z.object({
        id: z.number(),
        word: z.string().min(1),
        ipa: z.string().min(1),
        audioUrl: z.string().min(1),
        sampleSentence: z.string().optional(),
        difficulty: z.number().min(1).max(3),
        expReward: z.number().min(1),
        activeDate: z.date(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...updateData } = input;

      try {
        return await db.dailyPronunciationCheck.update({
          where: { id },
          data: updateData,
        });
      } catch (error) {
        console.error("Error updating daily pronunciation check:", error);
        throw error;
      }
    }),

  deleteDailyPronunciationCheck: baseProcedure
    .input(
      z.object({
        id: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        return await db.dailyPronunciationCheck.delete({
          where: { id: input.id },
        });
      } catch (error) {
        console.error("Error deleting daily pronunciation check:", error);
        throw error;
      }
    }),
});
