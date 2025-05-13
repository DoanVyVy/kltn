import { useState, useEffect, memo } from "react";
import { Volume2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { trpc } from "@/trpc/client";
import { useAudio } from "@/app/vocabulary/learn/[id]/_hooks/useAudio";

// Định nghĩa kiểu cho word
interface VocabularyWord {
  wordId: number;
  word: string;
  definition: string;
  pronunciation?: string | null;
  partOfSpeech?: string | null;
  imageUrl?: string | null;
  videoUrl?: string | null;
  audioUrl?: string | null;
  exampleSentence?: string | null;
  [key: string]: any; // Cho phép các thuộc tính khác
}

// Định nghĩa kiểu cho props của VocabularyWordRow
interface VocabularyWordRowProps {
  word: VocabularyWord;
  index: number;
  onPlayAudio: (audioUrl: string) => void;
}

// Định nghĩa kiểu cho props của PreviewVocabularyDialog
interface PreviewVocabularyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course: {
    categoryId: number;
    categoryName: string;
    totalWords?: number;
    [key: string]: any;
  } | null;
}

// Tách component từ vựng để tối ưu hóa việc render lại
const VocabularyWordRow = memo(
  ({ word, index, onPlayAudio }: VocabularyWordRowProps) => {
    return (
      <tr className="bg-white">
        <td className="px-4 py-3 text-sm text-game-accent">{index + 1}</td>
        <td className="px-4 py-3 text-sm font-medium text-game-primary">
          {word.word}
          {word.pronunciation && (
            <span className="ml-2 text-xs text-gray-500">
              {word.pronunciation}
            </span>
          )}
        </td>
        <td className="px-4 py-3 text-sm text-game-accent">
          {word.definition}
          {word.partOfSpeech && (
            <span className="ml-1 text-xs italic text-gray-500">
              ({word.partOfSpeech})
            </span>
          )}
        </td>
        <td className="hidden px-4 py-3 text-sm text-game-accent/70 md:table-cell">
          {word.exampleSentence || "Không có ví dụ"}
        </td>
        <td className="hidden px-4 py-3 text-sm text-game-accent/70 md:table-cell">
          <div className="flex flex-col gap-1">
            {word.imageUrl && (
              <a
                href={word.imageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                Xem hình ảnh
              </a>
            )}
            {word.videoUrl && (
              <a
                href={word.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                Xem video
              </a>
            )}
            {word.audioUrl && (
              <button
                onClick={() => onPlayAudio(word.audioUrl as string)}
                className="inline-flex items-center gap-1 text-blue-500 hover:underline"
              >
                <Volume2 className="h-4 w-4" />
              </button>
            )}
            {!word.imageUrl && !word.videoUrl && !word.audioUrl && "Không có"}
          </div>
        </td>
      </tr>
    );
  }
);
VocabularyWordRow.displayName = "VocabularyWordRow";

// Component chính được tối ưu hóa với React.memo
const PreviewVocabularyDialog = memo(
  ({ open, onOpenChange, course }: PreviewVocabularyDialogProps) => {
    const [previewWords, setPreviewWords] = useState<VocabularyWord[]>([]);
    const [isLoadingVocabulary, setIsLoadingVocabulary] = useState(false);
    const { isPlaying, currentUrl, play } = useAudio();
    const utils = trpc.useUtils();

    // Sử dụng useEffect với các dependency để tránh lặp lại các lệnh gọi API không cần thiết
    useEffect(() => {
      if (!open || !course) return;

      const fetchVocabulary = async () => {
        if (!course.categoryId) return;

        setIsLoadingVocabulary(true);
        try {
          const data = await utils.vocabularyWord.getAll.fetch({
            page: 1,
            limit: 100,
            categoryId: course.categoryId,
          });
          setPreviewWords(data?.results || []);
        } catch (error) {
          console.error("Lỗi khi lấy từ vựng:", error);
          setPreviewWords([]);
        } finally {
          setIsLoadingVocabulary(false);
        }
      };

      fetchVocabulary();
    }, [open, course, utils.vocabularyWord.getAll]);

    // Xử lý phát âm thanh
    const handlePlayAudio = (audioUrl: string) => {
      if (!audioUrl) return;
      play(audioUrl);
    };

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-xl">
              Từ vựng khóa học: {course?.categoryName}
            </DialogTitle>
            <p className="text-sm text-gray-500">
              Tổng số từ vựng: {course?.totalWords || 0} từ (Đã tải:{" "}
              {previewWords.length} từ)
            </p>
          </DialogHeader>

          <div className="max-h-[60vh] overflow-y-auto">
            {isLoadingVocabulary ? (
              <div className="flex justify-center py-10">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-game-primary border-t-transparent"></div>
              </div>
            ) : previewWords.length > 0 ? (
              <table className="w-full">
                <thead className="sticky top-0 bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-game-accent">
                      STT
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-game-accent">
                      Từ vựng
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-game-accent">
                      Nghĩa
                    </th>
                    <th className="hidden px-4 py-2 text-left text-sm font-medium text-game-accent md:table-cell">
                      Ví dụ
                    </th>
                    <th className="hidden px-4 py-2 text-left text-sm font-medium text-game-accent md:table-cell">
                      Media
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {previewWords.map((word, index) => (
                    <VocabularyWordRow
                      key={word.wordId}
                      word={word}
                      index={index}
                      onPlayAudio={handlePlayAudio}
                    />
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="flex flex-col items-center justify-center py-10">
                <p className="text-center text-gray-500">
                  Không có từ vựng nào trong khóa học này
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }
);

PreviewVocabularyDialog.displayName = "PreviewVocabularyDialog";
export default PreviewVocabularyDialog;
