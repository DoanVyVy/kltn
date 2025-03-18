// Cấp độ
// A1, A2, B1, B2, C1, C2
// Tiêu đề
// Mô tả
// Trạng thái

import { z } from "zod";

export enum Difficulty {
	Easy = 1,
	Medium,
	Advanced,
	Hard,
}
export const DifficultyDisplay: Record<Difficulty | number, string> = {
	[Difficulty.Easy]: "Dễ",
	[Difficulty.Medium]: "Trung bình",
	[Difficulty.Advanced]: "Nâng cao",
	[Difficulty.Hard]: "Khó",
};

export enum CourseStatus {
	Draft = "draft",
	Active = "active",
	Archived = "archived",
	Hidden = "hidden",
}
export const CourseStatusDisplayMap = {
	[CourseStatus.Draft]: "Bản nháp",
	[CourseStatus.Active]: "Hoạt động",
	[CourseStatus.Archived]: "Lưu trữ",
	[CourseStatus.Hidden]: "Ẩn",
};
export const createCategorySchema = z.object({
	title: z.string().min(3, "Tiêu đề phải có ít nhất 3 ký tự"),
	description: z.string().min(10, "Mô tả phải có ít nhất 10 ký tự"),
	status: z.nativeEnum(CourseStatus).default(CourseStatus.Draft),
	difficulty: z.coerce.number().int().min(1).max(4).default(1),
});
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
