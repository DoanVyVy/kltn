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
import { VocabularyWord } from "@prisma/client";

interface DeleteVocabularyDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  currentVocabulary: VocabularyWord;
  onSuccess: () => void;
}

export default function DeleteVocabularyDialog({
  isOpen,
  setIsOpen,
  currentVocabulary,
  onSuccess,
}: DeleteVocabularyDialogProps) {
  const utils = trpc.useUtils();

  const { mutateAsync: deleteAsync, isPending: isDeleting } =
    trpc.vocabulary.delete.useMutation({
      onSuccess: () => {
        toast({
          title: "Thành công",
          description: "Đã xóa từ vựng",
        });
        utils.vocabularyWord.getAll.invalidate();
        setIsOpen(false);
        onSuccess();
      },
      onError: (error) => {
        toast({
          title: "Lỗi",
          description: error.message || "Không thể xóa từ vựng",
          variant: "destructive",
        });
      },
    });

  const handleDelete = () => {
    deleteAsync(currentVocabulary.wordId);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Xóa từ vựng</DialogTitle>
          <DialogDescription>
            Bạn có chắc chắn muốn xóa từ vựng "{currentVocabulary.word}"? Hành
            động này không thể hoàn tác.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isDeleting}
          >
            Hủy
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Đang xóa..." : "Xóa"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
