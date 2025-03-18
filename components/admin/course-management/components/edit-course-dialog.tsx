import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { useCourseForm } from "../hooks/use-course-form";
import {
	Difficulty,
	DifficultyDisplay,
	CreateCategoryInput,
} from "@/schema/category";
import { VocabularyCategory } from "@prisma/client";
import { useEffect } from "react";

interface EditCourseDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	editAsync: (data: any) => Promise<any>;
	isEditing: boolean;
	currentCourse: VocabularyCategory | null;
}

export default function EditCourseDialog({
	open,
	onOpenChange,
	editAsync,
	isEditing,
	currentCourse,
}: EditCourseDialogProps) {
	const { form } = useCourseForm();

	// Reset form with current course data when it changes
	useEffect(() => {
		if (currentCourse) {
			form.reset({
				difficulty: currentCourse.difficultyLevel,
				title: currentCourse.categoryName,
				description: currentCourse.description || "",
				status: currentCourse.status as any,
			});
		}
	}, [currentCourse, form]);

	const onSubmit = async (data: CreateCategoryInput) => {
		if (currentCourse) {
			await editAsync({
				categoryId: currentCourse.categoryId,
				difficulty: data.difficulty,
				title: data.title,
				description: data.description,
				status: data.status,
			});
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Chỉnh sửa khóa học</DialogTitle>
					<DialogDescription>
						Cập nhật thông tin cho khóa học
					</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="space-y-4 py-4"
					>
						<FormField
							control={form.control}
							name="difficulty"
							render={({ field }) => (
								<FormItem className="grid grid-cols-4 items-center gap-4">
									<FormLabel className="text-right">
										Cấp độ
									</FormLabel>
									<div className="col-span-3">
										<FormControl>
											<Select
												onValueChange={field.onChange}
												defaultValue={field.value + ""}
												value={field.value + ""}
											>
												<SelectTrigger>
													<SelectValue placeholder="Chọn cấp độ" />
												</SelectTrigger>
												<SelectContent>
													{Object.keys(Difficulty)
														.filter(
															(key) =>
																!isNaN(
																	parseInt(
																		key
																	)
																)
														)
														.map((difficulty) => (
															<SelectItem
																key={difficulty}
																value={
																	difficulty +
																	""
																}
															>
																{
																	DifficultyDisplay[
																		difficulty as any
																	]
																}
															</SelectItem>
														))}
												</SelectContent>
											</Select>
										</FormControl>
										<FormMessage />
									</div>
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="title"
							render={({ field }) => (
								<FormItem className="grid grid-cols-4 items-center gap-4">
									<FormLabel className="text-right">
										Tiêu đề
									</FormLabel>
									<div className="col-span-3">
										<FormControl>
											<Input {...field} />
										</FormControl>
										<FormMessage />
									</div>
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="description"
							render={({ field }) => (
								<FormItem className="grid grid-cols-4 items-center gap-4">
									<FormLabel className="text-right">
										Mô tả
									</FormLabel>
									<div className="col-span-3">
										<FormControl>
											<Textarea {...field} />
										</FormControl>
										<FormMessage />
									</div>
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="status"
							render={({ field }) => (
								<FormItem className="grid grid-cols-4 items-center gap-4">
									<FormLabel className="text-right">
										Trạng thái
									</FormLabel>
									<div className="col-span-3">
										<FormControl>
											<Select
												onValueChange={field.onChange}
												defaultValue={field.value}
												value={field.value}
											>
												<SelectTrigger>
													<SelectValue placeholder="Chọn trạng thái" />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="draft">
														Bản nháp
													</SelectItem>
													<SelectItem value="active">
														Hoạt động
													</SelectItem>
													<SelectItem value="archived">
														Lưu trữ
													</SelectItem>
												</SelectContent>
											</Select>
										</FormControl>
										<FormMessage />
									</div>
								</FormItem>
							)}
						/>

						<DialogFooter>
							<Button
								variant="outline"
								type="button"
								onClick={() => onOpenChange(false)}
							>
								Hủy
							</Button>
							<Button
								type="submit"
								className="bg-game-primary hover:bg-game-primary/90"
								disabled={isEditing}
							>
								{isEditing ? "Đang xử lý..." : "Lưu thay đổi"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
