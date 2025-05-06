import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/trpc/client";
import { GrammarContentListElement } from "@/routers/grammar_content.route";
import { Category } from "@prisma/client";

// Định nghĩa schema
const formSchema = z.object({
  title: z.string().min(1, "Tiêu đề là bắt buộc"),
  categoryId: z.string().min(1, "Khóa học là bắt buộc"),
  explanation: z.string().min(1, "Giải thích là bắt buộc"),
  examples: z.string().optional(),
  notes: z.string().optional(),
  orderIndex: z.string().optional(),
  difficultyLevel: z.string().default("1"),
});

type FormValues = z.infer<typeof formSchema>;

interface GrammarFormProps {
  initialData?: GrammarContentListElement | null;
  onSubmit: (values: any) => void;
  isSubmitting?: boolean;
  categories: Category[] | undefined;
  onClose?: () => void;
}

export default function GrammarForm({
  initialData,
  onSubmit,
  isSubmitting = false,
  categories = [],
  onClose,
}: GrammarFormProps) {
  const [localIsSubmitting, setIsSubmitting] = useState(false);
  const utils = trpc.useUtils();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          title: initialData.title,
          categoryId: initialData.categoryId.toString(),
          explanation: initialData.explanation,
          examples: initialData.examples || "",
          notes: initialData.notes || "",
          orderIndex: initialData.orderIndex?.toString() || "",
          difficultyLevel: initialData.difficultyLevel?.toString() || "1",
        }
      : {
          title: "",
          categoryId: "",
          explanation: "",
          examples: "",
          notes: "",
          orderIndex: "",
          difficultyLevel: "1",
        },
  });

  const createMutation = trpc.grammarContent.create.useMutation({
    onSuccess: () => {
      toast.success("Thêm nội dung ngữ pháp thành công");
      utils.grammarContent.getAll.invalidate();
    },
    onError: (error) => {
      toast.error(`Lỗi: ${error.message}`);
      setIsSubmitting(false);
    },
  });

  const updateMutation = trpc.grammarContent.update.useMutation({
    onSuccess: () => {
      toast.success("Cập nhật nội dung ngữ pháp thành công");
      utils.grammarContent.getAll.invalidate();
    },
    onError: (error) => {
      toast.error(`Lỗi: ${error.message}`);
      setIsSubmitting(false);
    },
  });

  const handleSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      const formattedValues = {
        ...values,
        categoryId: parseInt(values.categoryId),
        orderIndex: values.orderIndex ? parseInt(values.orderIndex) : undefined,
        difficultyLevel: parseInt(values.difficultyLevel),
      };

      onSubmit(formattedValues);
    } catch (error) {
      console.error("Lỗi:", error);
      toast.error("Có lỗi xảy ra khi gửi form");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <div className="max-h-[70vh] overflow-y-auto pr-2 space-y-4 py-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tiêu đề</FormLabel>
                <FormControl>
                  <Input placeholder="Nhập tiêu đề" {...field} />
                </FormControl>
                <FormMessage />
                <p className="text-xs text-gray-500">
                  Tiêu đề nên ngắn gọn và mô tả chính xác nội dung ngữ pháp
                </p>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Khóa học</FormLabel>
                <FormControl>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={categories.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn khóa học" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem
                          key={category.categoryId}
                          value={category.categoryId.toString()}
                        >
                          {category.categoryName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
                <p className="text-xs text-gray-500">
                  Chọn khóa học ngữ pháp mà nội dung này thuộc về
                </p>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="difficultyLevel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cấp độ khó</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn cấp độ khó" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 - Cơ bản</SelectItem>
                      <SelectItem value="2">2 - Dễ</SelectItem>
                      <SelectItem value="3">3 - Trung bình</SelectItem>
                      <SelectItem value="4">4 - Khó</SelectItem>
                      <SelectItem value="5">5 - Nâng cao</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
                <p className="text-xs text-gray-500">
                  Đánh giá mức độ khó của nội dung ngữ pháp này, ảnh hưởng đến
                  thứ tự học
                </p>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="explanation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Giải thích</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Nhập giải thích"
                    className="min-h-32"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
                <p className="text-xs text-gray-500">
                  Giải thích chi tiết về quy tắc ngữ pháp, cách sử dụng và
                  trường hợp áp dụng
                </p>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="examples"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ví dụ</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Nhập ví dụ (không bắt buộc)"
                    className="min-h-24"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
                <p className="text-xs text-gray-500">
                  Mỗi ví dụ nên gồm câu ví dụ và phần dịch. Nhập mỗi ví dụ trên
                  một dòng mới.
                </p>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ghi chú</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Nhập ghi chú (không bắt buộc)"
                    className="min-h-20"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
                <p className="text-xs text-gray-500">
                  Các lưu ý, ngoại lệ, hoặc thông tin bổ sung về quy tắc ngữ
                  pháp này
                </p>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="orderIndex"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Thứ tự hiển thị</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Nhập thứ tự hiển thị"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
                <p className="text-xs text-gray-500">
                  Số thứ tự quyết định vị trí hiển thị, số thấp hơn sẽ hiển thị
                  trước
                </p>
              </FormItem>
            )}
          />
        </div>

        <div className="flex gap-2 justify-end pt-4 border-t mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onClose && onClose()}
            disabled={isSubmitting || localIsSubmitting}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || localIsSubmitting}
            className="bg-game-primary hover:bg-game-primary/90"
          >
            {isSubmitting || localIsSubmitting
              ? "Đang xử lý..."
              : initialData
              ? "Cập nhật"
              : "Thêm mới"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
