import { useState } from "react";
import { trpc } from "@/trpc/client";
import useSearchDebounce from "@/hooks/useSearchDebounce";
import { VocabularyWordListElement } from "@/routers/vocabulary_word.route";

export default function useVocabulary() {
	const {
		setValue: setSearchTerm,
		value: searchTerm,
		debouncedValue: debouncedSearchTerm,
	} = useSearchDebounce({ delay: 1000 });

	const [selectedCourse, setSelectedCourse] = useState<string>("all");
	const [currentWord, setCurrentWord] =
		useState<VocabularyWordListElement | null>(null);
	const [page, setPage] = useState(1);
	const [dialog, setDialog] = useState<"edit" | "delete" | "add" | null>(
		null
	);
	const limit = 10;

	const { data: vocabulary, isLoading } = trpc.vocabulary.getAll.useQuery({
		limit,
		page,
		search: debouncedSearchTerm,
		categoryId:
			selectedCourse !== "all" ? parseInt(selectedCourse) : undefined,
	});

	const { data: courses } =
		trpc.vocabularyCategory.getValidCategories.useQuery();

	const openEditDialog = (word: VocabularyWordListElement) => {
		setCurrentWord(word);
		setDialog("edit");
	};

	const openDeleteDialog = (word: VocabularyWordListElement) => {
		setCurrentWord(word);
		setDialog("delete");
	};

	const playAudio = (url: string) => {
		if (url) {
			const audio = new Audio(url);
			audio.play();
		}
	};

	return {
		vocabulary,
		isLoading,
		currentWord,
		searchTerm,
		setSearchTerm,
		selectedCourse,
		setSelectedCourse,
		courses,
		page,
		setPage,
		limit,
		setCurrentWord,
		openEditDialog,
		openDeleteDialog,
		playAudio,
		isOpenEditDialog: dialog === "edit",
		isOpenDeleteDialog: dialog === "delete",
		isOpenAddDialog: dialog === "add",
		setCurrentDialog: setDialog,
	};
}
