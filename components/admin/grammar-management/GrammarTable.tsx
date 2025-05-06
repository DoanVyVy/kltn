import { GrammarContentListElement } from "@/routers/grammar_content.route";
import AdminDataTable, { ColumnDef } from "@/components/admin/AdminDataTable";
import { Badge } from "@/components/ui/badge";

interface GrammarTableProps {
  data: GrammarContentListElement[] | undefined;
  isLoading: boolean;
  onEdit: (content: GrammarContentListElement) => void;
  onDelete: (content: GrammarContentListElement) => void;
}

export default function GrammarTable({
  data,
  isLoading,
  onEdit,
  onDelete,
}: GrammarTableProps) {
  const columns: ColumnDef[] = [
    {
      header: "ID",
      accessorKey: "contentId",
      className: "w-[50px]"
    },
    {
      header: "Tiêu đề",
      accessorKey: "title",
      className: "w-[200px]"
    },
    {
      header: "Khóa học",
      cell: (row) => (
        <div className="max-w-[200px] truncate">
          {row.category?.categoryName || "—"}
        </div>
      )
    },
    {
      header: "Giải thích",
      accessorKey: "explanation",
      cell: (row) => (
        <div className="max-w-xs truncate">
          {row.explanation || "Không có giải thích"}
        </div>
      ),
      className: "min-w-[300px]"
    },
    {
      header: "Cấp độ",
      cell: (row) => (
        <Badge
          className={`${
            row.level === "beginner"
              ? "bg-green-100 text-green-800 hover:bg-green-200"
              : row.level === "intermediate"
              ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
              : "bg-red-100 text-red-800 hover:bg-red-200"
          }`}
        >
          {row.level === "beginner"
            ? "Cơ bản"
            : row.level === "intermediate"
            ? "Trung cấp"
            : "Nâng cao"}
        </Badge>
      ),
    }
  ];

  return (
    <AdminDataTable
      columns={columns}
      data={data}
      isLoading={isLoading}
      onEdit={onEdit}
      onDelete={onDelete}
      keyField="contentId"
      emptyMessage="Không có nội dung ngữ pháp nào"
    />
  );
}
