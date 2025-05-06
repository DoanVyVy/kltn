import { paginationRequestSchema } from "@/schema/pagination";
import { baseProcedure, createTRPCRouter } from "./init";
import { z } from "zod";
import { createVocabularySchema } from "@/schema/vocabulary";

const vocabularyWordRouter = createTRPCRouter({
  getAll: baseProcedure
    .input(paginationRequestSchema.extend({ categoryId: z.number().nullish() }))
    .query(async ({ ctx: { db }, input }) => {
      return db.vocabularyWord.findMany({
        skip: (input.page - 1) * input.limit,
        take: input.limit,
        where: {
          ...(input.search && {
            word: {
              contains: input.search,
              mode: "insensitive",
            },
            definition: {
              contains: input.search,
              mode: "insensitive",
            },
          }),
          ...(input.categoryId && {
            categoryId: input.categoryId,
          }),
        },
        include: {
          category: true,
        },
        orderBy: {
          wordId: "desc",
        },
      });
    }),
  getById: baseProcedure
    .input(z.number())
    .query(async ({ ctx: { db }, input }) => {
      return await db.vocabularyWord.findUnique({
        where: {
          wordId: input,
        },
      });
    }),

  create: baseProcedure
    .input(createVocabularySchema)
    .mutation(async ({ ctx: { db }, input }) => {
      const data = await db.vocabularyWord.create({
        data: {
          definition: input.definitions?.[0]?.definition,
          categoryId: input.categoryId,
          word: input.word,
          audioUrl: input.audioUrl,
          partOfSpeech: input.definitions?.[0]?.type,
          exampleSentence: input.definitions?.[0]?.example,
          pronunciation: input.phonetic,
        },
      });
      db.category.update({
        where: {
          categoryId: input.categoryId,
        },
        data: {
          totalWords: {
            increment: 1,
          },
        },
      });
      return data;
    }),

  update: baseProcedure
    .input(
      createVocabularySchema.extend({
        wordId: z.number(),
      })
    )
    .mutation(async ({ ctx: { db }, input }) => {
      return await db.vocabularyWord.update({
        where: {
          wordId: input.wordId,
        },
        data: {
          definition: input.definitions?.[0]?.definition,
          categoryId: input.categoryId,
          word: input.word,
          audioUrl: input.audioUrl,
          partOfSpeech: input.definitions?.[0]?.type,
          exampleSentence: input.definitions?.[0]?.example,
          pronunciation: input.phonetic,
        },
      });
    }),
  delete: baseProcedure
    .input(z.number())
    .mutation(async ({ ctx: { db }, input }) => {
      return await db.vocabularyWord.delete({
        where: {
          wordId: input,
        },
      });
    }),
  export: baseProcedure
    .input(
      z.object({
        categoryId: z.number().optional(),
        format: z.enum(["json", "csv"]).optional().default("json"),
        allCategories: z.boolean().optional().default(false),
      })
    )
    .mutation(async ({ ctx: { db }, input }) => {
      const vocabularies = await db.vocabularyWord.findMany({
        where: {
          ...(input.categoryId &&
            !input.allCategories && {
              categoryId: input.categoryId,
            }),
        },
        include: {
          category: {
            select: {
              categoryName: true,
              difficultyLevel: true,
            },
          },
        },
        orderBy: {
          wordId: "desc",
        },
      });

      if (input.format === "csv") {
        // Tạo dữ liệu CSV
        const header =
          "word,pronunciation,partOfSpeech,definition,exampleSentence,audioUrl,imageUrl,videoUrl,category\n";
        const rows = vocabularies
          .map((v) => {
            return `"${v.word || ""}","${v.pronunciation || ""}","${
              v.partOfSpeech || ""
            }","${v.definition?.replace(/"/g, '""') || ""}","${
              v.exampleSentence?.replace(/"/g, '""') || ""
            }","${v.audioUrl || ""}","${v.imageUrl || ""}","${
              v.videoUrl || ""
            }","${v.category?.categoryName || ""}"`;
          })
          .join("\n");

        return {
          data: header + rows,
          format: "csv",
          filename: `vocabulary-export-${
            new Date().toISOString().split("T")[0]
          }.csv`,
        };
      }

      // Mặc định trả về JSON
      return {
        data: vocabularies,
        format: "json",
        filename: `vocabulary-export-${
          new Date().toISOString().split("T")[0]
        }.json`,
      };
    }),
  import: baseProcedure
    .input(
      z.object({
        file: z.string(),
        format: z.enum(["json", "csv"]).default("csv"),
        categoryId: z.number().optional(),
      })
    )
    .mutation(async ({ ctx: { db }, input }) => {
      const importedWords = [];

      if (input.format === "csv") {
        // Parse CSV data
        const rows = input.file.split("\n").slice(1); // Skip header
        for (const row of rows) {
          if (!row.trim()) continue;

          const [
            word,
            pronunciation,
            partOfSpeech,
            definition,
            exampleSentence,
            audioUrl,
            imageUrl,
            videoUrl,
            categoryName,
          ] = row.split(",").map((cell) => cell.replace(/^"|"$/g, ""));

          if (!word || !definition) continue;

          // Tìm categoryId nếu có categoryName
          let categoryId = input.categoryId;
          if (categoryName && !categoryId) {
            const category = await db.category.findFirst({
              where: {
                categoryName: categoryName,
                isVocabularyCourse: true,
              },
            });
            if (category) {
              categoryId = category.categoryId;
            }
          }

          // Nếu không có categoryId, bỏ qua từ vựng này
          if (!categoryId) continue;

          const vocabulary = await db.vocabularyWord.create({
            data: {
              word,
              pronunciation,
              partOfSpeech,
              definition,
              exampleSentence,
              audioUrl,
              imageUrl,
              videoUrl,
              categoryId,
            },
          });

          importedWords.push(vocabulary);
        }
      } else {
        // Parse JSON data
        try {
          const data = JSON.parse(input.file);
          const items = Array.isArray(data) ? data : [data];

          for (const item of items) {
            if (!item.word || !item.definition) continue;

            // Tìm categoryId nếu có categoryName
            let categoryId = input.categoryId;
            if (item.categoryName && !categoryId) {
              const category = await db.category.findFirst({
                where: {
                  categoryName: item.categoryName,
                  isVocabularyCourse: true,
                },
              });
              if (category) {
                categoryId = category.categoryId;
              }
            }

            // Nếu không có categoryId, bỏ qua từ vựng này
            if (!categoryId) continue;

            const vocabulary = await db.vocabularyWord.create({
              data: {
                word: item.word,
                pronunciation: item.pronunciation,
                partOfSpeech: item.partOfSpeech,
                definition: item.definition,
                exampleSentence: item.exampleSentence,
                audioUrl: item.audioUrl,
                imageUrl: item.imageUrl,
                videoUrl: item.videoUrl,
                categoryId,
              },
            });

            importedWords.push(vocabulary);
          }
        } catch (error) {
          console.error("JSON parse error:", error);
          throw new Error("Không thể phân tích file JSON");
        }
      }

      return {
        count: importedWords.length,
        words: importedWords,
      };
    }),
});
export type VocabularyWordListElement = Awaited<
  ReturnType<(typeof vocabularyWordRouter)["getAll"]>
>[0];
export default vocabularyWordRouter;
