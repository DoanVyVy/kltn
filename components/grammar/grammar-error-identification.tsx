import { useState, useEffect } from "react";
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
import confetti from "canvas-confetti";
import { dispatchAppEvent } from "@/events/handlers";

export interface ErrorIdentificationExercise {
  id: string | number;
  sentence: string;
  options: {
    id: string | number;
    text: string;
    isError: boolean;
    explanation?: string;
  }[];
  hint?: string;
  explanation: string;
}

interface GrammarErrorIdentificationProps {
  exercise: ErrorIdentificationExercise;
  onComplete: (correct: boolean) => void;
  onNext: () => void;
}

export function GrammarErrorIdentification({
  exercise,
  onComplete,
  onNext,
}: GrammarErrorIdentificationProps) {
  const [selectedOption, setSelectedOption] = useState<string | number | null>(
    null
  );
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // Reset state when exercise changes
  useEffect(() => {
    setSelectedOption(null);
    setShowResult(false);
    setIsCorrect(false);
    setShowHint(false);
  }, [exercise.id]);

  // Handle submit answer
  const handleSubmit = () => {
    if (selectedOption === null) return;

    const selectedOptionData = exercise.options.find(
      (opt) => opt.id === selectedOption
    );
    const correct = selectedOptionData?.isError ?? false;

    setIsCorrect(correct);
    if (correct) {
			dispatchAppEvent({
				eventType: "learned_grammar",
				payload: {
					correct: correct,
					grammarId: exercise.id,
					categoryId: exercise.id,
				},
				timestamp: new Date(),
			});
		}
    setShowResult(true);
    onComplete(correct);

    if (correct) {
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
          <Badge variant="outline" className="mb-2 bg-red-50 text-red-700">
            Tìm lỗi sai
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
          Tìm phần có lỗi ngữ pháp trong câu sau:
        </CardTitle>
        <p className="mt-2 text-gray-700 font-medium">{exercise.sentence}</p>
        {showHint && exercise.hint && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 rounded-md bg-amber-50 p-2 text-sm text-amber-700"
          >
            {exercise.hint}
          </motion.div>
        )}
      </CardHeader>

      <CardContent className="p-6">
        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-2">
            {exercise.options.map((option) => (
              <div
                key={option.id}
                className={`flex px-4 py-3 rounded-md border cursor-pointer transition-colors ${
                  selectedOption === option.id
                    ? "border-game-primary bg-game-primary/10 text-game-primary"
                    : "border-gray-200 bg-white hover:bg-gray-50"
                }`}
                onClick={() => !showResult && setSelectedOption(option.id)}
              >
                <div className="flex-1">{option.text}</div>
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
                    <p className="mt-2 font-medium text-red-700">
                      Đáp án đúng:{" "}
                      {exercise.options.find((opt) => opt.isError)?.text || ""}
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
            disabled={selectedOption === null}
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
