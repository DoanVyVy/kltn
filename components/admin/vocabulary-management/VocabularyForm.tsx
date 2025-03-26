import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CreateVocabularyInput,
  createVocabularySchema,
} from "@/schema/vocabulary";
import DefinitionFields from "./DefinitionFields";
import { useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";

interface VocabularyFormProps {
  onSubmit: (data: CreateVocabularyInput) => void;
  initialData?: any;
  courses: any[] | undefined;
  isSubmitting: boolean;
  buttonText: string;
}

export default function VocabularyForm({
  onSubmit,
  initialData,
  courses,
  isSubmitting,
  buttonText,
}: VocabularyFormProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<CreateVocabularyInput>({
    resolver: zodResolver(createVocabularySchema),
    defaultValues: {
      categoryId: 0,
      word: "",
      audioUrl: "",
      phonetic: "",
      difficultyLevel: 1,
      paronymWords: [],
      definitions: [
        {
          type: "noun",
          definition: "",
          example: "",
          translation: "",
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "definitions",
  });

  useEffect(() => {
    if (initialData) {
      reset({
        categoryId: initialData.categoryId || 0,
        word: initialData.word || "",
        audioUrl: initialData.audioUrl || "",
        phonetic: initialData.phonetic || initialData.pronunciation || "",
        difficultyLevel: initialData.difficultyLevel || 1,
        paronymWords: initialData.paronymWords || [],
        definitions:
          initialData.definitions && initialData.definitions.length
            ? initialData.definitions
            : [
                {
                  type: "noun",
                  definition: initialData.definition || "",
                  example: initialData.exampleSentence || "",
                  translation: "",
                },
              ],
      });
    }
  }, [initialData, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="word" className="text-right">
            Từ vựng
          </Label>
          <div className="col-span-3">
            <Input
              id="word"
              {...register("word")}
              className={errors.word ? "border-red-500" : ""}
            />
            {errors.word && (
              <p className="text-red-500 text-sm mt-1">{errors.word.message}</p>
            )}
          </div>
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="categoryId" className="text-right">
            Khóa học
          </Label>
          <div className="col-span-3">
            <Controller
              name="categoryId"
              control={control}
              render={({ field }) => (
                <select
                  id="categoryId"
                  value={field.value || ""}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                  className={`col-span-3 flex h-10 w-full rounded-md border ${
                    errors.categoryId ? "border-red-500" : "border-input"
                  } bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  <option value="">Chọn khóa học</option>
                  {courses?.map((course) => (
                    <option key={course.categoryId} value={course.categoryId}>
                      {course.difficultyLevel} - {course.categoryName}
                    </option>
                  ))}
                </select>
              )}
            />
            {errors.categoryId && (
              <p className="text-red-500 text-sm mt-1">
                {errors.categoryId.message}
              </p>
            )}
          </div>
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="phonetic" className="text-right">
            Phiên âm
          </Label>
          <div className="col-span-3">
            <Input
              id="phonetic"
              {...register("phonetic")}
              className={errors.phonetic ? "border-red-500" : ""}
              placeholder="/ˈfəʊnɛtɪk/"
            />
            {errors.phonetic && (
              <p className="text-red-500 text-sm mt-1">
                {errors.phonetic.message}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Nhập phiên âm quốc tế, ví dụ: /ˈhɛləʊ/ cho từ "hello"
            </p>
          </div>
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="audioUrl" className="text-right">
            URL âm thanh
          </Label>
          <div className="col-span-3">
            <Input
              id="audioUrl"
              {...register("audioUrl")}
              className={errors.audioUrl ? "border-red-500" : ""}
              placeholder="https://example.com/audio.mp3"
            />
            {errors.audioUrl && (
              <p className="text-red-500 text-sm mt-1">
                {errors.audioUrl.message}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Nhập đường dẫn đến file âm thanh phát âm từ vựng (MP3, WAV)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="difficultyLevel" className="text-right">
            Cấp độ khó
          </Label>
          <div className="col-span-3">
            <Controller
              name="difficultyLevel"
              control={control}
              render={({ field }) => (
                <select
                  id="difficultyLevel"
                  value={field.value || 1}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                  className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="1">1 - Cơ bản</option>
                  <option value="2">2 - Dễ</option>
                  <option value="3">3 - Trung bình</option>
                  <option value="4">4 - Khó</option>
                  <option value="5">5 - Nâng cao</option>
                </select>
              )}
            />
            <p className="text-xs text-gray-500 mt-1">
              Mức độ khó sẽ ảnh hưởng đến thứ tự hiển thị và tần suất ôn tập
            </p>
          </div>
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="paronymWords" className="text-right">
            Từ đồng dạng
          </Label>
          <div className="col-span-3">
            <Controller
              name="paronymWords"
              control={control}
              render={({ field }) => (
                <Textarea
                  id="paronymWords"
                  value={field.value?.join(", ") || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    field.onChange(
                      value
                        .split(",")
                        .map((word) => word.trim())
                        .filter((word) => word !== "")
                    );
                  }}
                  placeholder="Nhập các từ đồng dạng, cách nhau bởi dấu phẩy"
                  className="min-h-20"
                />
              )}
            />
            <p className="text-xs text-gray-500 mt-1">
              Nhập các từ đồng dạng, cách nhau bởi dấu phẩy
            </p>
          </div>
        </div>

        <div className="border-t pt-4 mt-2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Định nghĩa</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                append({
                  type: "noun",
                  definition: "",
                  example: "",
                  translation: "",
                })
              }
            >
              Thêm định nghĩa
            </Button>
          </div>

          {fields.map((field, index) => (
            <DefinitionFields
              key={field.id}
              index={index}
              fields={fields}
              register={register}
              errors={errors}
              remove={remove}
            />
          ))}
        </div>
      </div>
      <div className="flex justify-end space-x-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={() => reset()}>
          Hủy
        </Button>
        <Button
          type="submit"
          className="bg-game-primary hover:bg-game-primary/90"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Đang xử lý..." : buttonText}
        </Button>
      </div>
    </form>
  );
}
