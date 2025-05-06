import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Check, X, HelpCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import confetti from "canvas-confetti";
import { EnhancedFillBlankExercise } from "./enhanced-grammar-generator";

interface EnhancedFillBlankProps {
  exercise: EnhancedFillBlankExercise;
  onComplete: (correct: boolean) => void;
  onNext: () => void;
}

export function EnhancedFillBlank({
  exercise,
  onComplete,
  onNext,
}: EnhancedFillBlankProps) {
  const [userAnswer, setUserAnswer] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // Parse the text to separate the content and locate blanks
  const textParts = useMemo(() => {
    const parts = [];
    const regex = /\[blank\]/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(exercise.text)) !== null) {
      parts.push({
        type: "text",
        content: exercise.text.slice(lastIndex, match.index),
      });
      parts.push({ type: "blank" });
      lastIndex = regex.lastIndex;
    }

    // Add remaining text
    if (lastIndex < exercise.text.length) {
      parts.push({
        type: "text",
        content: exercise.text.slice(lastIndex),
      });
    }

    return parts;
  }, [exercise.text]);

  // Reset state when exercise changes
  useEffect(() => {
    setUserAnswer("");
    setShowResult(false);
    setIsCorrect(false);
    setShowHint(false);
  }, [exercise.id]);

  // Handle submit answer
  const handleSubmit = () => {
    if (!userAnswer.trim()) return;

    const isAnswerCorrect = exercise.answers.some(
      (answer) =>
        userAnswer.toLowerCase().trim() === answer.toLowerCase().trim()
    );

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

  // Render the exercise with highlighted blanks
  const renderExerciseText = () => {
    return (
      <div className="mb-4 text-gray-700">
        {textParts.map((part, index) => {
          if (part.type === "text") {
            return <span key={index}>{part.content}</span>;
          } else {
            return (
              <span
                key={index}
                className="inline-block min-w-20 px-2 mx-1 border-b-2 border-dashed border-game-primary text-center font-medium"
              >
                {showResult ? (
                  isCorrect ? (
                    <span className="text-green-600">{userAnswer}</span>
                  ) : (
                    <span className="text-red-600">{userAnswer}</span>
                  )
                ) : (
                  "_____"
                )}
              </span>
            );
          }
        })}
      </div>
    );
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-white pb-4">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="mb-2 bg-blue-50 text-blue-700">
            Điền từ còn thiếu
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
          Điền từ thích hợp vào chỗ trống
        </CardTitle>
      </CardHeader>

      <CardContent className="p-6">
        <div className="space-y-4">
          {renderExerciseText()}

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

          <Input
            placeholder="Nhập câu trả lời..."
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            className="w-full"
            disabled={showResult}
            data-testid="fill-blank-input"
          />

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
                      Đáp án đúng: {exercise.answers[0]}
                      {exercise.answers.length > 1 && (
                        <span className="text-sm text-gray-500">
                          {" "}
                          (hoặc: {exercise.answers.slice(1).join(", ")})
                        </span>
                      )}
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
          <Button
            className="game-button"
            onClick={handleSubmit}
            disabled={!userAnswer.trim()}
          >
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
