import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { type VocabularyWordListElement } from "@/routers/vocabulary_word.route";
import {
  Pencil,
  Trash2,
  Volume2,
  Image,
  Video,
  HelpCircle,
  Edit,
  Play,
} from "lucide-react";
import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { VocabularyWord } from "@prisma/client";

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
  if (isLoading) {
    return <div>Đang tải...</div>;
  }

  if (!vocabularies || vocabularies.length === 0) {
    return <div>Không có từ vựng nào</div>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className="cursor-help">
                    Từ vựng
                  </TooltipTrigger>
                  <TooltipContent>Từ vựng tiếng Anh cần học</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </TableHead>
            <TableHead>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className="cursor-help">
                    Phát âm
                  </TooltipTrigger>
                  <TooltipContent>Cách phát âm của từ vựng</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </TableHead>
            <TableHead>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className="cursor-help">
                    Loại từ
                  </TooltipTrigger>
                  <TooltipContent>
                    Loại từ của từ vựng (danh từ, động từ, tính từ...)
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </TableHead>
            <TableHead>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className="cursor-help">Nghĩa</TooltipTrigger>
                  <TooltipContent>Nghĩa tiếng Việt của từ vựng</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </TableHead>
            <TableHead>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className="cursor-help">Ví dụ</TooltipTrigger>
                  <TooltipContent>Câu ví dụ sử dụng từ vựng</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </TableHead>
            <TableHead>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className="cursor-help">
                    Khóa học
                  </TooltipTrigger>
                  <TooltipContent>Khóa học chứa từ vựng này</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </TableHead>
            <TableHead>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className="cursor-help">
                    Thao tác
                  </TooltipTrigger>
                  <TooltipContent>
                    Các thao tác có thể thực hiện với từ vựng
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vocabularies.map((vocabulary) => (
            <TableRow key={vocabulary.wordId}>
              <TableCell>{vocabulary.word}</TableCell>
              <TableCell>{vocabulary.pronunciation}</TableCell>
              <TableCell>{vocabulary.partOfSpeech}</TableCell>
              <TableCell>{vocabulary.definition}</TableCell>
              <TableCell>{vocabulary.exampleSentence}</TableCell>
              <TableCell>{vocabulary.category?.categoryName}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onPlayAudio(vocabulary.audioUrl || "")}
                          className={
                            isPlaying && currentUrl === vocabulary.audioUrl
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

                  {vocabulary.imageUrl && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" asChild>
                            <a
                              href={vocabulary.imageUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Image className="h-4 w-4" />
                            </a>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Xem hình ảnh</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}

                  {vocabulary.videoUrl && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" asChild>
                            <a
                              href={vocabulary.videoUrl}
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

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(vocabulary)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Sửa</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDelete(vocabulary)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Xóa</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
