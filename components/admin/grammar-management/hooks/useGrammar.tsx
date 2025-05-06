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

  const { data: categories = [], isLoading: isLoadingCategories } =
    trpc.category.getValidCategories.useQuery({
      isVocabularyCourse: false,
      status: "active",
    });

  console.log("Categories:", categories);
  console.log("Selected Category:", selectedCategory);

  let categoryId: number | undefined = undefined;

  if (selectedCategory !== "all") {
    try {
      categoryId = parseInt(selectedCategory);
      console.log("Category ID parsed:", categoryId);
    } catch (error) {
      console.error("Error parsing category ID:", error);
    }
  }

  const { data: grammarContents = [], isLoading } =
    trpc.grammarContent.getAll.useQuery(
      {
        limit,
        page,
        search: debouncedSearchTerm,
        categoryId: categoryId,
      },
      {
        enabled: !isLoadingCategories,
      }
    );

  console.log("Grammar Contents:", grammarContents);
  console.log("Search Term:", debouncedSearchTerm);

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
    isLoading: isLoading || isLoadingCategories,
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
