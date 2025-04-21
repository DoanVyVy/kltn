import { z } from "zod";

export const vocabularyDefinitionSchema = z.object({
  type: z.string({ message: "Loại không được để trống" }).min(1, {
    message: "Loại không được để trống",
  }),
  definition: z.string({ message: "Nghĩa không được để trống" }).min(1, {
    message: "Nghĩa không được để trống",
  }),
  example: z.string(),
  translation: z.string(),
});

export const createVocabularySchema = z.object({
  word: z.string().min(1, "Từ vựng không được để trống"),
  pronunciation: z.string().optional(),
  partOfSpeech: z.string().optional(),
  definition: z.string().min(1, "Định nghĩa không được để trống"),
  exampleSentence: z.string().optional(),
  audioUrl: z.string().optional(),
  imageUrl: z.string().optional(),
  videoUrl: z.string().optional(),
  difficultyLevel: z.number().min(1).max(5).default(1),
  categoryId: z.number().min(1, "Vui lòng chọn danh mục"),
  phonetic: z.string({ message: "Phát âm không được để trống" }).min(1, {
    message: "Phát âm không được để trống",
  }),
  definitions: z.array(vocabularyDefinitionSchema).default([]),
  paronymWords: z.array(z.string()).default([]),
});

export const updateVocabularySchema = createVocabularySchema.partial();

export type CreateVocabularyInput = z.infer<typeof createVocabularySchema>;
export type UpdateVocabularyInput = z.infer<typeof updateVocabularySchema>;
export type VocabularyDefinition = z.infer<typeof vocabularyDefinitionSchema>;
