import { Badge } from "@/components/ui/badge";
import AdminDataTable, { ColumnDef } from "@/components/admin/AdminDataTable";

interface GameData {
  id: number;
  title: string;
  type: string;
  description: string;
  difficulty: string;
  active: boolean;
  words?: string[];
  sentences?: { original: string; scrambled: string[] }[];
  wordPairs?: { word: string; association: string }[];
  idioms?: { idiom: string; meaning: string; explanation: string }[];
}

interface GameTableProps {
  games: GameData[];
  isLoading: boolean;
  onEdit: (game: GameData) => void;
  onDelete: (game: GameData) => void;
}

export default function GameTable({
  games,
  isLoading,
  onEdit,
  onDelete,
}: GameTableProps) {
  const columns: ColumnDef[] = [
    {
      header: "Tiêu đề",
      accessorKey: "title",
    },
    {
      header: "Loại",
      cell: (row) => (
        <Badge variant="outline">
          {row.type === "word-guess" && "Đoán từ"}
          {row.type === "sentence-scramble" && "Xếp câu"}
          {row.type === "word-association" && "Liên kết từ"}
          {row.type === "idiom-challenge" && "Thành ngữ"}
        </Badge>
      ),
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
      header: "Độ khó",
      cell: (row) => (
        <Badge
          variant={
            row.difficulty === "easy"
              ? "default"
              : row.difficulty === "medium"
              ? "secondary"
              : "destructive"
          }
        >
          {row.difficulty === "easy" && "Dễ"}
          {row.difficulty === "medium" && "Trung bình"}
          {row.difficulty === "hard" && "Khó"}
        </Badge>
      ),
    },
    {
      header: "Trạng thái",
      cell: (row) => (
        <Badge variant={row.active ? "default" : "secondary"}>
          {row.active ? "Hoạt động" : "Không hoạt động"}
        </Badge>
      ),
    },
    {
      header: "Nội dung",
      cell: (row) => {
        if (row.type === "word-guess" && row.words) {
          return <span>{row.words.length} từ</span>;
        }
        if (row.type === "sentence-scramble" && row.sentences) {
          return <span>{row.sentences.length} câu</span>;
        }
        if (row.type === "word-association" && row.wordPairs) {
          return <span>{row.wordPairs.length} cặp từ</span>;
        }
        if (row.type === "idiom-challenge" && row.idioms) {
          return <span>{row.idioms.length} thành ngữ</span>;
        }
        return <span>-</span>;
      },
    },
  ];

  return (
    <AdminDataTable
      columns={columns}
      data={games}
      isLoading={isLoading}
      onEdit={onEdit}
      onDelete={onDelete}
      keyField="id"
      emptyMessage="Không có trò chơi nào"
    />
  );
}
