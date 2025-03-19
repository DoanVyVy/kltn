import { z } from "zod";

export const paginationRequestSchema = z.object({
	page: z.number().int().positive().default(1),
	limit: z.number().int().positive().default(10),
	search: z.string().optional(),
});

export type PaginationRequest = z.infer<typeof paginationRequestSchema>;
