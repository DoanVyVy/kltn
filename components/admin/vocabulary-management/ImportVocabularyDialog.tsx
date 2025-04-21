import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { Category } from "@prisma/client";
import { trpc } from "@/trpc/client";
import { DialogFooter } from "@/components/ui/dialog";

interface ImportVocabularyDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  categories: Category[];
  onImportSuccess: () => void;
}

interface VocabularyData {
  word: string;
  pronunciation: string;
  part_of_speech: string;
  definition: string;
  example_sentence: string;
  audio_url?: string;
  image_url?: string;
  video_url?: string;
  difficulty_level?: string;
  paronym_words?: string;
  definitions?: string;
  category_id: string;
}

export default function ImportVocabularyDialog({
  isOpen,
  setIsOpen,
  categories,
  onImportSuccess,
}: ImportVocabularyDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const importMutation = trpc.vocabulary.import.useMutation({
    onSuccess: (data) => {
      if (data.count > 0) {
        toast.success(`Đã import thành công ${data.count} từ vựng`);
      } else {
        toast.error(
          "Không import được từ vựng nào. Vui lòng kiểm tra lại file dữ liệu của bạn."
        );
      }
      onImportSuccess();
      setIsOpen(false);
    },
    onError: (error) => {
      toast.error(error.message || "Có lỗi xảy ra khi import");
    },
  });

  const createVocabularyMutation = trpc.vocabulary.create.useMutation({
    onSuccess: () => {
      // Xử lý từng từ thành công
    },
    onError: (error) => {
      console.error("Create error:", error);
    },
  });

  const validateVocabularyData = (
    data: any,
    index: number
  ): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!data.word) {
      errors.push("Thiếu từ vựng");
    }
    if (!data.pronunciation) {
      errors.push("Thiếu cách phát âm");
    }
    if (!data.part_of_speech) {
      errors.push("Thiếu loại từ");
    }
    if (!data.definition) {
      errors.push("Thiếu định nghĩa");
    }
    if (!data.example_sentence) {
      errors.push("Thiếu ví dụ");
    }

    // Kiểm tra kiểu dữ liệu
    if (data.word && typeof data.word !== "string") {
      errors.push("Từ vựng phải là chuỗi");
    }
    if (data.pronunciation && typeof data.pronunciation !== "string") {
      errors.push("Cách phát âm phải là chuỗi");
    }
    if (data.part_of_speech && typeof data.part_of_speech !== "string") {
      errors.push("Loại từ phải là chuỗi");
    }
    if (data.definition && typeof data.definition !== "string") {
      errors.push("Định nghĩa phải là chuỗi");
    }
    if (data.example_sentence && typeof data.example_sentence !== "string") {
      errors.push("Ví dụ phải là chuỗi");
    }

    // Kiểm tra các trường tùy chọn
    if (data.audio_url && typeof data.audio_url !== "string") {
      errors.push("URL audio không hợp lệ");
    }
    if (data.image_url && typeof data.image_url !== "string") {
      errors.push("URL hình ảnh không hợp lệ");
    }
    if (data.video_url && typeof data.video_url !== "string") {
      errors.push("URL video không hợp lệ");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const fileExtension = selectedFile.name.split(".").pop()?.toLowerCase();
    if (fileExtension !== "csv") {
      setError("Vui lòng chọn file CSV hợp lệ");
      return;
    }

    setFile(selectedFile);
    setError(null);
  };

  // Hàm phân tích CSV với log detail
  const parseCSVLine = (line: string): string[] => {
    console.log("Đang phân tích dòng:", line.substring(0, 50) + "...");
    const values: string[] = [];
    let inQuotes = false;
    let currentValue = "";

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        inQuotes = !inQuotes;
        currentValue += char;
      } else if (char === "," && !inQuotes) {
        values.push(currentValue);
        currentValue = "";
      } else {
        currentValue += char;
      }
    }

    // Thêm giá trị cuối cùng
    values.push(currentValue);
    console.log("Kết quả phân tích:", values.length, "giá trị");

    return values;
  };

  // Hàm chuẩn hóa từ vựng để so sánh
  const normalizeWord = (word: string): string => {
    if (!word) return "";
    // Chuyển thành chữ thường và loại bỏ khoảng trắng đầu/cuối
    return word.toLowerCase().trim();
  };

  // Hàm xử lý import từ CSV
  const handleCSVImport = async (content: string) => {
    console.log("Đang xử lý file CSV...");
    const lines = content.split("\n");

    // Kiểm tra file có dữ liệu không
    if (lines.length <= 1) {
      setError("File CSV không có dữ liệu");
      setIsLoading(false);
      return;
    }

    const headerLine = lines[0];
    console.log("Header dòng gốc:", headerLine);

    const parsedHeaders = parseCSVLine(headerLine).map((header) =>
      header.trim().replace(/\r$/, "")
    );
    console.log("Headers sau khi phân tích và làm sạch:", parsedHeaders);

    // Kiểm tra các trường bắt buộc
    const requiredFields = [
      "word",
      "pronunciation",
      "part_of_speech",
      "definition",
      "example_sentence",
      "category_id",
    ];
    const missingFields = requiredFields.filter(
      (field) => !parsedHeaders.some((h) => h === field)
    );

    if (missingFields.length > 0) {
      setError(`File CSV thiếu các cột bắt buộc: ${missingFields.join(", ")}`);
      setIsLoading(false);
      return;
    }

    // Xử lý từng dòng CSV thành đối tượng
    let successCount = 0;
    let errorCount = 0;
    let duplicateCount = 0;
    const processed: { [key: string]: boolean } = {}; // Theo dõi từ vựng đã xử lý
    const promises: Promise<any>[] = []; // Mảng các promise để theo dõi tất cả các mutation

    // Bước 1: Phân tích dữ liệu CSV
    console.log(`Đang phân tích ${lines.length - 1} dòng dữ liệu...`);

    // Kiểm tra các từ vựng đã tồn tại
    const existingWords = new Set<string>();

    // Tiếp tục xử lý từng dòng CSV thành đối tượng
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue; // Bỏ qua dòng trống

      try {
        console.log(`Xử lý dòng ${i}:`, line.substring(0, 30) + "...");
        const values = parseCSVLine(line);
        const rowData: any = {};

        // Tạo object từ headers và values
        parsedHeaders.forEach((header, index) => {
          if (index < values.length) {
            let value = values[index].trim();
            // Loại bỏ dấu ngoặc kép nếu có
            if (value.startsWith('"') && value.endsWith('"')) {
              value = value.substring(1, value.length - 1);
            }
            rowData[header] = value;
          } else {
            rowData[header] = ""; // Giá trị mặc định cho trường thiếu
          }
        });

        console.log(
          "Dữ liệu dòng",
          i,
          ":",
          JSON.stringify(rowData).substring(0, 100) + "..."
        );

        // Kiểm tra dữ liệu hợp lệ
        if (
          !rowData.word ||
          !rowData.definition ||
          !rowData.part_of_speech ||
          !rowData.category_id
        ) {
          console.warn(`Dòng ${i}: Thiếu dữ liệu bắt buộc`, rowData);
          errorCount++;
          continue;
        }

        // Kiểm tra category_id có hợp lệ không
        const categoryId = Number(rowData.category_id);
        if (isNaN(categoryId)) {
          console.error(
            `Dòng ${i}: category_id không hợp lệ - "${rowData.category_id}"`
          );
          errorCount++;
          continue;
        }

        const categoryExists = categories.some(
          (category) => category.categoryId === categoryId
        );

        if (!categoryExists) {
          console.error(
            `Dòng ${i}: Không tìm thấy khóa học ID ${categoryId} cho từ "${rowData.word}"`
          );
          errorCount++;
          continue;
        }

        // Kiểm tra trùng lặp trong cùng file import
        const normalizedWord = normalizeWord(rowData.word);
        const key = `${normalizedWord}_${categoryId}`;

        // Nếu từ đã xuất hiện trước đó trong file, bỏ qua
        if (processed[key]) {
          console.warn(
            `Dòng ${i}: Từ vựng "${rowData.word}" (ID: ${categoryId}) đã xuất hiện trước đó trong file`
          );
          duplicateCount++;
          continue;
        }

        // Đánh dấu đã xử lý
        processed[key] = true;

        // Kiểm tra từ có tồn tại trong database chưa
        const checkExistPromise = new Promise<void>((resolve) => {
          // Gọi API kiểm tra từ vựng đã tồn tại
          const checkWordQuery = trpc.vocabulary.checkWordExists.useQuery({
            word: normalizedWord,
            categoryId: categoryId,
          });

          if (checkWordQuery.data?.exists) {
            console.log(
              `Từ vựng "${rowData.word}" đã tồn tại trong hệ thống, bỏ qua`
            );
            duplicateCount++;
            resolve();
            return;
          }

          // Tạo từ vựng mới
          try {
            // Tạo data để gửi lên server
            const vocabularyData = {
              word: rowData.word,
              phonetic: rowData.pronunciation,
              categoryId: categoryId,
              // Thêm definition ở cấp cao nhất (bắt buộc)
              definition: rowData.definition,
              // Định dạng đúng definitions (bắt buộc có translation)
              definitions: [
                {
                  type: rowData.part_of_speech,
                  definition: rowData.definition,
                  example: rowData.example_sentence,
                  translation: rowData.definition, // Translation bắt buộc phải có
                },
              ],
              audioUrl: rowData.audio_url || null,
              imageUrl: rowData.image_url || null,
              videoUrl: rowData.video_url || null,
              difficultyLevel: rowData.difficulty_level
                ? Number(rowData.difficulty_level)
                : 1,
              paronymWords: rowData.paronym_words
                ? rowData.paronym_words.includes("[")
                  ? JSON.parse(rowData.paronym_words.replace(/'/g, '"'))
                  : rowData.paronym_words
                      .split(",")
                      .map((w: string) => w.trim())
                : [],
            };

            console.log(`Dòng ${i}: Tạo từ vựng "${rowData.word}"`);

            // Tạo promise cho mỗi mutation và lưu vào mảng promises
            createVocabularyMutation.mutate(vocabularyData, {
              onSuccess: () => {
                console.log(`✓ Import từ "${rowData.word}" thành công`);
                successCount++;
                resolve();
              },
              onError: (err: any) => {
                console.error(
                  `✗ Lỗi import từ "${rowData.word}":`,
                  err.message || err
                );

                // Kiểm tra nếu lỗi là do trùng lặp
                if (
                  err.message &&
                  (err.message.includes("duplicate") ||
                    err.message.includes("Unique constraint") ||
                    err.message.includes("already exists") ||
                    err.message.toLowerCase().includes("trùng lặp"))
                ) {
                  console.warn(
                    `Từ vựng "${rowData.word}" (ID: ${categoryId}) đã tồn tại trong CSDL`
                  );
                  duplicateCount++;
                } else {
                  console.error(`Chi tiết lỗi:`, err);
                  errorCount++;
                }
                resolve(); // Vẫn resolve để tiếp tục xử lý
              },
            });
          } catch (createError: any) {
            console.error(
              `Lỗi khi tạo object từ vựng "${rowData.word}":`,
              createError
            );
            errorCount++;
            resolve();
          }
        });

        promises.push(checkExistPromise);
      } catch (parseError: any) {
        console.error(`Lỗi phân tích dòng ${i}:`, parseError);
        errorCount++;
      }
    }

    // Đợi tất cả các mutation hoàn thành
    try {
      console.log(`Đang chờ ${promises.length} từ vựng được xử lý...`);
      await Promise.all(promises);

      // Tạo báo cáo chi tiết
      const report = {
        total: successCount + errorCount + duplicateCount,
        success: successCount,
        duplicate: duplicateCount,
        error: errorCount,
      };
      console.log("Kết quả import:", report);

      // Thông báo kết quả
      if (successCount > 0) {
        toast.success(
          `Đã import thành công ${successCount}/${report.total} từ vựng`
        );
      }
      if (duplicateCount > 0) {
        toast.error(
          `Đã bỏ qua ${duplicateCount} từ vựng trùng lặp trong CSDL hoặc file`,
          { duration: 5000 }
        );
      }
      if (errorCount > 0) {
        toast.error(
          `Có ${errorCount} từ vựng không import được do lỗi dữ liệu`,
          { duration: 5000 }
        );
      }
      if (successCount === 0 && errorCount === 0 && duplicateCount === 0) {
        toast.error(
          "Không import được từ vựng nào. Vui lòng kiểm tra lại file dữ liệu của bạn.",
          { duration: 5000 }
        );
      }

      if (report.total > 0) {
        // Thêm thông báo tổng hợp
        setTimeout(() => {
          toast.success(
            `Kết quả: ${successCount} thành công, ${duplicateCount} trùng lặp, ${errorCount} lỗi`,
            { duration: 5000 }
          );
        }, 1000);
      }

      onImportSuccess();
      setIsOpen(false);
    } catch (promiseError) {
      console.error("Lỗi khi đợi các mutation hoàn thành:", promiseError);
      toast.error(
        "Có lỗi xảy ra trong quá trình import. Vui lòng kiểm tra console để biết chi tiết.",
        { duration: 5000 }
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = async () => {
    if (!file) {
      setError("Vui lòng chọn file");
      return;
    }

    setIsLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const content = e.target?.result as string;

        // In ra dữ liệu để debug
        console.log("Nội dung file:", content.substring(0, 200) + "...");

        await handleCSVImport(content);
      };
      reader.readAsText(file, "UTF-8"); // Chỉ định encoding UTF-8
    } catch (error: any) {
      console.error("Import error:", error);
      setError(`Có lỗi xảy ra khi đọc file: ${error.message || ""}`);
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          setIsLoading(false); // Reset loading khi đóng dialog
        }
        setIsOpen(open);
      }}
    >
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import từ vựng</DialogTitle>
          <DialogDescription>
            Import danh sách từ vựng từ file CSV
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>File</Label>
            <Input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="w-full text-sm"
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>

          <div className="rounded-lg bg-muted p-4 overflow-hidden">
            <h4 className="mb-2 font-medium">Hướng dẫn:</h4>
            <p className="text-sm text-muted-foreground break-words whitespace-normal overflow-wrap">
              File CSV cần có các cột: word, pronunciation, part_of_speech,
              definition, example_sentence, audio_url, image_url, video_url,
              difficulty_level, paronym_words, definitions, category_id
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isLoading}
          >
            Hủy
          </Button>
          <Button onClick={handleImport} disabled={isLoading}>
            {isLoading ? "Đang import..." : "Import"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
