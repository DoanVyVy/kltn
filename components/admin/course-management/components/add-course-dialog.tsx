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
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Label } from "@/components/ui/label";

const courseSchema = z.object({
  categoryName: z.string().min(1, "Tên khóa học không được để trống"),
  description: z.string().optional(),
  difficultyLevel: z.number().min(1, "Cấp độ phải lớn hơn 0"),
  orderIndex: z.number().min(0, "Thứ tự phải lớn hơn hoặc bằng 0"),
});

type CourseFormData = z.infer<typeof courseSchema>;

type CourseType = "all" | "vocabulary" | "grammar";

interface AddCourseDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onSubmit: (data: CourseFormData) => void;
  courseType: CourseType;
}

export default function AddCourseDialog({
  isOpen,
  setIsOpen,
  onSubmit,
  courseType,
}: AddCourseDialogProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      categoryName: "",
      description: "",
      difficultyLevel: 1,
      orderIndex: 0,
    },
  });

	return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogContent>
				<DialogHeader>
          <DialogTitle>
            Thêm khóa học {courseType === "vocabulary" ? "từ vựng" : "ngữ pháp"}{" "}
            mới
          </DialogTitle>
				</DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="categoryName">Tên khóa học</Label>
            <Input
              id="categoryName"
              {...register("categoryName")}
              placeholder="Nhập tên khóa học"
            />
            {errors.categoryName && (
              <p className="text-sm text-red-500">
                {errors.categoryName.message}
              </p>
            )}
									</div>

          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Nhập mô tả khóa học"
            />
									</div>

          <div className="space-y-2">
            <Label htmlFor="difficultyLevel">Cấp độ</Label>
            <Input
              id="difficultyLevel"
              type="number"
              {...register("difficultyLevel", { valueAsNumber: true })}
              placeholder="Nhập cấp độ"
            />
            {errors.difficultyLevel && (
              <p className="text-sm text-red-500">
                {errors.difficultyLevel.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="orderIndex">Thứ tự</Label>
            <Input
              id="orderIndex"
              type="number"
              {...register("orderIndex", { valueAsNumber: true })}
              placeholder="Nhập thứ tự"
            />
            {errors.orderIndex && (
              <p className="text-sm text-red-500">
                {errors.orderIndex.message}
              </p>
            )}
									</div>

          <div className="flex justify-end gap-2">
							<Button
              type="button"
								variant="outline"
              onClick={() => setIsOpen(false)}
							>
								Hủy
							</Button>
            <Button type="submit">Thêm</Button>
          </div>
					</form>
			</DialogContent>
		</Dialog>
	);
}
