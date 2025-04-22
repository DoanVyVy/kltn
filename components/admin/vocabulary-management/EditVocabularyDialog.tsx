import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CreateVocabularyInput } from "@/schema/vocabulary";
import { trpc } from "@/trpc/client";
import { toast } from "@/components/ui/use-toast";
import VocabularyForm from "./VocabularyForm";
import { Category, VocabularyWord } from "@prisma/client";

interface EditVocabularyDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  currentVocabulary: VocabularyWord;
  categories: Category[];
  onSuccess: () => void;
}

export default function EditVocabularyDialog({
  isOpen,
  setIsOpen,
  currentVocabulary,
  categories,
  onSuccess,
}: EditVocabularyDialogProps) {
  const utils = trpc.useUtils();
  const { mutateAsync: updateAsync, isPending: isUpdating } =
    trpc.vocabulary.update.useMutation({
      onSuccess: () => {
        toast({
          title: "Thành công",
          description: "Đã cập nhật từ vựng",
        });
        utils.vocabularyWord.getAll.invalidate();
        setIsOpen(false);
        onSuccess();
      },
      onError: (error) => {
        toast({
          title: "Lỗi",
          description: error.message || "Không thể cập nhật từ vựng",
          variant: "destructive",
        });
      },
    });

  // Handle update vocabulary
  const onSubmitUpdate = (data: CreateVocabularyInput) => {
    updateAsync({
      id: currentVocabulary.wordId,
      data,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Cập nhật từ vựng</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin chi tiết cho từ vựng
          </DialogDescription>
        </DialogHeader>
        <VocabularyForm
          onSubmit={onSubmitUpdate}
          categories={categories}
          isSubmitting={isUpdating}
          buttonText="Cập nhật"
          defaultValues={currentVocabulary}
        />
      </DialogContent>
    </Dialog>
  );
}
