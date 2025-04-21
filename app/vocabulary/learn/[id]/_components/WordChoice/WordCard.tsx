"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronRight, HelpCircle, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AudioButton } from "./AudioButton";
import { AnswerButton } from "../AnswerButton";
import { containerVariants } from "../_animations";
import { VocabularyWord } from "@prisma/client";

interface WordCardProps {
  currentWord: VocabularyWord | undefined;
  answerOptions: string[];
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

export const WordCard: React.FC<WordCardProps> = ({
  currentWord,
  answerOptions,
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
  const [isFlipped, setIsFlipped] = useState(false);

  // Reset flip state when word changes
  useEffect(() => {
    setIsFlipped(false);
  }, [currentIndex, currentWord]);

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
            {/* Mặt trước - Từ vựng */}
            <Card className="card-front w-full max-w-2xl overflow-hidden bg-white rounded-3xl shadow-lg border-0">
              <div className="p-8 h-full flex flex-col">
                <div className="mb-6 flex flex-col items-center space-y-4">
                  <div className="flex justify-between items-center w-full">
                    <h3 className="text-xl font-medium text-game-accent">
                      Chọn từ bạn nghe được
                    </h3>

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

                  <AudioButton
                    isPlaying={isAudioPlaying}
                    onClick={onPlayAudio}
                  />

                  {showAnswer && currentWord && (
                    <motion.div
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center"
                      initial={{ opacity: 0, y: -20 }}
                    >
                      <p className="text-2xl font-medium text-game-accent">
                        {currentWord.word}
                      </p>
                      <p className="text-sm text-game-accent/70">
                        {currentWord.pronunciation}
                      </p>
                    </motion.div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 flex-grow">
                  {answerOptions.map((option) => (
                    <AnswerButton
                      key={option}
                      option={option}
                      correctAnswer={currentWord?.word || ""}
                      selectedAnswer={selectedAnswer}
                      showAnswer={showAnswer}
                      onSelect={onSelectAnswer}
                    />
                  ))}
                </div>

                <div className="mt-auto pt-4">
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

                  {!showAnswer && (
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

                      <AudioButton
                        isPlaying={isAudioPlaying}
                        onClick={onPlayAudio}
                        className="mt-4 self-start"
                      />
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
        </motion.div>
      )}
    </motion.div>
  );
};
