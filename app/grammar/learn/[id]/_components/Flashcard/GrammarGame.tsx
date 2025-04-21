"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, RefreshCw, Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

// Define interfaces
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

interface GrammarGameProps {
  grammar: Grammar | null;
  onComplete: (success: boolean) => void;
}

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
}

export const GrammarGame = ({ grammar, onComplete }: GrammarGameProps) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [loading, setLoading] = useState(true);

  // Generate questions based on the grammar
  useEffect(() => {
    if (!grammar) return;

    setLoading(true);
    // Reset game state
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setScore(0);
    setGameCompleted(false);

    // Generate questions for this grammar point
    const generatedQuestions = generateQuestionsForGrammar(grammar);
    setQuestions(generatedQuestions);
    setLoading(false);
  }, [grammar]);

  // Generate questions based on the grammar content
  const generateQuestionsForGrammar = (grammar: Grammar): Question[] => {
    // This is a sample implementation. In a real app, you might:
    // 1. Use pre-defined questions from a database
    // 2. Use an API to generate questions
    // 3. Have a more sophisticated algorithm to generate questions

    const questions: Question[] = [];

    if (!grammar.examples) {
      // If no examples available, create basic questions about the concept
      questions.push({
        id: 1,
        question: `Đâu là cách sử dụng đúng của "${grammar.title}"?`,
        options: [
          getCorrectOption(grammar),
          getIncorrectOption1(grammar),
          getIncorrectOption2(grammar),
          getIncorrectOption3(grammar),
        ],
        correctAnswer: getCorrectOption(grammar),
      });

      questions.push({
        id: 2,
        question: `Câu nào dưới đây dùng "${grammar.title}" đúng cách?`,
        options: shuffleArray([
          getCorrectOption(grammar),
          getIncorrectOption1(grammar),
          getIncorrectOption2(grammar),
          getIncorrectOption4(grammar),
        ]),
        correctAnswer: getCorrectOption(grammar),
      });

      questions.push({
        id: 3,
        question: `Khi nào chúng ta sử dụng "${grammar.title}"?`,
        options: shuffleArray([
          getUsageExplanation(grammar),
          getIncorrectUsage1(grammar),
          getIncorrectUsage2(grammar),
          getIncorrectUsage3(grammar),
        ]),
        correctAnswer: getUsageExplanation(grammar),
      });
    } else {
      // Parse examples to create questions
      const examples = grammar.examples.split("\n").filter((e) => e.trim());

      // Use the first example for a "fill in the blank" question
      if (examples.length > 0) {
        const example = examples[0];
        const words = example.split(" ");
        const randomIndex = Math.floor(Math.random() * (words.length - 2)) + 1;
        const blankedWord = words[randomIndex];
        words[randomIndex] = "_____";

        questions.push({
          id: 1,
          question: `Điền vào chỗ trống: ${words.join(" ")}`,
          options: shuffleArray([
            blankedWord,
            getAlternativeWord1(blankedWord),
            getAlternativeWord2(blankedWord),
            getAlternativeWord3(blankedWord),
          ]),
          correctAnswer: blankedWord,
        });
      }

      // Create a "choose the correct sentence" question
      if (examples.length > 0) {
        questions.push({
          id: 2,
          question: "Chọn câu đúng về mặt ngữ pháp:",
          options: shuffleArray([
            examples[0],
            createIncorrectSentence1(examples[0]),
            createIncorrectSentence2(examples[0]),
            examples.length > 1
              ? examples[1]
              : createIncorrectSentence3(examples[0]),
          ]),
          correctAnswer: examples[0],
        });
      }

      // Create a "usage" question
      questions.push({
        id: 3,
        question: `Khi nào chúng ta sử dụng "${grammar.title}"?`,
        options: shuffleArray([
          getUsageExplanation(grammar),
          getIncorrectUsage1(grammar),
          getIncorrectUsage2(grammar),
          getIncorrectUsage3(grammar),
        ]),
        correctAnswer: getUsageExplanation(grammar),
      });
    }

    return questions;
  };

  // Helper functions to generate question content
  const getCorrectOption = (grammar: Grammar) => {
    const title = grammar.title.toLowerCase();
    if (title.includes("present simple")) {
      return "She works in a hospital.";
    } else if (title.includes("past simple")) {
      return "I visited my grandmother last weekend.";
    } else if (title.includes("present continuous")) {
      return "They are studying for their exams now.";
    } else if (title.includes("future")) {
      return "I will call you tomorrow.";
    } else if (title.includes("conditional")) {
      return "If it rains, I will stay home.";
    } else if (title.includes("passive voice")) {
      return "The book was written by Mark Twain.";
    } else {
      return "The students are learning English grammar.";
    }
  };

  const getIncorrectOption1 = (grammar: Grammar) => {
    const title = grammar.title.toLowerCase();
    if (title.includes("present simple")) {
      return "She working in a hospital.";
    } else if (title.includes("past simple")) {
      return "I visit my grandmother last weekend.";
    } else if (title.includes("present continuous")) {
      return "They studying for their exams now.";
    } else if (title.includes("future")) {
      return "I calling you tomorrow.";
    } else if (title.includes("conditional")) {
      return "If it rains, I stay home.";
    } else if (title.includes("passive voice")) {
      return "The book written by Mark Twain.";
    } else {
      return "The students learning English grammar.";
    }
  };

  const getIncorrectOption2 = (grammar: Grammar) => {
    const title = grammar.title.toLowerCase();
    if (title.includes("present simple")) {
      return "She work in a hospital.";
    } else if (title.includes("past simple")) {
      return "I have visit my grandmother last weekend.";
    } else if (title.includes("present continuous")) {
      return "They study for their exams now.";
    } else if (title.includes("future")) {
      return "I am call you tomorrow.";
    } else if (title.includes("conditional")) {
      return "If it will rain, I will stay home.";
    } else if (title.includes("passive voice")) {
      return "Mark Twain was written the book.";
    } else {
      return "The students learns English grammar.";
    }
  };

  const getIncorrectOption3 = (grammar: Grammar) => {
    const title = grammar.title.toLowerCase();
    if (title.includes("present simple")) {
      return "She is works in a hospital.";
    } else if (title.includes("past simple")) {
      return "I was visit my grandmother last weekend.";
    } else if (title.includes("present continuous")) {
      return "They were studying for their exams now.";
    } else if (title.includes("future")) {
      return "I have call you tomorrow.";
    } else if (title.includes("conditional")) {
      return "If it raining, I staying home.";
    } else if (title.includes("passive voice")) {
      return "The book is write by Mark Twain.";
    } else {
      return "The students is learn English grammar.";
    }
  };

  const getIncorrectOption4 = (grammar: Grammar) => {
    const title = grammar.title.toLowerCase();
    if (title.includes("present simple")) {
      return "She does works in a hospital.";
    } else if (title.includes("past simple")) {
      return "I am visited my grandmother last weekend.";
    } else if (title.includes("present continuous")) {
      return "They will studying for their exams now.";
    } else if (title.includes("future")) {
      return "I am going call you tomorrow.";
    } else if (title.includes("conditional")) {
      return "If it is rain, I am stay home.";
    } else if (title.includes("passive voice")) {
      return "Mark Twain is writing the book.";
    } else {
      return "The students has learn English grammar.";
    }
  };

  const getUsageExplanation = (grammar: Grammar) => {
    const title = grammar.title.toLowerCase();
    if (title.includes("present simple")) {
      return "Diễn tả thói quen, sự thật hiển nhiên hoặc hành động lặp đi lặp lại.";
    } else if (title.includes("past simple")) {
      return "Diễn tả hành động đã xảy ra và kết thúc trong quá khứ.";
    } else if (title.includes("present continuous")) {
      return "Diễn tả hành động đang diễn ra tại thời điểm nói.";
    } else if (title.includes("future")) {
      return "Diễn tả hành động sẽ xảy ra trong tương lai.";
    } else if (title.includes("conditional")) {
      return "Diễn tả điều kiện và kết quả.";
    } else if (title.includes("passive voice")) {
      return "Diễn tả hành động khi chủ thể không quan trọng hoặc không biết.";
    } else {
      return "Diễn tả cấu trúc ngữ pháp theo quy tắc cụ thể.";
    }
  };

  const getIncorrectUsage1 = (grammar: Grammar) => {
    const title = grammar.title.toLowerCase();
    if (title.includes("present simple")) {
      return "Diễn tả hành động đang xảy ra tại thời điểm nói.";
    } else if (title.includes("past simple")) {
      return "Diễn tả hành động đã bắt đầu trong quá khứ và vẫn tiếp tục đến hiện tại.";
    } else if (title.includes("present continuous")) {
      return "Diễn tả thói quen hoặc sự thật hiển nhiên.";
    } else if (title.includes("future")) {
      return "Diễn tả hành động đã hoàn thành trong quá khứ.";
    } else if (title.includes("conditional")) {
      return "Diễn tả hành động bắt buộc phải làm.";
    } else if (title.includes("passive voice")) {
      return "Diễn tả hành động sẽ xảy ra trong tương lai gần.";
    } else {
      return "Diễn tả khả năng làm việc gì đó.";
    }
  };

  const getIncorrectUsage2 = (grammar: Grammar) => {
    const title = grammar.title.toLowerCase();
    if (title.includes("present simple")) {
      return "Chỉ dùng để diễn tả sự việc trong quá khứ.";
    } else if (title.includes("past simple")) {
      return "Chỉ dùng để diễn tả dự định trong tương lai.";
    } else if (title.includes("present continuous")) {
      return "Chỉ dùng để diễn tả sự việc hoàn thành trong quá khứ.";
    } else if (title.includes("future")) {
      return "Chỉ dùng để diễn tả kinh nghiệm đến hiện tại.";
    } else if (title.includes("conditional")) {
      return "Chỉ dùng để diễn tả mệnh lệnh.";
    } else if (title.includes("passive voice")) {
      return "Chỉ dùng khi người nói là chủ thể của hành động.";
    } else {
      return "Chỉ dùng trong câu hỏi, không dùng trong câu khẳng định.";
    }
  };

  const getIncorrectUsage3 = (grammar: Grammar) => {
    const title = grammar.title.toLowerCase();
    if (title.includes("present simple")) {
      return "Chỉ dùng để diễn tả những gì đã xảy ra vào một thời điểm cụ thể.";
    } else if (title.includes("past simple")) {
      return "Chỉ dùng để diễn tả hành động đang diễn ra.";
    } else if (title.includes("present continuous")) {
      return "Chỉ dùng để diễn tả quy luật tự nhiên.";
    } else if (title.includes("future")) {
      return "Chỉ dùng để diễn tả nghĩa vụ hoặc trách nhiệm.";
    } else if (title.includes("conditional")) {
      return "Chỉ dùng để diễn tả sự so sánh.";
    } else if (title.includes("passive voice")) {
      return "Chỉ dùng trong câu phủ định.";
    } else {
      return "Chỉ dùng để diễn tả mong muốn cá nhân.";
    }
  };

  const getAlternativeWord1 = (word: string) => {
    // Simple implementation to get alternative words
    if (word.endsWith("ed")) return word.substring(0, word.length - 2) + "ing";
    if (word.endsWith("ing")) return word.substring(0, word.length - 3) + "ed";
    if (word === "am") return "was";
    if (word === "is") return "are";
    if (word === "are") return "is";
    if (word === "was") return "were";
    if (word === "were") return "was";
    if (word === "will") return "would";
    if (word === "would") return "will";
    return word + "s"; // Add 's' as a simple alternative
  };

  const getAlternativeWord2 = (word: string) => {
    if (word === "am") return "are";
    if (word === "is") return "was";
    if (word === "are") return "were";
    if (word === "was") return "am";
    if (word === "were") return "are";
    if (word === "will") return "shall";
    if (word === "would") return "should";
    if (word.endsWith("s")) return word.substring(0, word.length - 1);
    return word + "ed";
  };

  const getAlternativeWord3 = (word: string) => {
    if (word === "am") return "will";
    if (word === "is") return "has";
    if (word === "are") return "have";
    if (word === "was") return "has been";
    if (word === "were") return "have been";
    if (word === "will") return "is going to";
    if (word === "would") return "could";
    if (word.endsWith("ing")) return word.substring(0, word.length - 3);
    return "have " + word;
  };

  const createIncorrectSentence1 = (sentence: string) => {
    // Simple replacement to create wrong sentences
    return sentence
      .replace(/am/g, "are")
      .replace(/is/g, "are")
      .replace(/was/g, "were")
      .replace(/will/g, "would")
      .replace(/have/g, "has")
      .replace(/has/g, "have");
  };

  const createIncorrectSentence2 = (sentence: string) => {
    // Another type of replacement for variety
    return sentence
      .replace(/am/g, "is")
      .replace(/is/g, "am")
      .replace(/are/g, "is")
      .replace(/was/g, "am")
      .replace(/were/g, "was")
      .replace(/will/g, "shall")
      .replace(/would/g, "will");
  };

  const createIncorrectSentence3 = (sentence: string) => {
    // Create a more broken version
    const words = sentence.split(" ");
    if (words.length > 3) {
      // Swap some words to create incorrect order
      [words[1], words[2]] = [words[2], words[1]];
    }
    return words.join(" ");
  };

  const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  // Handle answer selection
  const handleAnswerSelect = (answer: string) => {
    if (selectedAnswer !== null) return; // Already answered

    const currentQuestion = questions[currentQuestionIndex];
    const correct = answer === currentQuestion.correctAnswer;

    setSelectedAnswer(answer);
    setIsCorrect(correct);

    if (correct) {
      setScore(score + 1);
    }

    // Move to next question after a delay
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer(null);
        setIsCorrect(null);
      } else {
        // Game completed
        setGameCompleted(true);
        onComplete(score >= Math.floor(questions.length / 2)); // Success if got at least half right
      }
    }, 1500);
  };

  // Restart the game
  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setScore(0);
    setGameCompleted(false);
  };

  if (loading) {
    return (
      <Card className="game-card">
        <CardContent className="flex min-h-[300px] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-game-primary border-t-transparent"></div>
        </CardContent>
      </Card>
    );
  }

  if (questions.length === 0) {
    return (
      <Card className="game-card">
        <CardContent className="flex min-h-[300px] flex-col items-center justify-center p-6">
          <div className="mb-4 rounded-full bg-amber-100 p-3">
            <Trophy className="h-8 w-8 text-amber-500" />
          </div>
          <h3 className="mb-2 text-center text-lg font-medium text-game-accent">
            Không có câu đố cho điểm ngữ pháp này
          </h3>
          <p className="mb-4 text-center text-gray-500">
            Hãy quay lại sau khi chúng tôi đã cập nhật thêm nội dung.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (gameCompleted) {
    // Show game completion screen
    return (
      <Card className="game-card overflow-hidden">
        <CardHeader className="bg-game-primary/5 pb-4">
          <CardTitle className="text-center text-xl text-game-accent">
            Kết quả trò chơi
          </CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col items-center justify-center p-6">
          <div className="mb-4 rounded-full bg-amber-100 p-3">
            <Trophy className="h-12 w-12 text-amber-500" />
          </div>

          <h3 className="mb-2 text-2xl font-bold text-game-primary">
            {score}/{questions.length} câu đúng
          </h3>

          <Progress
            value={(score / questions.length) * 100}
            className={`mb-4 h-3 w-full ${
              score === questions.length
                ? "bg-green-500"
                : score >= Math.floor(questions.length / 2)
                ? "bg-amber-500"
                : "bg-red-500"
            }`}
          />

          <p className="mb-6 text-center text-gray-600">
            {score === questions.length
              ? "Tuyệt vời! Bạn đã trả lời đúng tất cả các câu hỏi."
              : score >= Math.floor(questions.length / 2)
              ? "Làm tốt lắm! Bạn đã nắm được phần lớn nội dung ngữ pháp."
              : "Cố gắng hơn nhé! Bạn nên xem lại phần lý thuyết."}
          </p>

          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={handleRestart}
          >
            <RefreshCw className="h-4 w-4" />
            Chơi lại
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Main game UI
  const currentQuestion = questions[currentQuestionIndex];

  return (
    <Card className="game-card overflow-hidden">
      <CardHeader className="bg-white pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-game-accent">
            Trò chơi ngữ pháp
          </CardTitle>
          <Badge variant="outline" className="text-game-primary">
            Câu {currentQuestionIndex + 1}/{questions.length}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="rounded-lg bg-blue-50 p-4">
            <h3 className="mb-2 text-lg font-medium text-game-primary">
              {currentQuestion.question}
            </h3>
          </div>

          <div className="grid gap-3">
            {currentQuestion.options.map((option, index) => (
              <Button
                key={index}
                variant="outline"
                className={`justify-start px-4 py-6 text-left hover:bg-gray-50 ${
                  selectedAnswer === option
                    ? option === currentQuestion.correctAnswer
                      ? "border-green-500 bg-green-50 text-green-700 hover:bg-green-50"
                      : "border-red-500 bg-red-50 text-red-700 hover:bg-red-50"
                    : "border-gray-200"
                }`}
                onClick={() => handleAnswerSelect(option)}
                disabled={selectedAnswer !== null}
              >
                <div className="flex w-full items-center justify-between">
                  <span>{option}</span>
                  {selectedAnswer === option &&
                    (option === currentQuestion.correctAnswer ? (
                      <Check className="h-5 w-5 text-green-500" />
                    ) : (
                      <X className="h-5 w-5 text-red-500" />
                    ))}
                </div>
              </Button>
            ))}
          </div>
        </motion.div>
      </CardContent>

      <CardFooter className="flex items-center justify-between bg-gray-50 p-4">
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-amber-500" />
          <span className="text-sm font-medium text-gray-700">
            Điểm: {score}
          </span>
        </div>

        <Progress
          value={((currentQuestionIndex + 1) / questions.length) * 100}
          className="h-2 w-32"
        />
      </CardFooter>
    </Card>
  );
};
