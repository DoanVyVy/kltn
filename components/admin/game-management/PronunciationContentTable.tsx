"use client";

import { Badge } from "@/components/ui/badge";
import AdminDataTable, { ColumnDef } from "@/components/admin/AdminDataTable";

interface PronunciationContentData {
  id: number;
  type: string;
  content: string;
  audioUrl?: string;
  translation?: string;
  difficulty: number;
  category?: string;
  expReward: number;
  isActive: boolean;
}

interface PronunciationContentTableProps {
  contents: PronunciationContentData[];
  isLoading: boolean;
  onEdit: (content: PronunciationContentData) => void;
  onDelete: (content: PronunciationContentData) => void;
}

export default function PronunciationContentTable({
  contents,
  isLoading,
  onEdit,
  onDelete,
}: PronunciationContentTableProps) {
  const columns: ColumnDef[] = [
    {
      header: "Nội dung",
      cell: (row) => <div className="max-w-xs truncate">{row.content}</div>,
    },
    {
      header: "Loại",
      cell: (row) => (
        <Badge variant="outline">
          {row.type === "word" && "Từ"}
          {row.type === "sentence" && "Câu"}
          {row.type === "paragraph" && "Đoạn văn"}
        </Badge>
      ),
    },
    {
      header: "Bản dịch",
      cell: (row) => (
        <div className="max-w-xs truncate">
          {row.translation || "Không có bản dịch"}
        </div>
      ),
    },
    {
      header: "Danh mục",
      accessorKey: "category",
      cell: (row) => row.category || "Không có danh mục",
    },
    {
      header: "Độ khó",
      cell: (row) => (
        <Badge
          variant={
            row.difficulty === 1
              ? "default"
              : row.difficulty === 2
              ? "secondary"
              : "destructive"
          }
        >
          {row.difficulty === 1 && "Dễ"}
          {row.difficulty === 2 && "Trung bình"}
          {row.difficulty === 3 && "Khó"}
        </Badge>
      ),
    },
    {
      header: "Điểm KN",
      accessorKey: "expReward",
    },
    {
      header: "Trạng thái",
      cell: (row) => (
        <Badge variant={row.isActive ? "default" : "secondary"}>
          {row.isActive ? "Hoạt động" : "Không hoạt động"}
        </Badge>
      ),
    },
    {
      header: "Âm thanh",
      cell: (row) =>
        row.audioUrl ? (
          <audio
            controls
            src={row.audioUrl}
            className="h-8 w-full"
            preload="none"
          />
        ) : (
          <span className="text-muted-foreground">Không có âm thanh</span>
        ),
    },
  ];

  return (
    <AdminDataTable
      columns={columns}
      data={contents}
      isLoading={isLoading}
      onEdit={onEdit}
      onDelete={onDelete}
      keyField="id"
      emptyMessage="Không có nội dung phát âm nào"
    />
  );
}
