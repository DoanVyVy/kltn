import { useState } from "react";
import { trpc } from "@/trpc/client";
import useSearchDebounce from "@/hooks/useSearchDebounce";
import { GrammarContentListElement } from "@/routers/grammar_content.route";

export default function useGrammar() {
  const {
    setValue: setSearchTerm,
    value: searchTerm,
    debouncedValue: debouncedSearchTerm,
  } = useSearchDebounce({ delay: 1000 });

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [currentContent, setCurrentContent] =
    useState<GrammarContentListElement | null>(null);
  const [page, setPage] = useState(1);
  const [dialog, setDialog] = useState<"edit" | "delete" | "add" | null>(null);
  const limit = 10;

  const { data: grammarContents = [], isLoading } =
    trpc.grammarContent.getAll.useQuery({
      limit,
      page,
      search: debouncedSearchTerm,
      categoryId:
        selectedCategory !== "all" ? parseInt(selectedCategory) : undefined,
    });

  const { data: categories = [], isLoading: isLoadingCategories } =
    trpc.category.getValidCategories.useQuery({
      isVocabularyCourse: false,
      status: "active",
    });

  const openEditDialog = (content: GrammarContentListElement) => {
    setCurrentContent(content);
    setDialog("edit");
  };

  const openDeleteDialog = (content: GrammarContentListElement) => {
    setCurrentContent(content);
    setDialog("delete");
  };

  return {
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
    setCurrentContent,
    openEditDialog,
    openDeleteDialog,
    isOpenEditDialog: dialog === "edit",
    isOpenDeleteDialog: dialog === "delete",
    isOpenAddDialog: dialog === "add",
    setCurrentDialog: setDialog,
  };
}
