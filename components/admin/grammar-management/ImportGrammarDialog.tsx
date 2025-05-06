import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { Category } from "@prisma/client";
import { trpc } from "@/trpc/client";

interface ImportGrammarDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  categories: Category[];
  onImportSuccess: () => void;
}

export default function ImportGrammarDialog({
  isOpen,
  setIsOpen,
  categories,
  onImportSuccess,
}: ImportGrammarDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Mutation to import grammar data
  const importMutation = trpc.grammarContent.import.useMutation({
    onSuccess: (data) => {
      if (data.count > 0) {
        toast.success(`Đã import thành công ${data.count} bài ngữ pháp`);
      } else {
        toast.error(
          "Không import được bài ngữ pháp nào. Vui lòng kiểm tra lại file dữ liệu của bạn."
        );
      }
      onImportSuccess();
      setIsOpen(false);
    },
    onError: (error) => {
      toast.error(error.message || "Có lỗi xảy ra khi import");
      setIsLoading(false);
    },
  });

  // Create grammar mutation for individual entries
  const createGrammarMutation = trpc.grammarContent.create.useMutation({
    onSuccess: () => {
      // Success for individual grammar item
    },
    onError: (error) => {
      console.error("Create error:", error);
    },
  });

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

  // Parse CSV line
  const parseCSVLine = (line: string): string[] => {
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

    // Add the final value
    values.push(currentValue);

    return values;
  };

  // Handle CSV import
  const handleCSVImport = async (content: string) => {
    console.log("Processing CSV file...");
    const lines = content.split("\n");

    // Check if file has data
    if (lines.length <= 1) {
      setError("File CSV không có dữ liệu");
      setIsLoading(false);
      return;
    }

    const headerLine = lines[0];
    const parsedHeaders = parseCSVLine(headerLine).map((header) =>
      header.trim().replace(/\r$/, "").replace(/"/g, "")
    );

    // Check required fields
    const requiredFields = [
      "title",
      "content",
      "explanation",
      "examples",
      "category_id",
    ];

    const missingFields = requiredFields.filter(
      (field) => !parsedHeaders.includes(field)
    );

    if (missingFields.length > 0) {
      setError(`File CSV thiếu các cột bắt buộc: ${missingFields.join(", ")}`);
      setIsLoading(false);
      return;
    }

    // Process each CSV line into objects
    let successCount = 0;
    let errorCount = 0;
    let duplicateCount = 0;
    const processed: { [key: string]: boolean } = {}; // Track processed grammar
    const promises: Promise<any>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue; // Skip empty lines

      try {
        const values = parseCSVLine(line);
        const rowData: any = {};

        // Create object from headers and values
        parsedHeaders.forEach((header, index) => {
          if (index < values.length) {
            let value = values[index].trim();
            // Remove quotes if they exist
            if (value.startsWith('"') && value.endsWith('"')) {
              value = value.substring(1, value.length - 1);
            }
            rowData[header] = value;
          } else {
            rowData[header] = ""; // Default value for missing fields
          }
        });

        // Validate data
        if (
          !rowData.title ||
          !rowData.content ||
          !rowData.explanation ||
          !rowData.examples ||
          !rowData.category_id
        ) {
          console.warn(`Row ${i}: Missing required data`, rowData);
          errorCount++;
          continue;
        }

        // Check if category_id is valid
        const categoryId = Number(rowData.category_id);
        if (isNaN(categoryId)) {
          console.error(
            `Row ${i}: Invalid category_id - "${rowData.category_id}"`
          );
          errorCount++;
          continue;
        }

        const categoryExists = categories.some(
          (category) => category.categoryId === categoryId
        );

        if (!categoryExists) {
          console.error(
            `Row ${i}: Category ID ${categoryId} not found for "${rowData.title}"`
          );
          errorCount++;
          continue;
        }

        // Check for duplicates in the same import file
        const key = `${rowData.title}_${categoryId}`;

        if (processed[key]) {
          console.warn(
            `Row ${i}: Grammar "${rowData.title}" (ID: ${categoryId}) already appeared in this file`
          );
          duplicateCount++;
          continue;
        }

        // Mark as processed
        processed[key] = true;

        const checkExistPromise = new Promise<void>((resolve) => {
          try {
            // Create data to send to server
            const grammarData = {
              title: rowData.title,
              content: rowData.content,
              explanation: rowData.explanation,
              examples: rowData.examples
                .split("|")
                .map((example: string) => example.trim()),
              categoryId: categoryId,
              difficulty: rowData.difficulty ? Number(rowData.difficulty) : 1,
              imageUrl: rowData.image_url || null,
              videoUrl: rowData.video_url || null,
            };

            console.log(`Row ${i}: Creating grammar "${rowData.title}"`);

            // Create mutation for each grammar entry
            createGrammarMutation.mutate(grammarData, {
              onSuccess: () => {
                successCount++;
                resolve();
              },
              onError: (err: any) => {
                console.error(
                  `Error importing "${rowData.title}":`,
                  err.message || err
                );

                // Check if error is due to duplication
                if (
                  err.message &&
                  (err.message.includes("duplicate") ||
                    err.message.includes("Unique constraint") ||
                    err.message.includes("already exists") ||
                    err.message.toLowerCase().includes("trùng lặp"))
                ) {
                  duplicateCount++;
                } else {
                  errorCount++;
                }
                resolve(); // Still resolve to continue processing
              },
            });
          } catch (createError: any) {
            console.error(
              `Error creating grammar object "${rowData.title}":`,
              createError
            );
            errorCount++;
            resolve();
          }
        });

        promises.push(checkExistPromise);
      } catch (parseError: any) {
        console.error(`Error parsing row ${i}:`, parseError);
        errorCount++;
      }
    }

    // Wait for all mutations to complete
    try {
      console.log(
        `Waiting for ${promises.length} grammar entries to be processed...`
      );
      await Promise.all(promises);

      // Create detailed report
      const report = {
        total: successCount + errorCount + duplicateCount,
        success: successCount,
        duplicate: duplicateCount,
        error: errorCount,
      };

      // Show results
      if (successCount > 0) {
        toast.success(
          `Đã import thành công ${successCount}/${report.total} bài ngữ pháp`
        );
      }
      if (duplicateCount > 0) {
        toast.error(`Đã bỏ qua ${duplicateCount} bài ngữ pháp trùng lặp`, {
          duration: 5000,
        });
      }
      if (errorCount > 0) {
        toast.error(
          `Có ${errorCount} bài ngữ pháp không import được do lỗi dữ liệu`,
          { duration: 5000 }
        );
      }

      if (report.total > 0) {
        // Add summary notification
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
      console.error("Error waiting for mutations to complete:", promiseError);
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
        await handleCSVImport(content);
      };
      reader.readAsText(file, "UTF-8"); // Specify UTF-8 encoding
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
          setIsLoading(false); // Reset loading when dialog closes
        }
        setIsOpen(open);
      }}
    >
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import ngữ pháp</DialogTitle>
          <DialogDescription>
            Import danh sách ngữ pháp từ file CSV
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
              File CSV cần có các cột: title, content, explanation, examples,
              category_id, difficulty (tùy chọn), image_url (tùy chọn),
              video_url (tùy chọn)
            </p>
            <p className="text-sm mt-2 text-muted-foreground">
              Các ví dụ ngữ pháp cần được phân tách bằng dấu | (ví dụ: "I am a
              student | She is a teacher")
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
