"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, FileUp, FileDown } from "lucide-react";
import VocabularyTable from "./VocabularyTable";
import VocabularyFilters from "./VocabularyFilters";
import AddVocabularyDialog from "./AddVocabularyDialog";
import EditVocabularyDialog from "./EditVocabularyDialog";
import DeleteVocabularyDialog from "./DeleteVocabularyDialog";
import ImportVocabularyDialog from "./ImportVocabularyDialog";
import ExportVocabularyDialog from "./ExportVocabularyDialog";
import useVocabulary from "./hooks/useVocabulary";
import { useState } from "react";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";

export default function VocabularyManagement() {
  const {
    vocabularies,
    isLoading,
    currentVocabulary,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    categories,
    page,
    setPage,
    limit,
    openEditDialog,
    openDeleteDialog,
    isOpenEditDialog,
    isOpenDeleteDialog,
    isOpenAddDialog,
    isOpenImportDialog,
    setCurrentDialog,
    refreshData,
  } = useVocabulary();

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);
  const [isOpenExportDialog, setIsOpenExportDialog] = useState(false);
  const [exportFormat, setExportFormat] = useState<"json" | "csv">("json");

  const handlePlayAudio = (url: string) => {
    if (url) {
      if (currentUrl === url && isPlaying) {
        setIsPlaying(false);
        setCurrentUrl(null);
      } else {
        setIsPlaying(true);
        setCurrentUrl(url);
        const audio = new Audio(url);
        audio.onended = () => {
          setIsPlaying(false);
          setCurrentUrl(null);
        };
        audio.play();
      }
    }
  };

  const exportMutation = trpc.vocabulary.export.useMutation({
    onSuccess: (data) => {
      // Tạo file và tải xuống
      let blob;
      let contentType;

      if (data.format === "csv") {
        blob = new Blob([data.data], { type: "text/csv;charset=utf-8;" });
        contentType = "text/csv";
      } else {
        // JSON
        blob = new Blob([JSON.stringify(data.data, null, 2)], {
          type: "application/json",
        });
        contentType = "application/json";
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = data.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Xuất từ vựng thành công");
      setIsOpenExportDialog(false);
    },
    onError: (error) => {
      toast.error(`Lỗi khi xuất từ vựng: ${error.message}`);
    },
  });

  const handleExport = async () => {
    try {
      const result = await exportMutation.mutateAsync({
        categoryId: selectedCategory ? parseInt(selectedCategory) : undefined,
        format: "json",
        allCategories: !selectedCategory,
      });

      const blob = new Blob([result], { type: "application/json" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `vocabulary-${
        selectedCategory
          ? categories.find((c) => c.categoryId === parseInt(selectedCategory))
              ?.categoryName
          : "all"
      }.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Có lỗi xảy ra khi export");
    }
  };

  const confirmExport = () => {
    exportMutation.mutate({
      categoryId:
        selectedCategory !== "all" ? parseInt(selectedCategory) : undefined,
      format: exportFormat,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Quản lý từ vựng</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentDialog("import")}
            className="game-button"
          >
            <FileUp className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button
            variant="outline"
            onClick={handleExport}
            className="game-button"
            disabled={exportMutation.isLoading}
          >
            <FileDown className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button
            className="game-button"
            onClick={() => setCurrentDialog("add")}
          >
            <Plus className="mr-2 h-4 w-4" />
            Thêm từ vựng mới
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between p-4">
          <CardTitle className="text-xl">Danh sách từ vựng</CardTitle>
        </CardHeader>

        <VocabularyFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          categories={categories}
        />

        <VocabularyTable
          vocabularies={vocabularies}
          isLoading={isLoading}
          onEdit={openEditDialog}
          onDelete={openDeleteDialog}
          onPlayAudio={handlePlayAudio}
          isPlaying={isPlaying}
          currentUrl={currentUrl}
        />

        {/* Phân trang đơn giản */}
        <div className="flex items-center justify-end p-4 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
          >
            Trang trước
          </Button>
          <span className="mx-2">Trang {page}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((prev) => prev + 1)}
            disabled={vocabularies.length < limit}
          >
            Trang tiếp
          </Button>
        </div>
      </Card>

      {/* Dialog components */}
      <AddVocabularyDialog
        isOpen={isOpenAddDialog}
        setIsOpen={(isOpen) => setCurrentDialog(isOpen ? "add" : null)}
        categories={categories}
        onSuccess={refreshData}
      />

      <ImportVocabularyDialog
        isOpen={isOpenImportDialog}
        setIsOpen={(isOpen) => setCurrentDialog(isOpen ? "import" : null)}
        categories={categories}
        onImportSuccess={refreshData}
      />

      {currentVocabulary && (
        <>
          <EditVocabularyDialog
            isOpen={isOpenEditDialog}
            setIsOpen={(isOpen) => setCurrentDialog(isOpen ? "edit" : null)}
            currentVocabulary={currentVocabulary}
            categories={categories}
            onSuccess={refreshData}
          />

          <DeleteVocabularyDialog
            isOpen={isOpenDeleteDialog}
            setIsOpen={(isOpen) => setCurrentDialog(isOpen ? "delete" : null)}
            currentVocabulary={currentVocabulary}
            onSuccess={refreshData}
          />
        </>
      )}

      {/* Export Dialog */}
      <ExportVocabularyDialog
        isOpen={isOpenExportDialog}
        setIsOpen={setIsOpenExportDialog}
        format={exportFormat}
        setFormat={setExportFormat}
        onExport={confirmExport}
        isLoading={exportMutation.isLoading}
        selectedCategory={
          selectedCategory !== "all"
            ? categories.find(
                (c) => c.categoryId.toString() === selectedCategory
              )?.categoryName
            : "Tất cả"
        }
      />
    </div>
  );
}
