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
	word: z.string({ message: "Từ vựng không được để trống" }).min(1, {
		message: "Từ vựng không được để trống",
	}),

	categoryId: z.number({ message: "Danh mục không được để trống" }).min(1, {
		message: "Danh mục không được để trống",
	}),
	phonetic: z.string({ message: "Phát âm không được để trống" }).min(1, {
		message: "Phát âm không được để trống",
	}),
	audioUrl: z.string({ message: "Audio không được để trống" }).min(1, {
		message: "Audio không được để trống",
	}),
	definitions: z.array(vocabularyDefinitionSchema).default([]),
});

export type CreateVocabularyInput = z.infer<typeof createVocabularySchema>;
export type VocabularyDefinition = z.infer<typeof vocabularyDefinitionSchema>;
