import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Check,
  X,
  HelpCircle,
  ArrowRight,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import confetti from "canvas-confetti";
import { EnhancedReorderExercise } from "./enhanced-grammar-generator";

interface EnhancedReorderProps {
  exercise: EnhancedReorderExercise;
  onComplete: (correct: boolean) => void;
  onNext: () => void;
}

export function EnhancedReorder({
  exercise,
  onComplete,
  onNext,
}: EnhancedReorderProps) {
  const [fragments, setFragments] = useState<string[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // Initialize fragments in scrambled order
  useEffect(() => {
    const scrambled = [...exercise.fragments].sort(() => Math.random() - 0.5);
    setFragments(scrambled);
    setShowResult(false);
    setIsCorrect(false);
    setShowHint(false);
  }, [exercise.id, exercise.fragments]);

  // Reorder functionality - move item up in the array
  const moveUp = (index: number) => {
    if (index <= 0 || showResult) return;
    const newOrder = [...fragments];
    const temp = newOrder[index - 1];
    newOrder[index - 1] = newOrder[index];
    newOrder[index] = temp;
    setFragments(newOrder);
  };

  // Reorder functionality - move item down in the array
  const moveDown = (index: number) => {
    if (index >= fragments.length - 1 || showResult) return;
    const newOrder = [...fragments];
    const temp = newOrder[index + 1];
    newOrder[index + 1] = newOrder[index];
    newOrder[index] = temp;
    setFragments(newOrder);
  };

  // Handle submit answer
  const handleSubmit = () => {
    // Join the fragments to form the user's answer, ignoring punctuation differences for comparison
    const userAnswer = fragments
      .join(" ")
      .replace(/\s([,.!?;:])/g, "$1") // Remove spaces before punctuation
      .toLowerCase()
      .trim();

    // Format correct answer the same way
    const correctAnswer = exercise.sentence.toLowerCase().trim();

    const isAnswerCorrect = userAnswer === correctAnswer;

    setIsCorrect(isAnswerCorrect);
    setShowResult(true);
    onComplete(isAnswerCorrect);

    if (isAnswerCorrect) {
      triggerConfetti();
    }
  };

  // Trigger confetti effect when correct
  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-white pb-4">
        <div className="flex items-center justify-between">
          <Badge
            variant="outline"
            className="mb-2 bg-purple-50 text-purple-700"
          >
            Sắp xếp từ
          </Badge>
          {exercise.hint && (
            <Button
              variant="ghost"
              size="sm"
              className="text-amber-500 hover:text-amber-600"
              onClick={() => setShowHint(!showHint)}
            >
              <HelpCircle className="h-4 w-4" />
              <span className="ml-1">Gợi ý</span>
            </Button>
          )}
        </div>
        <CardTitle className="text-lg text-game-accent">
          Sắp xếp các từ để tạo thành câu hoàn chỉnh
        </CardTitle>
      </CardHeader>

      <CardContent className="p-6">
        <div className="space-y-4">
          {showHint && exercise.hint && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 rounded-md bg-amber-50 p-2 text-sm text-amber-700"
            >
              {exercise.hint}
            </motion.div>
          )}

          <div className="space-y-2">
            {fragments.map((fragment, index) => (
              <div
                key={index}
                className={`flex items-center gap-2 rounded-md border p-2 transition-colors ${
                  showResult
                    ? isCorrect
                      ? "border-green-200 bg-green-50"
                      : "border-red-200 bg-red-50"
                    : "border-gray-200 bg-white"
                }`}
              >
                <span className="text-sm text-gray-500">{index + 1}.</span>
                <span className="flex-1">{fragment}</span>
                {!showResult && (
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => moveUp(index)}
                      disabled={index === 0}
                      className="h-8 w-8 p-0"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => moveDown(index)}
                      disabled={index === fragments.length - 1}
                      className="h-8 w-8 p-0"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {showResult && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-4 rounded-md p-4 ${
                isCorrect ? "bg-green-50" : "bg-red-50"
              }`}
            >
              <div className="flex items-start">
                {isCorrect ? (
                  <Check className="mr-3 h-5 w-5 shrink-0 text-green-500" />
                ) : (
                  <X className="mr-3 h-5 w-5 shrink-0 text-red-500" />
                )}
                <div>
                  <p
                    className={`font-medium ${
                      isCorrect ? "text-green-700" : "text-red-700"
                    }`}
                  >
                    {isCorrect ? "Chính xác!" : "Chưa chính xác"}
                  </p>
                  <p className="mt-1 text-sm">{exercise.explanation}</p>
                  {!isCorrect && (
                    <p className="mt-2 font-medium">
                      Câu đúng:{" "}
                      <span className="text-green-700">
                        {exercise.sentence}
                      </span>
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex justify-end gap-2 bg-gray-50 p-4">
        {!showResult ? (
          <Button className="game-button" onClick={handleSubmit}>
            Kiểm tra
          </Button>
        ) : (
          <Button className="game-button" onClick={onNext}>
            Tiếp theo <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
