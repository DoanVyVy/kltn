"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";
import { trpc } from "@/trpc/client";
import useSearchDebounce from "@/hooks/useSearchDebounce";
import { VocabularyCategory } from "@prisma/client";

import CourseTable from "./components/course-table";
import SearchFilters from "./components/search-filters";
import AddCourseDialog from "./components/add-course-dialog";
import EditCourseDialog from "./components/edit-course-dialog";
import DeleteDialog from "./components/delete-dialog";

export default function CourseManagement() {
	const [statusFilter, setStatusFilter] = useState("all");
	const [page, setPage] = useState(1);
	const {
		setValue: setSearchTerm,
		value: searchTerm,
		debouncedValue: debouncedSearchTerm,
	} = useSearchDebounce({ delay: 1000 });

	const [currentDialog, setCurrentDialog] = useState<
		"add" | "edit" | "delete" | null
	>(null);

	const [currentCourse, setCurrentCourse] =
		useState<VocabularyCategory | null>(null);

	const utils = trpc.useUtils();

	// Query courses data
	const { data: courses } =
		trpc.vocabularyCategory.getValidCategories.useQuery({
			limit: 10,
			page: page,
			search: debouncedSearchTerm,
			status: statusFilter === "all" ? undefined : statusFilter,
		});

	// Mutation hooks
	const { mutateAsync: createAsync, isPending: isCreating } =
		trpc.vocabularyCategory.create.useMutation({
			onSuccess: () => {
				utils.vocabularyCategory.getValidCategories.invalidate();
				setCurrentDialog(null);
			},
			onError: (error) => {
				console.error(error);
			},
		});

	const { mutateAsync: editAsync, isPending: isEditing } =
		trpc.vocabularyCategory.update.useMutation({
			onSuccess: () => {
				utils.vocabularyCategory.getValidCategories.invalidate();
				setCurrentDialog(null);
			},
			onError: (error) => {
				console.error(error);
			},
		});

	const { mutateAsync: deleteAsync, isPending: isDeleting } =
		trpc.vocabularyCategory.delete.useMutation({
			onSuccess: () => {
				utils.vocabularyCategory.getValidCategories.invalidate();
				setCurrentDialog(null);
			},
			onError: (error) => {
				console.error(error);
			},
		});

	// Dialog state controls
	const isAddDialogOpen = currentDialog === "add";
	const isEditDialogOpen = currentDialog === "edit";
	const isDeleteDialogOpen = currentDialog === "delete";

	const setIsAddDialogOpen = (value: boolean) => {
		if (!value) setCurrentDialog(null);
		else setCurrentDialog("add");
	};

	const setIsEditDialogOpen = (value: boolean) => {
		if (!value) setCurrentDialog(null);
		else setCurrentDialog("edit");
	};

	const setIsDeleteDialogOpen = (value: boolean) => {
		if (!value) setCurrentDialog(null);
		else setCurrentDialog("delete");
	};

	// Handlers
	const openAddDialog = () => {
		setIsAddDialogOpen(true);
	};

	const openEditDialog = (course: VocabularyCategory) => {
		setCurrentCourse(course);
		setIsEditDialogOpen(true);
	};

	const openDeleteDialog = (course: VocabularyCategory) => {
		setCurrentCourse(course);
		setIsDeleteDialogOpen(true);
	};

	const handleDeleteCourse = async () => {
		if (currentCourse) {
			await deleteAsync(currentCourse.categoryId);
		}
	};

	return (
		<div>
			<div className="flex justify-between items-center mb-6">
				<h2 className="text-2xl font-bold">Quản lý khóa học</h2>
				<Button
					className="flex items-center gap-2 bg-game-primary hover:bg-game-primary/90"
					onClick={openAddDialog}
				>
					<PlusCircle size={16} />
					Thêm khóa học mới
				</Button>
			</div>

			<Card className="mb-6">
				<SearchFilters
					searchTerm={searchTerm}
					setSearchTerm={setSearchTerm}
					statusFilter={statusFilter}
					setStatusFilter={setStatusFilter}
				/>
			</Card>

			<Card>
				<CourseTable
					courses={courses || []}
					onEdit={openEditDialog}
					onDelete={openDeleteDialog}
				/>
			</Card>

			{/* Dialogs */}
			<AddCourseDialog
				open={isAddDialogOpen}
				onOpenChange={setIsAddDialogOpen}
				createAsync={createAsync}
				isCreating={isCreating}
			/>

			<EditCourseDialog
				open={isEditDialogOpen}
				onOpenChange={setIsEditDialogOpen}
				editAsync={editAsync}
				isEditing={isEditing}
				currentCourse={currentCourse}
			/>

			<DeleteDialog
				open={isDeleteDialogOpen}
				onOpenChange={setIsDeleteDialogOpen}
				onDelete={handleDeleteCourse}
				isDeleting={isDeleting}
				courseName={currentCourse?.categoryName}
			/>
		</div>
	);
}
