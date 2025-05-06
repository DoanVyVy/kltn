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
import { GrammarTopicListElement } from "@/types/client-schema";
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

interface AddGrammarDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  categories: any[];
}

type FormData = z.infer<typeof grammarContentFormSchema> & {
  contentId?: number;
};

export default function AddGrammarDialog({
  isOpen,
  setIsOpen,
  categories,
}: AddGrammarDialogProps) {
  const utils = trpc.useContext();

  const { mutate, isPending } = trpc.grammarContent.create.useMutation({
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Thêm nội dung ngữ pháp mới thành công",
        variant: "default",
      });
      utils.grammarContent.getAll.invalidate();
      setIsOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Lỗi",
        description:
          error.message || "Có lỗi xảy ra khi thêm nội dung ngữ pháp",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: FormData) => {
    mutate({
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
          <DialogTitle>Thêm nội dung ngữ pháp mới</DialogTitle>
          <DialogDescription>
            Điền thông tin chi tiết cho nội dung ngữ pháp mới
          </DialogDescription>
        </DialogHeader>
        <GrammarForm
          categories={categories}
          onSubmit={handleSubmit}
          isSubmitting={isPending}
          onClose={() => setIsOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
