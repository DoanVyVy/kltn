"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

// Form schema for pronunciation content
const pronunciationContentSchema = z.object({
  type: z.enum(["word", "sentence", "paragraph"], {
    required_error: "Vui lòng chọn loại nội dung",
  }),
  content: z.string().min(1, "Vui lòng nhập nội dung"),
  audioUrl: z.string().optional(),
  translation: z.string().optional(),
  difficulty: z.coerce.number().min(1).max(3),
  category: z.string().optional(),
  expReward: z.coerce.number().min(0).default(50),
  isActive: z.boolean().default(true),
});

type PronunciationContentFormValues = z.infer<
  typeof pronunciationContentSchema
>;

interface PronunciationContentFormProps {
  initialData?: PronunciationContentFormValues;
  onSubmit: (data: PronunciationContentFormValues) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export default function PronunciationContentForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: PronunciationContentFormProps) {
  const [localIsSubmitting, setLocalIsSubmitting] = useState(false);

  // Set up form
  const form = useForm<PronunciationContentFormValues>({
    resolver: zodResolver(pronunciationContentSchema),
    defaultValues: initialData || {
      type: "word",
      content: "",
      audioUrl: "",
      translation: "",
      difficulty: 1,
      category: "",
      expReward: 50,
      isActive: true,
    },
  });

  // Handle form submission
  const handleSubmitForm = async (values: PronunciationContentFormValues) => {
    try {
      setLocalIsSubmitting(true);
      onSubmit(values);
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Có lỗi xảy ra khi gửi form");
    } finally {
      setLocalIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmitForm)}
        className="space-y-6"
      >
        <div className="grid grid-cols-2 gap-4">
          {/* Type */}
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Loại nội dung</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isSubmitting || localIsSubmitting}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn loại nội dung" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="word">Từ</SelectItem>
                    <SelectItem value="sentence">Câu</SelectItem>
                    <SelectItem value="paragraph">Đoạn văn</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Difficulty */}
          <FormField
            control={form.control}
            name="difficulty"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Độ khó</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(parseInt(value))}
                  defaultValue={field.value.toString()}
                  disabled={isSubmitting || localIsSubmitting}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn độ khó" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="1">Dễ</SelectItem>
                    <SelectItem value="2">Trung bình</SelectItem>
                    <SelectItem value="3">Khó</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Content */}
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nội dung</FormLabel>
              <FormControl>
                {field.value && field.value.length > 100 ? (
                  <Textarea
                    {...field}
                    placeholder="Nhập nội dung phát âm"
                    disabled={isSubmitting || localIsSubmitting}
                    className="min-h-24"
                  />
                ) : (
                  <Input
                    {...field}
                    placeholder="Nhập nội dung phát âm"
                    disabled={isSubmitting || localIsSubmitting}
                  />
                )}
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Translation */}
        <FormField
          control={form.control}
          name="translation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bản dịch (tiếng Việt)</FormLabel>
              <FormControl>
                {form.watch("type") === "paragraph" ? (
                  <Textarea
                    {...field}
                    placeholder="Nhập bản dịch"
                    disabled={isSubmitting || localIsSubmitting}
                    className="min-h-20"
                  />
                ) : (
                  <Input
                    {...field}
                    placeholder="Nhập bản dịch"
                    disabled={isSubmitting || localIsSubmitting}
                  />
                )}
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          {/* Category */}
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Danh mục</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Nhập danh mục"
                    disabled={isSubmitting || localIsSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Audio URL */}
          <FormField
            control={form.control}
            name="audioUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL âm thanh</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Nhập URL âm thanh"
                    disabled={isSubmitting || localIsSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Experience Reward */}
          <FormField
            control={form.control}
            name="expReward"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Điểm kinh nghiệm</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    min={0}
                    placeholder="Nhập điểm kinh nghiệm"
                    disabled={isSubmitting || localIsSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Active Status */}
          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Trạng thái</FormLabel>
                <div className="flex items-center space-x-2 pt-2">
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isSubmitting || localIsSubmitting}
                    />
                  </FormControl>
                  <span>{field.value ? "Hoạt động" : "Không hoạt động"}</span>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting || localIsSubmitting}
          >
            Hủy
          </Button>
          <Button type="submit" disabled={isSubmitting || localIsSubmitting}>
            {initialData ? "Cập nhật" : "Tạo mới"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
