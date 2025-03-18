import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { CreateVocabularyInput } from "@/schema/vocabulary";
import { trpc } from "@/trpc/client";
import { toast } from "@/components/ui/use-toast";
import VocabularyForm from "./VocabularyForm";

interface EditVocabularyDialogProps {
	isOpen: boolean;
	setIsOpen: (isOpen: boolean) => void;
	currentWord: any;
	courses: any[] | undefined;
}

export default function EditVocabularyDialog({
	isOpen,
	setIsOpen,
	currentWord,
	courses,
}: EditVocabularyDialogProps) {
	const utils = trpc.useUtils();

	const { mutateAsync: updateAsync, isPending: isUpdating } =
		trpc.vocabulary.update.useMutation({
			onSuccess: () => {
				toast({
					title: "Thành công",
					description: "Đã cập nhật từ vựng",
				});
				utils.vocabulary.getAll.invalidate();
				setIsOpen(false);
			},
			onError: (error) => {
				toast({
					title: "Lỗi",
					description: error.message || "Không thể cập nhật từ vựng",
					variant: "destructive",
				});
			},
		});

	const onSubmitEdit = (data: CreateVocabularyInput) => {
		if (!currentWord) return;

		updateAsync({
			wordId: currentWord.wordId,
			...data,
		});
	};

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogContent className="max-w-3xl">
				<DialogHeader>
					<DialogTitle>Chỉnh sửa từ vựng</DialogTitle>
					<DialogDescription>
						Cập nhật thông tin cho từ vựng
					</DialogDescription>
				</DialogHeader>
				<VocabularyForm
					onSubmit={onSubmitEdit}
					initialData={currentWord}
					courses={courses}
					isSubmitting={isUpdating}
					buttonText="Lưu thay đổi"
				/>
			</DialogContent>
		</Dialog>
	);
}
