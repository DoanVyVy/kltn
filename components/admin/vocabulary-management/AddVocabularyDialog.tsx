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

interface AddVocabularyDialogProps {
	isOpen: boolean;
	setIsOpen: (isOpen: boolean) => void;
	courses: any[] | undefined;
}

export default function AddVocabularyDialog({
	isOpen,
	setIsOpen,
	courses,
}: AddVocabularyDialogProps) {
	const utils = trpc.useUtils();
	const { mutateAsync: createAsync, isPending: isCreating } =
		trpc.vocabulary.create.useMutation({
			onSuccess: () => {
				toast({
					title: "Thành công",
					description: "Đã thêm từ vựng mới",
				});
				utils.vocabulary.getAll.invalidate();
				setIsOpen(false);
			},
			onError: (error) => {
				toast({
					title: "Lỗi",
					description: error.message || "Không thể thêm từ vựng",
					variant: "destructive",
				});
			},
		});

	// Handle add vocabulary
	const onSubmitAdd = (data: CreateVocabularyInput) => {
		createAsync(data);
	};

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogContent className="max-w-3xl">
				<DialogHeader>
					<DialogTitle>Thêm từ vựng mới</DialogTitle>
					<DialogDescription>
						Điền thông tin chi tiết cho từ vựng mới
					</DialogDescription>
				</DialogHeader>
				<VocabularyForm
					onSubmit={onSubmitAdd}
					courses={courses}
					isSubmitting={isCreating}
					buttonText="Thêm từ vựng"
				/>
			</DialogContent>
		</Dialog>
	);
}
