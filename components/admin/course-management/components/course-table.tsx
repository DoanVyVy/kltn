import type { Category } from "@/types/client-schema";
import { Badge } from "@/components/ui/badge";
import AdminDataTable, { ColumnDef } from "@/components/admin/AdminDataTable";

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
  const columns: ColumnDef[] = [
    {
      header: "Tên khóa học",
      accessorKey: "categoryName",
    },
    {
      header: "Mô tả",
      accessorKey: "description",
      cell: (row) => (
        <div className="max-w-xs truncate">
          {row.description || "Không có mô tả"}
        </div>
      ),
    },
    {
      header: "Cấp độ",
      cell: (row) => (
        <Badge
          className={`${
            row.difficultyLevel <= 2
              ? "bg-green-100 text-green-800 hover:bg-green-200"
              : row.difficultyLevel <= 4
              ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
              : "bg-red-100 text-red-800 hover:bg-red-200"
          }`}
        >
          Cấp {row.difficultyLevel}
        </Badge>
      ),
    },
    {
      header: "Thứ tự",
      accessorKey: "orderIndex",
    },
    {
      header: "Loại",
      cell: (row) => (
        <Badge
          variant="outline"
          className={
            row.isVocabularyCourse
              ? "border-blue-500 text-blue-700"
              : "border-purple-500 text-purple-700"
          }
        >
          {row.isVocabularyCourse ? "Từ vựng" : "Ngữ pháp"}
        </Badge>
      ),
    },
  ];

  return (
    <AdminDataTable
      columns={columns}
      data={courses}
      isLoading={isLoading}
      onEdit={onEdit}
      onDelete={onDelete}
      keyField="categoryId"
      emptyMessage="Không có khóa học nào"
    />
  );
}
