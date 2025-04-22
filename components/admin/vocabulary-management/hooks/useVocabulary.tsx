import { useState } from "react";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";
import { VocabularyWord } from "@prisma/client";

export default function useVocabulary() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [currentVocabulary, setCurrentVocabulary] =
    useState<VocabularyWord | null>(null);
  const [currentDialog, setCurrentDialog] = useState<
    "add" | "edit" | "delete" | "import" | null
  >(null);

  // Fetch categories
  const { data: categories } = trpc.category.getValidCategories.useQuery({
    isVocabularyCourse: true,
    status: "active",
  });

  // Fetch vocabularies
  const {
    data: vocabularies,
    isLoading,
    refetch,
  } = trpc.vocabularyWord.getAll.useQuery({
    page,
    limit,
    search: searchTerm || undefined,
    categoryId:
      selectedCategory !== "all" ? parseInt(selectedCategory) : undefined,
  });

  const openEditDialog = (vocabulary: VocabularyWord) => {
    setCurrentVocabulary(vocabulary);
    setCurrentDialog("edit");
  };

  const openDeleteDialog = (vocabulary: VocabularyWord) => {
    setCurrentVocabulary(vocabulary);
    setCurrentDialog("delete");
  };

  const refreshData = () => {
    refetch();
    setCurrentDialog(null);
  };

  return {
    vocabularies: vocabularies || [],
    isLoading,
    currentVocabulary,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    categories: categories || [],
    page,
    setPage,
    limit,
    openEditDialog,
    openDeleteDialog,
    isOpenEditDialog: currentDialog === "edit",
    isOpenDeleteDialog: currentDialog === "delete",
    isOpenAddDialog: currentDialog === "add",
    isOpenImportDialog: currentDialog === "import",
    setCurrentDialog,
    refreshData,
  };
}
