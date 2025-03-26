import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { trpc } from "@/trpc/client";
import { toast } from "@/components/ui/use-toast";
import { GrammarContentWithTopic } from "@/types/client-schema";

interface DeleteGrammarDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  currentContent: any;
}

export default function DeleteGrammarDialog({
  isOpen,
  setIsOpen,
  currentContent,
}: DeleteGrammarDialogProps) {
  const utils = trpc.useContext();

  const { mutate, isPending } = trpc.grammarContent.delete.useMutation({
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Xóa nội dung ngữ pháp thành công",
        variant: "default",
      });
      utils.grammarContent.getAll.invalidate();
      setIsOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Lỗi",
        description: error.message || "Có lỗi xảy ra khi xóa nội dung ngữ pháp",
        variant: "destructive",
      });
    },
  });

  const handleDelete = () => {
    if (!currentContent) return;
    mutate(currentContent.contentId);
  };

  if (!currentContent) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Xóa nội dung ngữ pháp</DialogTitle>
          <DialogDescription>
            Bạn có chắc chắn muốn xóa nội dung ngữ pháp này? Hành động này không
            thể hoàn tác.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="space-y-2">
            <div className="font-medium">Tiêu đề:</div>
            <div className="text-sm">{currentContent.title}</div>
          </div>
          <div className="space-y-2 mt-4">
            <div className="font-medium">Khóa học:</div>
            <div className="text-sm">
              {currentContent.category?.categoryName || "Không có khóa học"}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isPending}
          >
            Hủy
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending}
          >
            {isPending ? "Đang xóa..." : "Xác nhận xóa"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
