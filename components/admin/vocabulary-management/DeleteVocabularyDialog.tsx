import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { trpc } from "@/trpc/client";
import { toast } from "@/components/ui/use-toast";

interface DeleteVocabularyDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  currentWord: any;
}

export default function DeleteVocabularyDialog({
  isOpen,
  setIsOpen,
  currentWord,
}: DeleteVocabularyDialogProps) {
  const utils = trpc.useUtils();

  const { mutateAsync: deleteAsync, isPending: isDeleting } =
    trpc.vocabulary.delete.useMutation({
      onSuccess: () => {
        toast({
          title: "Thành công",
          description: "Đã xóa từ vựng",
        });
        utils.vocabulary.getAll.invalidate();
        setIsOpen(false);
      },
      onError: (error: any) => {
        toast({
          title: "Lỗi",
          description: error.message || "Không thể xóa từ vựng",
          variant: "destructive",
        });
      },
    } as any);

  const handleDeleteWord = () => {
    if (currentWord && currentWord.wordId) {
      deleteAsync(currentWord.wordId);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Xác nhận xóa</DialogTitle>
          <DialogDescription>
            Bạn có chắc chắn muốn xóa từ vựng "{currentWord?.word}"? Hành động
            này không thể hoàn tác.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Hủy
          </Button>
          <Button
            variant="destructive"
            onClick={handleDeleteWord}
            disabled={isDeleting}
          >
            {isDeleting ? "Đang xóa..." : "Xóa từ vựng"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
