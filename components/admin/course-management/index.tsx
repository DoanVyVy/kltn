"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";
import { Category } from "@prisma/client";
import { trpc } from "@/trpc/client";
import { useToast } from "@/components/ui/use-toast";
import CourseTable from "./components/course-table";
import AddCourseDialog from "./components/add-course-dialog";
import EditCourseDialog from "./components/edit-course-dialog";
import DeleteCourseDialog from "./components/delete-course-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type CourseType = "all" | "vocabulary" | "grammar";

export default function CourseManagement() {
  const { toast } = useToast();
  const [currentCourse, setCurrentCourse] = useState<Category | null>(null);
  const [dialog, setDialog] = useState<"edit" | "delete" | "add" | null>(null);
  const [courseType, setCourseType] = useState<CourseType>("all");
  const utils = trpc.useUtils();

  const { data: courses = [], isLoading } =
    trpc.category.getValidCategories.useQuery(
      courseType === "all"
        ? undefined
        : {
            isVocabularyCourse: courseType === "vocabulary",
          }
    );

  const createMutation = trpc.category.create.useMutation({
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Đã thêm khóa học mới",
      });
      utils.category.getValidCategories.invalidate();
      setDialog(null);
    },
  });

  const updateMutation = trpc.category.update.useMutation({
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Đã cập nhật khóa học",
      });
      utils.category.getValidCategories.invalidate();
      setDialog(null);
    },
  });

  const deleteMutation = trpc.category.delete.useMutation({
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Đã xóa khóa học",
      });
      utils.category.getValidCategories.invalidate();
      setDialog(null);
    },
  });

  const handleCreate = async (data: any) => {
    await createMutation.mutateAsync({
      ...data,
      isVocabularyCourse: courseType === "vocabulary",
    });
  };

  const handleUpdate = async (data: any) => {
    if (!currentCourse) return;

    await updateMutation.mutateAsync({
      categoryId: currentCourse.categoryId,
      ...data,
      isVocabularyCourse: currentCourse.isVocabularyCourse,
    });
  };

  const handleDelete = async (id: number) => {
    await deleteMutation.mutateAsync(id);
  };

  const openEditDialog = (course: Category) => {
    setCurrentCourse(course);
    setCourseType(course.isVocabularyCourse ? "vocabulary" : "grammar");
    setDialog("edit");
  };

  const openDeleteDialog = (course: Category) => {
    setCurrentCourse(course);
    setDialog("delete");
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold">Quản lý khóa học</h2>
          <Select
            value={courseType}
            onValueChange={(value: CourseType) => setCourseType(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Chọn loại khóa học" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="vocabulary">Từ vựng</SelectItem>
              <SelectItem value="grammar">Ngữ pháp</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button
          className="flex items-center gap-2 bg-game-primary hover:bg-game-primary/90"
          onClick={() => {
            setCurrentCourse(null);
            setDialog("add");
          }}
        >
          <PlusCircle size={16} />
          Thêm khóa học mới
        </Button>
      </div>

      <Card>
        <CourseTable
          courses={courses}
          isLoading={isLoading}
          onEdit={openEditDialog}
          onDelete={openDeleteDialog}
        />
      </Card>

      {/* Dialogs */}
      <AddCourseDialog
        isOpen={dialog === "add"}
        setIsOpen={(isOpen) => setDialog(isOpen ? "add" : null)}
        onSubmit={handleCreate}
        courseType={courseType}
      />

      <EditCourseDialog
        isOpen={dialog === "edit"}
        setIsOpen={(isOpen) => setDialog(isOpen ? "edit" : null)}
        currentCourse={currentCourse}
        onSubmit={handleUpdate}
      />

      <DeleteCourseDialog
        isOpen={dialog === "delete"}
        setIsOpen={(isOpen: boolean) => setDialog(isOpen ? "delete" : null)}
        currentCourse={currentCourse}
        onConfirm={() =>
          currentCourse && handleDelete(currentCourse.categoryId)
        }
      />
    </div>
  );
}
