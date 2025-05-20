"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search, PlusCircle } from "lucide-react";
import { toast } from "sonner";

import PronunciationContentTable from "./PronunciationContentTable";
import PronunciationContentForm from "./PronunciationContentForm";
import { trpc } from "@/trpc/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function PronunciationContentManagement() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentContent, setCurrentContent] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");

  // Data fetching
  const {
    data: contentData,
    isLoading,
    refetch: refetchContents,
  } = trpc.pronunciation.getAllPronunciationContent.useQuery({
    page: 1,
    limit: 50,
    search: searchTerm,
    type: typeFilter !== "all" ? typeFilter : undefined,
    difficulty:
      difficultyFilter !== "all" ? parseInt(difficultyFilter) : undefined,
  });

  // Create mutation
  const createContentMutation =
    trpc.pronunciation.createPronunciationContent.useMutation({
      onSuccess: () => {
        refetchContents();
        setIsAddDialogOpen(false);
        toast.success("Nội dung phát âm đã được tạo thành công");
      },
      onError: (error) => {
        toast.error(`Lỗi khi tạo nội dung phát âm: ${error.message}`);
      },
    });

  // Update mutation
  const updateContentMutation =
    trpc.pronunciation.updatePronunciationContent.useMutation({
      onSuccess: () => {
        refetchContents();
        setIsEditDialogOpen(false);
        toast.success("Nội dung phát âm đã được cập nhật thành công");
      },
      onError: (error) => {
        toast.error(`Lỗi khi cập nhật nội dung phát âm: ${error.message}`);
      },
    });

  // Delete mutation
  const deleteContentMutation =
    trpc.pronunciation.deletePronunciationContent.useMutation({
      onSuccess: () => {
        refetchContents();
        setIsDeleteDialogOpen(false);
        toast.success("Nội dung phát âm đã được xóa thành công");
      },
      onError: (error) => {
        toast.error(`Lỗi khi xóa nội dung phát âm: ${error.message}`);
      },
    });

  const handleAdd = () => {
    setCurrentContent(null);
    setIsAddDialogOpen(true);
  };

  const handleEdit = (content: any) => {
    setCurrentContent(content);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (content: any) => {
    setCurrentContent(content);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmitAdd = (data: any) => {
    createContentMutation.mutate(data);
  };

  const handleSubmitEdit = (data: any) => {
    const payload = { id: currentContent.id, ...data };
    updateContentMutation.mutate(payload);
  };

  const handleConfirmDelete = () => {
    if (!currentContent) return;
    deleteContentMutation.mutate({ id: currentContent.id });
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Quản lý nội dung phát âm</h2>

        <div className="flex space-x-2">
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm nội dung..."
              className="pl-8"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Lọc theo loại" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả loại</SelectItem>
              <SelectItem value="word">Từ</SelectItem>
              <SelectItem value="sentence">Câu</SelectItem>
              <SelectItem value="paragraph">Đoạn văn</SelectItem>
            </SelectContent>
          </Select>
          <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Lọc theo độ khó" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả độ khó</SelectItem>
              <SelectItem value="1">Dễ</SelectItem>
              <SelectItem value="2">Trung bình</SelectItem>
              <SelectItem value="3">Khó</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleAdd}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Thêm mới
          </Button>
        </div>
      </div>

      <PronunciationContentTable
        contents={contentData?.items || []}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Thêm nội dung phát âm</DialogTitle>
            <DialogDescription>
              Điền thông tin để tạo nội dung phát âm mới
            </DialogDescription>
          </DialogHeader>

          <PronunciationContentForm
            onSubmit={handleSubmitAdd}
            onCancel={() => setIsAddDialogOpen(false)}
            isSubmitting={createContentMutation.isLoading}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Sửa nội dung phát âm</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin nội dung phát âm
            </DialogDescription>
          </DialogHeader>

          <PronunciationContentForm
            initialData={currentContent}
            onSubmit={handleSubmitEdit}
            onCancel={() => setIsEditDialogOpen(false)}
            isSubmitting={updateContentMutation.isLoading}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa nội dung phát âm này không? Hành động
              này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleteContentMutation.isLoading}
            >
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
