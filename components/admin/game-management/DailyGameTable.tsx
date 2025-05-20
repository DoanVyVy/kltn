"use client";

import { Badge } from "@/components/ui/badge";
import AdminDataTable, { ColumnDef } from "@/components/admin/AdminDataTable";
import { format } from "date-fns";

interface DailyGameData {
  id: number;
  activeDate: Date;
  difficulty: number;
  expReward: number;
  // Word Guess specific
  word?: string;
  definition?: string;
  hint?: string;
  // Sentence Scramble specific
  sentence?: string;
  scrambledSentence?: string;
  // Word Association specific
  sourceWord?: string;
  targetWords?: string[];
  correctWord?: string;
  // Idiom Challenge specific
  idiom?: string;
  meaning?: string;
  options?: string[];
  correctOption?: string;
}

interface DailyGameTableProps {
  games: DailyGameData[];
  gameType:
    | "wordGuess"
    | "sentenceScramble"
    | "wordAssociation"
    | "idiomChallenge";
  isLoading: boolean;
  onEdit: (game: DailyGameData) => void;
  onDelete: (game: DailyGameData) => void;
}

export default function DailyGameTable({
  games,
  gameType,
  isLoading,
  onEdit,
  onDelete,
}: DailyGameTableProps) {
  const getGameTypeColumns = (): ColumnDef[] => {
    const baseColumns: ColumnDef[] = [
      {
        header: "Ngày hiển thị",
        cell: (row) => format(new Date(row.activeDate), "dd/MM/yyyy"),
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
        header: "Điểm kinh nghiệm",
        accessorKey: "expReward",
      },
    ];

    // Add type-specific columns
    if (gameType === "wordGuess") {
      return [
        {
          header: "Từ",
          accessorKey: "word",
        },
        {
          header: "Định nghĩa",
          cell: (row) => (
            <div className="max-w-xs truncate">{row.definition}</div>
          ),
        },
        ...baseColumns,
      ];
    }

    if (gameType === "sentenceScramble") {
      return [
        {
          header: "Câu",
          cell: (row) => (
            <div className="max-w-xs truncate">{row.sentence}</div>
          ),
        },
        {
          header: "Câu đã tách",
          cell: (row) => (
            <div className="max-w-xs truncate">{row.scrambledSentence}</div>
          ),
        },
        ...baseColumns,
      ];
    }

    if (gameType === "wordAssociation") {
      return [
        {
          header: "Từ gợi ý",
          accessorKey: "sourceWord",
        },
        {
          header: "Từ liên kết",
          cell: (row) => (
            <div className="max-w-xs truncate">
              {Array.isArray(row.targetWords)
                ? row.targetWords.join(", ")
                : "Không có từ liên kết"}
            </div>
          ),
        },
        {
          header: "Từ đúng",
          accessorKey: "correctWord",
        },
        ...baseColumns,
      ];
    }

    if (gameType === "idiomChallenge") {
      return [
        {
          header: "Thành ngữ",
          accessorKey: "idiom",
        },
        {
          header: "Ý nghĩa",
          cell: (row) => <div className="max-w-xs truncate">{row.meaning}</div>,
        },
        {
          header: "Số tùy chọn",
          cell: (row) => (
            <span>
              {Array.isArray(row.options) ? row.options.length : 0} tùy chọn
            </span>
          ),
        },
        ...baseColumns,
      ];
    }

    return baseColumns;
  };

  return (
    <AdminDataTable
      columns={getGameTypeColumns()}
      data={games}
      isLoading={isLoading}
      onEdit={onEdit}
      onDelete={onDelete}
      keyField="id"
      emptyMessage={`Không có ${
        gameType === "wordGuess"
          ? "đố từ"
          : gameType === "sentenceScramble"
          ? "câu đố"
          : gameType === "wordAssociation"
          ? "liên kết từ"
          : "thách thức thành ngữ"
      } hàng ngày nào`}
    />
  );
}
