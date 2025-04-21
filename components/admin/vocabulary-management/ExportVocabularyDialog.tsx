import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface ExportVocabularyDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  format: "json" | "csv";
  setFormat: (format: "json" | "csv") => void;
  onExport: () => void;
  isLoading: boolean;
  selectedCategory: string | undefined;
}

export default function ExportVocabularyDialog({
  isOpen,
  setIsOpen,
  format,
  setFormat,
  onExport,
  isLoading,
  selectedCategory,
}: ExportVocabularyDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Xuất từ vựng</DialogTitle>
          <DialogDescription>
            Chọn định dạng xuất và nhấn nút Xuất để tải xuống tệp từ vựng.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="category">Khóa học</Label>
            <div className="rounded-md border p-2">
              {selectedCategory || "Tất cả"}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="format">Định dạng</Label>
            <Select
              value={format}
              onValueChange={(value) => setFormat(value as "json" | "csv")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn định dạng" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="json">
                  JSON - Định dạng dữ liệu đầy đủ
                </SelectItem>
                <SelectItem value="csv">CSV - Định dạng bảng tính</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Hủy
          </Button>
          <Button onClick={onExport} disabled={isLoading}>
            {isLoading ? "Đang xuất..." : "Xuất"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
