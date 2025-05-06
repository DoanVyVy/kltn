"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, FileUp } from "lucide-react";
import GrammarTable from "./GrammarTable";
import GrammarFilters from "./GrammarFilters";
import AddGrammarDialog from "./AddGrammarDialog";
import EditGrammarDialog from "./EditGrammarDialog";
import DeleteGrammarDialog from "./DeleteGrammarDialog";
import ImportGrammarDialog from "./ImportGrammarDialog";
import useGrammar from "./hooks/useGrammar";
import { useState } from "react";

export default function GrammarManagement() {
  const {
    grammarContents,
    isLoading,
    currentContent,
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
    setCurrentDialog,
    refetchGrammar,
  } = useGrammar();

  // State for import dialog
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);

  // Handler for import success
  const handleImportSuccess = () => {
    refetchGrammar();
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Quản lý ngữ pháp</h2>
        <div className="flex gap-2">
          <Button
            className="flex items-center gap-2 game-button"
            onClick={() => setIsImportDialogOpen(true)}
          >
            <FileUp size={16} />
            Import
          </Button>
          <Button
            className="game-button"
            onClick={() => setCurrentDialog("add")}
          >
            <Plus className="mr-2 h-4 w-4" />
            Thêm ngữ pháp mới
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between p-4">
          <CardTitle className="text-xl">Danh sách ngữ pháp</CardTitle>
        </CardHeader>

        <GrammarFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          categories={categories}
        />

        <GrammarTable
          data={grammarContents}
          isLoading={isLoading}
          onEdit={openEditDialog}
          onDelete={openDeleteDialog}
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
            disabled={!grammarContents || grammarContents.length < limit}
          >
            Trang tiếp
          </Button>
        </div>
      </Card>

      {/* Dialog components */}
      <AddGrammarDialog
        isOpen={isOpenAddDialog}
        setIsOpen={(isOpen) => setCurrentDialog(isOpen ? "add" : null)}
        categories={categories || []}
      />

      {currentContent && (
        <>
          <EditGrammarDialog
            isOpen={isOpenEditDialog}
            setIsOpen={(isOpen) => setCurrentDialog(isOpen ? "edit" : null)}
            currentContent={currentContent}
            categories={categories || []}
          />

          <DeleteGrammarDialog
            isOpen={isOpenDeleteDialog}
            setIsOpen={(isOpen) => setCurrentDialog(isOpen ? "delete" : null)}
            currentContent={currentContent}
          />
        </>
      )}

      {/* Import Dialog */}
      <ImportGrammarDialog
        isOpen={isImportDialogOpen}
        setIsOpen={setIsImportDialogOpen}
        categories={categories || []}
        onImportSuccess={handleImportSuccess}
      />
    </div>
  );
}
