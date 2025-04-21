"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Check, Lightbulb, ChevronRight, Info } from "lucide-react";
import { Separator } from "@/components/ui/separator";

// Define types
interface Grammar {
  contentId: number;
  categoryId: number;
  title: string;
  explanation: string;
  examples?: string;
  notes?: string;
  orderIndex?: number;
  imageUrl?: string;
  videoUrl?: string;
}

interface GrammarFlashcardProps {
  currentGrammar: Grammar | null;
  currentIndex: number;
  showAnswer: boolean;
  userAnswer: string;
  isCorrect: boolean | null;
  onNext: () => void;
  onUserAnswerChange: (answer: string) => void;
  onCheckAnswer: () => void;
  onShowAnswer: () => void;
}

export const GrammarFlashcard = ({
  currentGrammar,
  currentIndex,
  showAnswer,
  userAnswer,
  isCorrect,
  onNext,
  onUserAnswerChange,
  onCheckAnswer,
  onShowAnswer,
}: GrammarFlashcardProps) => {
  if (!currentGrammar) return null;

  return (
    <Card className="game-card overflow-hidden">
      <CardHeader className="bg-white pb-4">
        <CardTitle className="text-xl text-game-accent">
          {currentGrammar.title}
        </CardTitle>
      </CardHeader>

      <CardContent className="px-6 py-4">
        <div className="space-y-6">
          {/* Explanation section */}
          <div className="rounded-lg bg-blue-50 p-4">
            <h3 className="mb-2 font-medium text-game-primary">
              Giải thích ngữ pháp
            </h3>
            <p className="text-gray-700">{currentGrammar.explanation}</p>
          </div>

          {/* Examples section if available */}
          {currentGrammar.examples && (
            <div className="rounded-lg bg-amber-50 p-4">
              <h3 className="mb-2 font-medium text-amber-800">Ví dụ</h3>
              <div className="space-y-2">
                {currentGrammar.examples
                  .split("\n")
                  .filter((line) => line.trim().length > 0)
                  .map((example, i) => (
                    <p key={i} className="text-amber-900">
                      {example}
                    </p>
                  ))}
              </div>
            </div>
          )}

          {/* Notes section if available */}
          {currentGrammar.notes && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <h3 className="mb-2 font-medium text-gray-700">Ghi chú</h3>
              <p className="text-gray-600">{currentGrammar.notes}</p>
            </div>
          )}

          {/* Media section if available */}
          {currentGrammar.imageUrl && (
            <div className="mt-4">
              <h3 className="mb-2 font-medium text-gray-700">Hình ảnh</h3>
              <div className="overflow-hidden rounded-lg bg-gray-100">
                <img
                  src={currentGrammar.imageUrl}
                  alt={currentGrammar.title}
                  className="mx-auto max-h-40 object-contain"
                />
              </div>
            </div>
          )}

          {currentGrammar.videoUrl && (
            <div className="mt-4">
              <h3 className="mb-2 font-medium text-gray-700">Video</h3>
              <div className="overflow-hidden rounded-lg bg-gray-100">
                <iframe
                  src={currentGrammar.videoUrl}
                  className="aspect-video w-full rounded-lg"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          )}

          <Separator />

          {/* Practice section */}
          <div>
            <h3 className="mb-3 font-medium text-game-accent">Luyện tập</h3>
            <p className="mb-3 text-gray-600">
              Viết một câu ví dụ sử dụng cấu trúc ngữ pháp vừa học:
            </p>

            <Textarea
              placeholder="Viết câu ví dụ sử dụng cấu trúc ngữ pháp..."
              value={userAnswer}
              onChange={(e) => onUserAnswerChange(e.target.value)}
              className="min-h-[100px] resize-none"
              disabled={showAnswer}
            />

            {/* Feedback when answer is submitted */}
            {showAnswer && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-4 rounded-lg p-4 ${
                  isCorrect ? "bg-green-50" : "bg-amber-50"
                }`}
              >
                {isCorrect ? (
                  <div className="flex items-start">
                    <Check className="mr-2 h-5 w-5 text-green-500" />
                    <div>
                      <h4 className="font-medium text-green-800">Rất tốt!</h4>
                      <p className="text-sm text-green-700">
                        Câu của bạn sử dụng đúng cấu trúc ngữ pháp.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start">
                    <Lightbulb className="mr-2 h-5 w-5 text-amber-500" />
                    <div>
                      <h4 className="font-medium text-amber-800">Gợi ý</h4>
                      <p className="text-sm text-amber-700">
                        Hãy thử sử dụng cấu trúc ngữ pháp "
                        {currentGrammar.title}" như trong ví dụ.
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between bg-gray-50 p-4">
        <Button
          variant="outline"
          onClick={onShowAnswer}
          disabled={showAnswer || !userAnswer.trim()}
          className="border-blue-200 text-blue-600"
        >
          <Info className="mr-2 h-4 w-4" />
          Xem gợi ý
        </Button>

        {!showAnswer ? (
          <Button
            className="game-button"
            onClick={onCheckAnswer}
            disabled={!userAnswer.trim()}
          >
            Kiểm tra câu trả lời
          </Button>
        ) : (
          <Button className="game-button" onClick={onNext}>
            Tiếp theo
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
