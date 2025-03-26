import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { Category } from "@prisma/client";
import { Skeleton } from "@/components/ui/skeleton";

interface CourseTableProps {
  courses: Category[];
  isLoading: boolean;
  onEdit: (course: Category) => void;
  onDelete: (course: Category) => void;
}

export default function CourseTable({
  courses,
  isLoading,
  onEdit,
  onDelete,
}: CourseTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Tên khóa học</TableHead>
          <TableHead>Mô tả</TableHead>
          <TableHead>Cấp độ</TableHead>
          <TableHead>Thứ tự</TableHead>
          <TableHead>Loại</TableHead>
          <TableHead className="text-right">Thao tác</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {courses.map((course) => (
          <TableRow key={course.categoryId}>
            <TableCell>{course.categoryName}</TableCell>
            <TableCell>{course.description}</TableCell>
            <TableCell>{course.difficultyLevel}</TableCell>
            <TableCell>{course.orderIndex}</TableCell>
            <TableCell>
              {course.isVocabularyCourse ? "Từ vựng" : "Ngữ pháp"}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(course)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(course)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
