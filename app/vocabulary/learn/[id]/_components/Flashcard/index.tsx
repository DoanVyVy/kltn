"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Volume2,
  ChevronRight,
  HelpCircle,
  Check,
  X,
  RotateCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { containerVariants } from "../_animations";
import { buttonVariants } from "../_animations";
import { VocabularyWord } from "@prisma/client";

interface DefinitionMatchingProps {
  currentWord: VocabularyWord | undefined;
  currentIndex: number;
  showAnswer: boolean;
  isAudioPlaying: boolean;
  selectedAnswer: string | null;
  isCorrect: boolean | null;
  onPlayAudio: () => void;
  onSelectAnswer: (answer: string) => void;
  onShowAnswer: () => void;
  onNext: () => void;
}

export const DefinitionMatching: React.FC<DefinitionMatchingProps> = ({
  currentWord,
  currentIndex,
  showAnswer,
  isAudioPlaying,
  selectedAnswer,
  isCorrect,
  onPlayAudio,
  onSelectAnswer,
  onShowAnswer,
  onNext,
}) => {
  const [options, setOptions] = useState<string[]>([]);
  const [isFlipped, setIsFlipped] = useState(false);

  // Generate answer options when word changes
  useEffect(() => {
    if (!currentWord) return;

    // Include correct answer + distractors
    const allOptions = [
      currentWord.word,
      ...currentWord.paronymWords.slice(0, 3),
    ];

    setOptions(allOptions.sort(() => Math.random() - 0.5));

    // Reset flip state when word changes
    setIsFlipped(false);
  }, [currentWord]);

  const handleSelectAnswer = (answer: string) => {
    if (selectedAnswer || showAnswer) return; // Prevent multiple selections
    onSelectAnswer(answer);
  };

  const handleFlipCard = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <motion.div
      key={currentIndex}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="flex flex-col items-center"
    >
      <div className="perspective-1000 w-full max-w-2xl">
        <div className={`flippable-card ${isFlipped ? "flipped" : ""}`}>
          <div className="card-inner">
            {/* Mặt trước - Định nghĩa */}
            <Card className="card-front w-full max-w-2xl overflow-hidden bg-white rounded-3xl shadow-lg border-0">
              <div className="p-8 h-full flex flex-col">
                <div className="mb-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-medium text-game-accent">
                      Chọn từ phù hợp với định nghĩa
                    </h3>

                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full hover:bg-blue-50 text-blue-600"
                        onClick={onPlayAudio}
                      >
                        <Volume2 className="h-5 w-5" />
                      </Button>

                      {currentWord?.imageUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full hover:bg-amber-50 text-amber-600 border-amber-200 flex items-center gap-2"
                          onClick={handleFlipCard}
                        >
                          <RotateCw className="h-4 w-4" />
                          <span>Xem ảnh</span>
                        </Button>
                      )}
                    </div>
                  </div>

                  <Card className="border-2 border-gray-100 bg-gray-50 shadow-none p-6 rounded-2xl">
                    <div className="flex flex-col space-y-3">
                      {currentWord?.partOfSpeech && (
                        <Badge className="w-fit bg-blue-50 text-blue-600 border-blue-200">
                          {currentWord.partOfSpeech}
                        </Badge>
                      )}

                      <p className="text-xl text-game-accent font-medium">
                        {currentWord?.definition}
                      </p>
                    </div>
                  </Card>

                  {/* Nút phát âm thanh cải tiến */}
                  {currentWord?.audioUrl && (
                    <div className="mt-4 flex justify-center">
                      <button
                        onClick={onPlayAudio}
                        className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all ${
                          isAudioPlaying
                            ? "bg-game-primary text-white animate-pulse"
                            : "bg-game-primary/10 text-game-primary hover:bg-game-primary/20"
                        }`}
                      >
                        <Volume2 className="h-5 w-5" />
                        <span className="font-medium">
                          {isAudioPlaying ? "Đang phát..." : "Nghe phát âm"}
                        </span>
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6 flex-grow">
                  {options.map((option) => (
                    <motion.button
                      key={option}
                      onClick={() => handleSelectAnswer(option)}
                      className={`
                        relative h-16 rounded-2xl border-2 font-medium text-lg transition-all
                        ${
                          showAnswer
                            ? option === currentWord?.word
                              ? "border-green-400 bg-green-50 text-green-700"
                              : selectedAnswer === option
                              ? "border-red-400 bg-red-50 text-red-700"
                              : "border-gray-200 bg-gray-50 text-gray-400"
                            : "border-game-primary/20 bg-white hover:border-game-primary hover:bg-game-primary/5 text-game-accent shadow-sm hover:shadow"
                        }
                      `}
                      disabled={showAnswer || selectedAnswer !== null}
                      animate={
                        showAnswer
                          ? option === currentWord?.word
                            ? "correct"
                            : selectedAnswer === option
                            ? "incorrect"
                            : "idle"
                          : "idle"
                      }
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                    >
                      {option}
                      {showAnswer && option === currentWord?.word && (
                        <motion.div
                          animate={{ scale: 1 }}
                          className="absolute -right-2 -top-2 rounded-full bg-green-500 p-1 shadow-md"
                          initial={{ scale: 0 }}
                        >
                          <Check className="h-4 w-4 text-white" />
                        </motion.div>
                      )}
                      {showAnswer &&
                        selectedAnswer === option &&
                        option !== currentWord?.word && (
                          <motion.div
                            animate={{ scale: 1 }}
                            className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 shadow-md"
                            initial={{ scale: 0 }}
                          >
                            <X className="h-4 w-4 text-white" />
                          </motion.div>
                        )}
                    </motion.button>
                  ))}
                </div>

                <div className="mt-auto">
                  {showAnswer && (
                    <div className="flex justify-center">
                      <Button
                        className="game-button rounded-full px-6"
                        onClick={onNext}
                      >
                        Từ tiếp theo
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  )}

                  {!showAnswer && !selectedAnswer && (
                    <div className="flex justify-center">
                      <Button
                        className="rounded-full px-6 border-amber-400 bg-amber-50 text-amber-600 hover:bg-amber-100"
                        onClick={onShowAnswer}
                        variant="outline"
                      >
                        <HelpCircle className="mr-2 h-4 w-4" />
                        Hiện đáp án
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Mặt sau - Hình ảnh minh họa */}
            {currentWord?.imageUrl && (
              <Card className="card-back w-full max-w-2xl overflow-hidden bg-white rounded-3xl shadow-lg border-0">
                <div className="p-8">
                  <div className="mb-4 flex justify-between items-start">
                    <h3 className="text-xl font-medium text-game-accent">
                      Hình ảnh minh họa cho "{currentWord.word}"
                    </h3>

                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full hover:bg-blue-50 text-blue-600 border-blue-200 flex items-center gap-2"
                      onClick={handleFlipCard}
                    >
                      <RotateCw className="h-4 w-4" />
                      <span>Quay lại</span>
                    </Button>
                  </div>

                  <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center min-h-[320px]">
                    <img
                      src={currentWord.imageUrl}
                      alt={`Hình ảnh minh họa cho ${currentWord.word}`}
                      className="max-h-[300px] w-auto object-contain"
                    />
                  </div>

                  <div className="mt-6 flex flex-col gap-4">
                    <div className="flex flex-col">
                      <div>
                        <p className="text-2xl font-medium text-game-accent">
                          {currentWord.word}
                        </p>
                        {currentWord.pronunciation && (
                          <p className="text-sm text-gray-500 mb-2">
                            {currentWord.pronunciation}
                          </p>
                        )}
                      </div>

                      {currentWord?.audioUrl && (
                        <button
                          onClick={onPlayAudio}
                          className={`mt-4 self-start flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                            isAudioPlaying
                              ? "bg-game-primary text-white animate-pulse"
                              : "bg-game-primary/10 text-game-primary hover:bg-game-primary/20"
                          }`}
                        >
                          <Volume2 className="h-5 w-5" />
                          <span>
                            {isAudioPlaying ? "Đang phát..." : "Nghe phát âm"}
                          </span>
                        </button>
                      )}
                    </div>

                    {showAnswer && (
                      <Button
                        className="game-button rounded-full px-6 mt-4"
                        onClick={onNext}
                      >
                        Từ tiếp theo
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Hiển thị phần ví dụ và video chỉ khi không ở chế độ lật thẻ */}
      {showAnswer && currentWord && !isFlipped && isCorrect === false && (
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 w-full max-w-2xl rounded-3xl bg-white p-6 shadow-md"
          initial={{ opacity: 0, y: 20 }}
        >
          <h4 className="mb-2 font-medium text-game-accent">Ví dụ:</h4>
          <p
            className="text-game-accent/70"
            dangerouslySetInnerHTML={{
              __html: (currentWord.exampleSentence || "").replace(
                "____",
                `<span class="font-bold text-game-primary">${currentWord.word}</span>`
              ),
            }}
          />

          {/* Hiển thị video nếu có */}
          {currentWord.videoUrl && (
            <div className="mt-4">
              <h4 className="mb-2 font-medium text-game-accent">
                Video minh họa:
              </h4>
              <div className="overflow-hidden rounded-lg border border-gray-200">
                <iframe
                  src={currentWord.videoUrl}
                  title={`Video minh họa cho ${currentWord.word}`}
                  className="aspect-video w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          )}

          {currentWord.pronunciation && (
            <p className="mt-4 text-sm text-gray-500">
              Phát âm:{" "}
              <span className="font-medium">{currentWord.pronunciation}</span>
            </p>
          )}

          {/* Thêm nút tiếp tục bên dưới */}
          <div className="mt-6 flex justify-center">
            <Button className="game-button rounded-full px-6" onClick={onNext}>
              Từ tiếp theo
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};
