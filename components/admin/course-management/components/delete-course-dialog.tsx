import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Category } from "@prisma/client";

interface DeleteCourseDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  currentCourse: Category | null;
  onConfirm: () => void;
}

export default function DeleteCourseDialog({
  isOpen,
  setIsOpen,
  currentCourse,
  onConfirm,
}: DeleteCourseDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Xóa khóa học</DialogTitle>
          <DialogDescription>
            Bạn có chắc chắn muốn xóa khóa học "{currentCourse?.categoryName}"?
            Hành động này không thể hoàn tác.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Hủy
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Xóa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
