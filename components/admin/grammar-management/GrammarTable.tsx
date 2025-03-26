import {
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
  Table,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash } from "lucide-react";
import { GrammarContentListElement } from "@/routers/grammar_content.route";

interface GrammarTableProps {
  data: GrammarContentListElement[] | undefined;
  isLoading: boolean;
  onEdit: (content: GrammarContentListElement) => void;
  onDelete: (content: GrammarContentListElement) => void;
}

export default function GrammarTable({
  data,
  isLoading,
  onEdit,
  onDelete,
}: GrammarTableProps) {
  // Hiển thị trạng thái loading
  if (isLoading) {
    return (
      <div className="flex h-[200px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-game-primary border-t-transparent"></div>
      </div>
    );
  }

  // Hiển thị khi không có dữ liệu
  if (!data || data.length === 0) {
    return (
      <div className="flex h-[200px] flex-col items-center justify-center gap-2 text-center">
        <p className="text-lg font-medium">Không có nội dung ngữ pháp nào</p>
        <p className="text-sm text-muted-foreground">
          Thêm nội dung mới bằng cách nhấn nút Thêm mới ở trên.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">ID</TableHead>
            <TableHead className="w-[200px]">Tiêu đề</TableHead>
            <TableHead className="w-[200px]">Khóa học</TableHead>
            <TableHead className="min-w-[300px]">Giải thích</TableHead>
            <TableHead className="text-right w-[120px]">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((content) => (
            <TableRow key={content.contentId}>
              <TableCell className="font-medium">{content.contentId}</TableCell>
              <TableCell>{content.title}</TableCell>
              <TableCell>{content.category?.categoryName}</TableCell>
              <TableCell className="max-w-[300px] truncate">
                {content.explanation}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(content)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(content)}
                    className="text-destructive"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
