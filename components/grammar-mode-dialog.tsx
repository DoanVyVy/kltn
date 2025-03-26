"use client";
import { useRouter } from "next/navigation";
import { BookOpen, Gamepad2, BookOpenCheck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface GrammarModeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStartLearning: () => void;
  onRegister?: () => void;
}

export function GrammarModeDialog({
  open,
  onOpenChange,
  onStartLearning,
  onRegister,
}: GrammarModeDialogProps) {
  const router = useRouter();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl text-game-accent">
            Chọn chế độ học
          </DialogTitle>
          <DialogDescription className="text-center text-game-accent/70">
            Chọn phương pháp phù hợp để học ngữ pháp hiệu quả nhất
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-4 pt-4">
          <Card
            className="cursor-pointer border-2 border-transparent transition-all hover:border-game-primary hover:shadow-md"
            onClick={() => {
              onRegister?.();
              onStartLearning();
            }}
          >
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-full bg-blue-50 p-3">
                <BookOpen className="h-8 w-8 text-blue-500" />
              </div>
              <div>
                <h3 className="font-medium text-game-accent">Học lý thuyết</h3>
                <p className="text-sm text-game-accent/70">
                  Học lý thuyết ngữ pháp chi tiết với giải thích, ví dụ và ghi
                  chú
                </p>
              </div>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer border-2 border-transparent transition-all hover:border-game-primary hover:shadow-md"
            onClick={() => {
              onRegister?.();
              router.push("/grammar/learned");
              onOpenChange(false);
            }}
          >
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-full bg-green-50 p-3">
                <BookOpenCheck className="h-8 w-8 text-green-500" />
              </div>
              <div>
                <h3 className="font-medium text-game-accent">
                  Xem ngữ pháp đã học
                </h3>
                <p className="text-sm text-game-accent/70">
                  Xem lại tất cả ngữ pháp đã học trong khóa học này
                </p>
              </div>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer border-2 border-transparent transition-all hover:border-game-primary hover:shadow-md"
            onClick={() => {
              onRegister?.();
              router.push("/grammar/game");
              onOpenChange(false);
            }}
          >
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-full bg-purple-50 p-3">
                <Gamepad2 className="h-8 w-8 text-purple-500" />
              </div>
              <div>
                <h3 className="font-medium text-game-accent">
                  Luyện tập qua trò chơi
                </h3>
                <p className="text-sm text-game-accent/70">
                  Rèn luyện kiến thức ngữ pháp qua các trò chơi tương tác và bài
                  tập
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="mt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full"
          >
            Hủy
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
