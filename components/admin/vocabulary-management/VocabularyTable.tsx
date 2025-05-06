import { Button } from "@/components/ui/button";
import { Play, Image as ImageIcon, Video } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { VocabularyWord } from "@prisma/client";
import AdminDataTable, { ColumnDef } from "@/components/admin/AdminDataTable";
import { Badge } from "@/components/ui/badge";

interface VocabularyTableProps {
  vocabularies: VocabularyWord[];
  isLoading: boolean;
  onEdit: (vocabulary: VocabularyWord) => void;
  onDelete: (vocabulary: VocabularyWord) => void;
  onPlayAudio: (url: string) => void;
  isPlaying: boolean;
  currentUrl: string | null;
}

export default function VocabularyTable({
  vocabularies,
  isLoading,
  onEdit,
  onDelete,
  onPlayAudio,
  isPlaying,
  currentUrl,
}: VocabularyTableProps) {
  const columns: ColumnDef[] = [
    {
      header: "Từ vựng",
      accessorKey: "word",
    },
    {
      header: "Phát âm",
      accessorKey: "pronunciation",
    },
    {
      header: "Loại từ",
      accessorKey: "partOfSpeech",
      cell: (row) => (
        <Badge variant="outline" className="capitalize">
          {row.partOfSpeech || "—"}
        </Badge>
      ),
    },
    {
      header: "Nghĩa",
      accessorKey: "definition",
      cell: (row) => (
        <div className="max-w-xs truncate">{row.definition || "—"}</div>
      ),
    },
    {
      header: "Ví dụ",
      accessorKey: "exampleSentence",
      cell: (row) => (
        <div className="max-w-xs truncate">
          {row.exampleSentence || "—"}
        </div>
      ),
    },
    {
      header: "Khóa học",
      cell: (row) => (
        <div>{row.category?.categoryName || "—"}</div>
      ),
    },
    {
      header: "Media",
      cell: (row) => (
        <div className="flex items-center gap-2">
          {row.audioUrl && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPlayAudio(row.audioUrl || "");
                    }}
                    className={
                      isPlaying && currentUrl === row.audioUrl
                        ? "text-blue-500"
                        : ""
                    }
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Nghe phát âm</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {row.imageUrl && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" asChild>
                    <a
                      href={row.imageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ImageIcon className="h-4 w-4" />
                    </a>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Xem hình ảnh</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {row.videoUrl && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" asChild>
                    <a
                      href={row.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Video className="h-4 w-4" />
                    </a>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Xem video</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      ),
    },
  ];

  return (
    <AdminDataTable
      columns={columns}
      data={vocabularies}
      isLoading={isLoading}
      onEdit={onEdit}
      onDelete={onDelete}
      keyField="wordId"
      emptyMessage="Không có từ vựng nào"
    />
  );
}
