import { useState, useEffect, memo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { trpc } from "@/trpc/client";

// Định nghĩa kiểu dữ liệu cho grammar
interface GrammarContent {
  id?: number;
  contentId?: number; // API trả về contentId thay vì id
  title: string;
  explanation: string;
  examples?: string | null;
  notes?: string | null;
  categoryId: number;
  [key: string]: any;
}

// Định nghĩa kiểu dữ liệu cho Course
interface GrammarCourse {
  categoryId: number;
  categoryName: string;
  description?: string | null;
  totalGrammar: number;
  [key: string]: any;
}

// Định nghĩa kiểu cho props của GrammarContentItem
interface GrammarContentItemProps {
  grammar: GrammarContent;
}

// Định nghĩa kiểu cho props của PreviewGrammarDialog
interface PreviewGrammarDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course: GrammarCourse | null;
  grammarCounts?: Record<number, number>;
  onStartLearning: (courseId: number) => void;
}

// Component hiển thị nội dung grammar được tối ưu với React.memo
const GrammarContentItem = memo(({ grammar }: GrammarContentItemProps) => {
  return (
    <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
      <div className="mb-1 font-medium text-game-accent">{grammar.title}</div>
      <p className="text-sm text-gray-600 line-clamp-2">
        {grammar.explanation}
      </p>
    </div>
  );
});

GrammarContentItem.displayName = "GrammarContentItem";

// Component chính GrammarPreviewDialog
const PreviewGrammarDialog = memo(
  ({
    open,
    onOpenChange,
    course,
    grammarCounts,
    onStartLearning,
  }: PreviewGrammarDialogProps) => {
    const [previewGrammars, setPreviewGrammars] = useState<GrammarContent[]>(
      []
    );
    const [isLoadingGrammar, setIsLoadingGrammar] = useState(false);
    const utils = trpc.useUtils();

    // Fetch grammar contents khi dialog mở và có course
    useEffect(() => {
      if (!open || !course) return;

      const fetchGrammar = async () => {
        if (!course.categoryId) return;

        setIsLoadingGrammar(true);
        try {
          const data = await utils.grammarContent.getAll.fetch({
            page: 1,
            limit: 100,
            categoryId: course.categoryId,
          });
          setPreviewGrammars(data || []);
        } catch (error) {
          console.error("Lỗi khi lấy ngữ pháp:", error);
          setPreviewGrammars([]);
        } finally {
          setIsLoadingGrammar(false);
        }
      };

      fetchGrammar();
    }, [open, course, utils.grammarContent.getAll]);

    // Xử lý bắt đầu học
    const handleStartLearning = () => {
      if (course?.categoryId) {
        onStartLearning(course.categoryId);
        onOpenChange(false);
      }
    };

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-xl text-game-accent">
              {course?.categoryName || "Xem trước khóa học"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <h3 className="mb-1 font-medium text-game-primary">Mô tả</h3>
              <p>{course?.description || "Không có mô tả"}</p>
            </div>

            <div>
              <h3 className="mb-1 font-medium text-game-primary">
                Số lượng điểm ngữ pháp
              </h3>
              <p>
                {grammarCounts && course?.categoryId
                  ? grammarCounts[course.categoryId]
                  : course?.totalGrammar || 0}{" "}
                điểm ngữ pháp
              </p>
            </div>

            <div>
              <h3 className="mb-3 font-medium text-game-primary">
                Nội dung ngữ pháp
              </h3>
              {isLoadingGrammar ? (
                <div className="flex justify-center py-4">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-game-primary border-t-transparent"></div>
                </div>
              ) : previewGrammars.length > 0 ? (
                <div className="max-h-[300px] space-y-2 overflow-y-auto pr-2">
                  {previewGrammars.slice(0, 5).map((grammar) => (
                    <GrammarContentItem key={grammar.id} grammar={grammar} />
                  ))}
                  {previewGrammars.length > 5 && (
                    <div className="mt-2 text-center text-sm text-gray-500">
                      Và {previewGrammars.length - 5} điểm ngữ pháp khác
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 text-center text-gray-500">
                  Không có dữ liệu ngữ pháp
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="mt-4 flex items-center justify-between gap-2 sm:justify-between">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Đóng
            </Button>
            <Button className="game-button" onClick={handleStartLearning}>
              Bắt đầu học
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }
);

PreviewGrammarDialog.displayName = "PreviewGrammarDialog";
export default PreviewGrammarDialog;
