import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, BarChart2, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import confetti from "canvas-confetti";
import { GrammarExerciseType } from "./enhanced-grammar-generator";
import { EnhancedFillBlank } from "./enhanced-fill-blank";
import { EnhancedReorder } from "./enhanced-reorder";
import { GrammarErrorIdentification } from "./grammar-error-identification";

interface EnhancedGrammarExerciseProps {
  exercises: GrammarExerciseType[];
  grammarTitle: string;
  onComplete: (score: number, total: number) => void;
  onExit: () => void;
}

export function EnhancedGrammarExercise({
  exercises,
  grammarTitle,
  onComplete,
  onExit,
}: EnhancedGrammarExerciseProps) {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState<number[]>([]);

  // Timer effect
  useEffect(() => {
    if (isFinished) return;

    const timer = setInterval(() => {
      setTimeSpent((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isFinished]);

  // Current exercise
  const currentExercise = exercises[currentExerciseIndex] || null;

  // Handle exercise completion
  const handleExerciseComplete = (correct: boolean) => {
    if (!answeredQuestions.includes(currentExerciseIndex)) {
      setAnsweredQuestions([...answeredQuestions, currentExerciseIndex]);
      if (correct) {
        setScore((prev) => prev + 10);
        setCorrectAnswers((prev) => prev + 1);
      } else {
        setWrongAnswers((prev) => prev + 1);
      }
    }
  };

  // Go to next exercise
  const handleNextExercise = () => {
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex((prev) => prev + 1);
    } else {
      setIsFinished(true);
      triggerConfetti();
      // Call onComplete with final score
      onComplete(score, exercises.length * 10);
    }
  };

  // Trigger confetti effect when finishing the exercises
  const triggerConfetti = () => {
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
    });
  };

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Calculate completion percentage
  const completionPercentage =
    (answeredQuestions.length / exercises.length) * 100;

  // Render current exercise based on its type
  const renderExercise = () => {
    if (!currentExercise) return null;

    switch (currentExercise.type) {
      case "fillBlank":
        return (
          <EnhancedFillBlank
            exercise={currentExercise}
            onComplete={handleExerciseComplete}
            onNext={handleNextExercise}
          />
        );
      case "reorder":
        return (
          <EnhancedReorder
            exercise={currentExercise}
            onComplete={handleExerciseComplete}
            onNext={handleNextExercise}
          />
        );
      default:
        // Assuming this is error identification
        return (
          <GrammarErrorIdentification
            exercise={currentExercise}
            onComplete={handleExerciseComplete}
            onNext={handleNextExercise}
          />
        );
    }
  };

  // Results screen
  if (isFinished) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-lg"
      >
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
            <CardTitle className="text-center text-xl">
              Kết quả bài kiểm tra
            </CardTitle>
            <div className="mt-4 flex justify-center">
              <Trophy className="h-16 w-16 text-yellow-300" />
            </div>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div className="text-center">
              <h3 className="text-xl font-bold text-game-accent">
                {grammarTitle}
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Chúc mừng bạn đã hoàn thành bài kiểm tra!
              </p>
            </div>

            <div className="flex justify-around text-center">
              <div>
                <div className="text-3xl font-bold text-game-primary">
                  {score}/{exercises.length * 10}
                </div>
                <p className="text-sm text-gray-500">Điểm số</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600">
                  {correctAnswers}
                </div>
                <p className="text-sm text-gray-500">Câu đúng</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-red-600">
                  {wrongAnswers}
                </div>
                <p className="text-sm text-gray-500">Câu sai</p>
              </div>
            </div>

            <div className="rounded-lg bg-blue-50 p-4 text-center">
              <div className="text-sm text-gray-600">Thời gian hoàn thành</div>
              <div className="mt-1 text-xl font-medium text-blue-800">
                {formatTime(timeSpent)}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Độ chính xác</span>
                <span className="text-sm font-medium text-game-primary">
                  {exercises.length > 0
                    ? Math.round((correctAnswers / exercises.length) * 100)
                    : 0}
                  %
                </span>
              </div>
              <Progress
                value={
                  exercises.length > 0
                    ? (correctAnswers / exercises.length) * 100
                    : 0
                }
                className="h-2"
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between bg-gray-50 p-4">
            <Button variant="outline" onClick={onExit} className="px-6">
              Thoát
            </Button>
            <Button onClick={onExit} className="game-button px-6">
              Tiếp tục học
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-game-accent">{grammarTitle}</h2>
          <p className="text-sm text-gray-500">
            Câu hỏi {currentExerciseIndex + 1} / {exercises.length}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {formatTime(timeSpent)}
          </Badge>
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            {score} điểm
          </Badge>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Tiến độ</span>
          <span className="text-sm font-medium text-game-primary">
            {Math.round(completionPercentage)}%
          </span>
        </div>
        <Progress value={completionPercentage} className="h-2" />
      </div>

      {renderExercise()}
    </div>
  );
}
