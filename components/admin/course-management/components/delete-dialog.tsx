import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

interface DeleteDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onDelete: () => Promise<void>;
	isDeleting: boolean;
	courseName?: string;
}

export default function DeleteDialog({
	open,
	onOpenChange,
	onDelete,
	isDeleting,
	courseName,
}: DeleteDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Xác nhận xóa</DialogTitle>
					<DialogDescription>
						Bạn có chắc chắn muốn xóa khóa học "{courseName}"? Hành
						động này không thể hoàn tác.
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button
						variant="outline"
						onClick={() => onOpenChange(false)}
					>
						Hủy
					</Button>
					<Button
						variant="destructive"
						onClick={onDelete}
						disabled={isDeleting}
					>
						{isDeleting ? "Đang xử lý..." : "Xóa khóa học"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
