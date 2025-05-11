"use client";

import { useState, useMemo, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, BookOpen, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { trpc } from "@/trpc/client";
import Navigation from "@/components/navigation";
import { useToast } from "@/hooks/use-toast";
import { GrammarReference } from "@/components/grammar/grammar-reference";
import { useEnhancedGrammarGenerator } from "@/components/grammar/enhanced-grammar-generator";
import { EnhancedGrammarExercise } from "@/components/grammar/enhanced-grammar-exercise";

export default function GrammarPracticePage(
  props: {
    params: Promise<{ id: string }>;
  }
) {
  const params = use(props.params);
  const router = useRouter();
  const { toast } = useToast();
  const categoryId = parseInt(params.id);

  // States
  const [showReference, setShowReference] = useState(false);
  const [isExerciseFinished, setIsExerciseFinished] = useState(false);

  // Get grammar content for the category
  const { data: grammarContents = [], isLoading: isGrammarLoading } =
    trpc.grammarContent.getAll.useQuery({
      categoryId: categoryId,
      page: 1,
      limit: 100,
    });

  // Get category details
  const { data: category, isLoading: isCategoryLoading } =
    trpc.category.getCategoryById.useQuery(categoryId);

  // Choose a random subset of grammar contents to practice
  const practiceGrammars = useMemo(() => {
    if (!grammarContents || grammarContents.length === 0) return [];

    // Select up to 3 grammar points for practice session
    const maxGrammars = Math.min(grammarContents.length, 3);
    const shuffled = [...grammarContents].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, maxGrammars);
  }, [grammarContents]);

  // Current grammar and exercises
  const currentGrammar =
    practiceGrammars.length > 0 ? practiceGrammars[0] : null;
  const exercises = useEnhancedGrammarGenerator(currentGrammar);

  // Update progress to the server
  const { mutate: updateProgress } =
    trpc.userProcess.userRegisterCategory.useMutation({
      onSuccess: () => {
        toast({
          title: "Tiến độ đã được cập nhật",
          description: "Chúc mừng bạn đã học thêm điểm ngữ pháp mới!",
        });
      },
    });

  // Handle completion of all exercises
  const handleComplete = (score: number, total: number) => {
    setIsExerciseFinished(true);

    // Update user progress for this grammar point
    if (currentGrammar?.contentId) {
      updateProgress({
        categoryId: categoryId,
        grammarId: currentGrammar.contentId,
        correct: score > total / 2, // Consider it correct if the score is more than half
      });
    }
  };

  // Restart with different exercises
  const handleRestartDifferent = () => {
    router.refresh(); // This will reload the page with different random grammar points
  };

  // Return to grammar list
  const handleReturnToList = () => {
    router.push("/grammar");
  };

  // Loading state
  if (isGrammarLoading || isCategoryLoading) {
    return (
      <div className="min-h-screen bg-game-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="flex justify-center py-20">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        </main>
      </div>
    );
  }

  // No grammar content
  if (!grammarContents || grammarContents.length === 0) {
    return (
      <div className="min-h-screen bg-game-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <Button
            className="mb-6 flex items-center gap-2"
            variant="ghost"
            onClick={() => router.push("/grammar")}
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại
          </Button>

          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 rounded-full bg-gray-100 p-3">
              <BookOpen className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="mb-2 text-xl font-medium text-gray-600">
              Không có nội dung ngữ pháp
            </h3>
            <p className="text-gray-500">
              Khóa học này chưa có nội dung ngữ pháp nào.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-game-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <Button
            variant="ghost"
            onClick={handleReturnToList}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại
          </Button>

          <div className="text-right">
            <h1 className="text-xl font-bold text-game-accent">
              {category?.categoryName || "Luyện tập ngữ pháp"}
            </h1>
            <p className="text-sm text-game-accent/70">
              Luyện tập các kiến thức ngữ pháp thông qua bài tập
            </p>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowReference(true)}
              className="gap-2"
            >
              <BookOpen className="h-4 w-4" />
              Xem lại ngữ pháp
            </Button>
            <Button
              variant="outline"
              onClick={handleRestartDifferent}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Bài tập khác
            </Button>
          </div>
        </div>

        {currentGrammar && (
          <EnhancedGrammarExercise
            exercises={exercises}
            grammarTitle={currentGrammar.title}
            onComplete={handleComplete}
            onExit={handleReturnToList}
          />
        )}

        <Dialog open={showReference} onOpenChange={setShowReference}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Thông tin ngữ pháp</DialogTitle>
            </DialogHeader>

            <div className="max-h-[70vh] overflow-y-auto">
              <GrammarReference grammar={currentGrammar} />
            </div>

            <DialogFooter>
              <Button onClick={() => setShowReference(false)}>Đóng</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
