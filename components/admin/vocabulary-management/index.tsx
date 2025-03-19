"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";

import VocabularyTable from "./VocabularyTable";
import VocabularyFilters from "./VocabularyFilters";
import AddVocabularyDialog from "./AddVocabularyDialog";
import EditVocabularyDialog from "./EditVocabularyDialog";
import DeleteVocabularyDialog from "./DeleteVocabularyDialog";
import useVocabulary from "./hooks/useVocabulary";

export default function VocabularyManagement() {
	const {
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
		isOpenDeleteDialog,
		isOpenEditDialog,
		setCurrentDialog,
		isOpenAddDialog,
	} = useVocabulary();
	return (
		<div>
			<div className="flex justify-between items-center mb-6">
				<h2 className="text-2xl font-bold">Quản lý từ vựng</h2>
				<Button
					className="flex items-center gap-2 bg-game-primary hover:bg-game-primary/90"
					onClick={() => setCurrentDialog("add")}
				>
					<PlusCircle size={16} />
					Thêm từ vựng mới
				</Button>
			</div>

			<Card className="mb-6">
				<VocabularyFilters
					searchTerm={searchTerm}
					setSearchTerm={setSearchTerm}
					selectedCourse={selectedCourse}
					setSelectedCourse={setSelectedCourse}
					courses={courses}
				/>
			</Card>

			<VocabularyTable
				vocabulary={vocabulary as never}
				isLoading={isLoading}
				openEditDialog={openEditDialog}
				openDeleteDialog={openDeleteDialog}
				playAudio={playAudio}
				page={page}
				setPage={setPage}
				limit={limit}
			/>

			{/* Dialogs */}
			<AddVocabularyDialog
				isOpen={isOpenAddDialog}
				setIsOpen={(isOpen) => setCurrentDialog(isOpen ? "add" : null)}
				courses={courses}
			/>

			<EditVocabularyDialog
				isOpen={isOpenEditDialog}
				setIsOpen={(isOpen) => setCurrentDialog(isOpen ? "edit" : null)}
				currentWord={currentWord}
				courses={courses}
			/>

			<DeleteVocabularyDialog
				isOpen={isOpenDeleteDialog}
				setIsOpen={(isOpen) =>
					setCurrentDialog(isOpen ? "delete" : null)
				}
				currentWord={currentWord}
			/>
		</div>
	);
}
