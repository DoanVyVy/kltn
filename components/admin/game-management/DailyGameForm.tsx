"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Minus, Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { trpc } from "@/trpc/client";

// Form schemas for different game types
const baseSchema = z.object({
  activeDate: z.date({
    required_error: "Vui lòng chọn ngày hiển thị",
  }),
  difficulty: z.coerce.number().min(1).max(3),
  expReward: z.coerce.number().min(0).default(50),
});

const wordGuessSchema = baseSchema.extend({
  word: z.string().min(1, "Vui lòng nhập từ"),
  hint: z.string().optional(),
  definition: z.string().min(1, "Vui lòng nhập định nghĩa"),
  partOfSpeech: z.string().optional(),
  imageUrl: z.string().optional(),
  exampleSentence: z.string().optional(),
});

const sentenceScrambleSchema = baseSchema.extend({
  sentence: z.string().min(1, "Vui lòng nhập câu"),
  scrambledSentence: z.string().min(1, "Vui lòng nhập câu đã tách"),
  translation: z.string().optional(),
  hint: z.string().optional(),
});

const wordAssociationSchema = baseSchema.extend({
  sourceWord: z.string().min(1, "Vui lòng nhập từ gợi ý"),
  targetWords: z.array(z.string()).min(2, "Cần ít nhất 2 từ liên kết"),
  correctWord: z.string().min(1, "Vui lòng chọn từ đúng"),
  hint: z.string().optional(),
  explanation: z.string().optional(),
});

const idiomChallengeSchema = baseSchema.extend({
  idiom: z.string().min(1, "Vui lòng nhập thành ngữ"),
  meaning: z.string().min(1, "Vui lòng nhập ý nghĩa"),
  literalMeaning: z.string().optional(),
  exampleSentence: z.string().optional(),
  options: z.array(z.string()).min(2, "Cần ít nhất 2 tùy chọn"),
  correctOption: z.string().min(1, "Vui lòng chọn tùy chọn đúng"),
  hint: z.string().optional(),
});

const formSchemas = {
  wordGuess: wordGuessSchema,
  sentenceScramble: sentenceScrambleSchema,
  wordAssociation: wordAssociationSchema,
  idiomChallenge: idiomChallengeSchema,
};

interface DailyGameFormProps {
  gameType:
    | "wordGuess"
    | "sentenceScramble"
    | "wordAssociation"
    | "idiomChallenge";
  initialData?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export default function DailyGameForm({
  gameType,
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: DailyGameFormProps) {
  const [localIsSubmitting, setLocalIsSubmitting] = useState(false);
  const [targetWords, setTargetWords] = useState<string[]>(["", ""]);
  const [options, setOptions] = useState<string[]>(["", ""]);

  // Get appropriate schema based on gameType
  const schema = formSchemas[gameType];

  // Set up form
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: initialData || {
      activeDate: new Date(),
      difficulty: 1,
      expReward: 50,
      // Word Guess specific
      word: "",
      hint: "",
      definition: "",
      partOfSpeech: "",
      imageUrl: "",
      exampleSentence: "",
      // Sentence Scramble specific
      sentence: "",
      scrambledSentence: "",
      translation: "",
      // Word Association specific
      sourceWord: "",
      targetWords: ["", ""],
      correctWord: "",
      explanation: "",
      // Idiom Challenge specific
      idiom: "",
      meaning: "",
      literalMeaning: "",
      options: ["", ""],
      correctOption: "",
    },
  });

  // Initialize arrays from initial data if provided
  useEffect(() => {
    if (initialData) {
      if (gameType === "wordAssociation" && initialData.targetWords) {
        setTargetWords(initialData.targetWords);
      }
      if (gameType === "idiomChallenge" && initialData.options) {
        setOptions(initialData.options);
      }
    }
  }, [initialData, gameType]);

  // Handle form submission
  const handleSubmitForm = async (values: any) => {
    try {
      setLocalIsSubmitting(true);

      // Add array values to form data
      if (gameType === "wordAssociation") {
        values.targetWords = targetWords.filter(Boolean);
      }
      if (gameType === "idiomChallenge") {
        values.options = options.filter(Boolean);
      }

      onSubmit(values);
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Có lỗi xảy ra khi gửi form");
    } finally {
      setLocalIsSubmitting(false);
    }
  };

  // Target words management for Word Association
  const handleAddTargetWord = () => {
    setTargetWords([...targetWords, ""]);
  };

  const handleRemoveTargetWord = (index: number) => {
    if (targetWords.length > 2) {
      const newWords = [...targetWords];
      newWords.splice(index, 1);
      setTargetWords(newWords);
    }
  };

  const handleChangeTargetWord = (index: number, value: string) => {
    const newWords = [...targetWords];
    newWords[index] = value;
    setTargetWords(newWords);
  };

  // Options management for Idiom Challenge
  const handleAddOption = () => {
    setOptions([...options, ""]);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = [...options];
      newOptions.splice(index, 1);
      setOptions(newOptions);
    }
  };

  const handleChangeOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmitForm)}
        className="space-y-6"
      >
        <div className="max-h-[70vh] overflow-y-auto pr-2 space-y-4">
          {/* Common fields for all game types */}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="activeDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Ngày hiển thị</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "dd/MM/yyyy")
                          ) : (
                            <span>Chọn ngày</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="difficulty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Độ khó</FormLabel>
                  <Select
                    value={field.value.toString()}
                    onValueChange={(value) => field.onChange(parseInt(value))}
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

          <FormField
            control={form.control}
            name="expReward"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Điểm kinh nghiệm</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Nhập điểm thưởng"
                    {...field}
                    onChange={(e) =>
                      field.onChange(parseInt(e.target.value) || 0)
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Word Guess Specific Fields */}
          {gameType === "wordGuess" && (
            <>
              <FormField
                control={form.control}
                name="word"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Từ</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập từ cần đoán" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="definition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Định nghĩa</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Nhập định nghĩa của từ"
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hint"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gợi ý (không bắt buộc)</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập gợi ý" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="partOfSpeech"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Từ loại (không bắt buộc)</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn từ loại" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="noun">Danh từ</SelectItem>
                        <SelectItem value="verb">Động từ</SelectItem>
                        <SelectItem value="adjective">Tính từ</SelectItem>
                        <SelectItem value="adverb">Trạng từ</SelectItem>
                        <SelectItem value="preposition">Giới từ</SelectItem>
                        <SelectItem value="conjunction">Liên từ</SelectItem>
                        <SelectItem value="pronoun">Đại từ</SelectItem>
                        <SelectItem value="interjection">Thán từ</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="exampleSentence"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Câu ví dụ (không bắt buộc)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Nhập câu ví dụ"
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hình ảnh URL (không bắt buộc)</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập URL hình ảnh" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}

          {/* Sentence Scramble Specific Fields */}
          {gameType === "sentenceScramble" && (
            <>
              <FormField
                control={form.control}
                name="sentence"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Câu hoàn chỉnh</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Nhập câu hoàn chỉnh"
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="scrambledSentence"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Câu đã tách</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Nhập các từ đã tách, phân cách bằng dấu phẩy hoặc khoảng trắng"
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <p className="text-sm text-muted-foreground">
                      Nhập các từ đã tách, phân cách bằng dấu phẩy hoặc khoảng
                      trắng. Ví dụ: "I, am, learning, English"
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="translation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dịch nghĩa (không bắt buộc)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nhập dịch nghĩa tiếng Việt"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hint"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gợi ý (không bắt buộc)</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập gợi ý" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}

          {/* Word Association Specific Fields */}
          {gameType === "wordAssociation" && (
            <>
              <FormField
                control={form.control}
                name="sourceWord"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Từ gốc</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập từ gốc" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <FormLabel className="text-sm font-medium">
                    Danh sách từ liên kết
                  </FormLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddTargetWord}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Thêm từ
                  </Button>
                </div>

                {targetWords.map((word, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={word}
                      onChange={(e) =>
                        handleChangeTargetWord(index, e.target.value)
                      }
                      placeholder={`Từ liên kết ${index + 1}`}
                      className="flex-1"
                    />
                    {targetWords.length > 2 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveTargetWord(index)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <FormField
                control={form.control}
                name="correctWord"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Từ đúng</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn từ đúng" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {targetWords.filter(Boolean).map((word, index) => (
                          <SelectItem key={index} value={word}>
                            {word}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hint"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gợi ý (không bắt buộc)</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập gợi ý" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="explanation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Giải thích (không bắt buộc)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Giải thích mối liên hệ"
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}

          {/* Idiom Challenge Specific Fields */}
          {gameType === "idiomChallenge" && (
            <>
              <FormField
                control={form.control}
                name="idiom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thành ngữ</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập thành ngữ" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="meaning"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ý nghĩa</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Nhập ý nghĩa của thành ngữ"
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="literalMeaning"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nghĩa đen (không bắt buộc)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Nhập nghĩa đen của thành ngữ"
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="exampleSentence"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Câu ví dụ (không bắt buộc)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Nhập câu ví dụ"
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <FormLabel className="text-sm font-medium">
                    Danh sách tùy chọn
                  </FormLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddOption}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Thêm tùy chọn
                  </Button>
                </div>

                {options.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={option}
                      onChange={(e) =>
                        handleChangeOption(index, e.target.value)
                      }
                      placeholder={`Tùy chọn ${index + 1}`}
                      className="flex-1"
                    />
                    {options.length > 2 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveOption(index)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <FormField
                control={form.control}
                name="correctOption"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tùy chọn đúng</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn tùy chọn đúng" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {options.filter(Boolean).map((option, index) => (
                          <SelectItem key={index} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hint"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gợi ý (không bắt buộc)</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập gợi ý" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting || localIsSubmitting}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            className="bg-game-primary hover:bg-game-primary/90"
            disabled={isSubmitting || localIsSubmitting}
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
