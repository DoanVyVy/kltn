import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { trpc } from "@/trpc/client";
import { toast } from "@/components/ui/use-toast";
import GrammarForm from "./GrammarForm";
import {
  GrammarTopicListElement,
  GrammarContentWithTopic,
} from "@/types/client-schema";
import { z } from "zod";

// Định nghĩa schema form ở client thay vì import từ router
const grammarContentFormSchema = z.object({
  title: z.string().min(1, "Tiêu đề là bắt buộc"),
  categoryId: z.number(),
  explanation: z.string().min(1, "Giải thích là bắt buộc"),
  examples: z.string().optional(),
  notes: z.string().optional(),
  orderIndex: z.number().optional(),
});

interface EditGrammarDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  currentContent: any;
  categories: any[];
}

type FormData = z.infer<typeof grammarContentFormSchema> & {
  contentId?: number;
};

export default function EditGrammarDialog({
  isOpen,
  setIsOpen,
  currentContent,
  categories,
}: EditGrammarDialogProps) {
  const utils = trpc.useContext();

  const { mutate, isPending } = trpc.grammarContent.update.useMutation({
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Cập nhật nội dung ngữ pháp thành công",
        variant: "default",
      });
      utils.grammarContent.getAll.invalidate();
      setIsOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Lỗi",
        description:
          error.message || "Có lỗi xảy ra khi cập nhật nội dung ngữ pháp",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: FormData) => {
    if (!currentContent) return;

    mutate({
      contentId: currentContent.contentId,
      title: data.title,
      categoryId: data.categoryId,
      explanation: data.explanation,
      examples: data.examples,
      notes: data.notes,
      orderIndex: data.orderIndex,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa nội dung ngữ pháp</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin cho nội dung ngữ pháp
          </DialogDescription>
        </DialogHeader>
        {currentContent && (
          <GrammarForm
            categories={categories}
            initialData={currentContent}
            onSubmit={handleSubmit}
            isSubmitting={isPending}
            onClose={() => setIsOpen(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
