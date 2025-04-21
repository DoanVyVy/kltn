import { z } from "zod";

export const createGrammarSchema = z.object({
  title: z.string().min(1, "Tiêu đề không được để trống"),
  categoryId: z.number().min(1, "Vui lòng chọn danh mục"),
  explanation: z.string().min(1, "Giải thích không được để trống"),
  examples: z.string().min(1, "Ví dụ không được để trống"),
  notes: z.string().optional(),
  orderIndex: z.number().min(0).default(0),
  difficultyLevel: z.number().min(1).max(5).default(1),
  imageUrl: z.string().optional(),
  videoUrl: z.string().optional(),
});

export const updateGrammarSchema = createGrammarSchema.partial();

export type CreateGrammarInput = z.infer<typeof createGrammarSchema>;
export type UpdateGrammarInput = z.infer<typeof updateGrammarSchema>;
