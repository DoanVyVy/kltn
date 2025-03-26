"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { trpc } from "@/trpc/client";
import { LearningStats } from "./_types";
import { useAudio } from "./_hooks/useAudio";
import { NavigationHeader } from "./_components/NavigationHeader";
import { ProgressHeader } from "./_components/ProgressHeader";
import { CelebrationScreen } from "./_components/CelebrationScreen";
import Navigation from "@/components/navigation";
import { DefinitionMatching } from "./_components/Flashcard";
import { VocabularyWord } from "@prisma/client";
import { SpellingPractice } from "./_components/Typing";
import { WordCard } from "./_components/WordChoice/WordCard";

export default function LearnVocabularyPage() {
  const router = useRouter();
  const params = useParams();
  const categoryId = Number(params.id);

  // Queries - Cập nhật để lấy chính xác 10 từ vựng từ API
  const { data: vocabularyWords, isLoading: isWordsLoading } =
    trpc.category.getRandomWords.useQuery(
      {
        categoryId: categoryId,
        size: 10, // Lấy chính xác 10 từ vựng mỗi lần học
      },
      {
        enabled: !!categoryId,
        refetchOnWindowFocus: false,
      }
    );

  // Lấy thông tin về khóa học
  const { data: collection, isLoading: isCollectionLoading } =
    trpc.category.getCategoryById.useQuery(categoryId, {
      enabled: !!categoryId,
    });

  const { mutateAsync } = trpc.userProcess.userAnswerFlashcard.useMutation();

  // State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState<LearningStats>({
    correct: 0,
    incorrect: 0,
    skipped: 0,
  });
  const [showCelebration, setShowCelebration] = useState(false);

  // Chuẩn bị mảng từ vựng và từ hiện tại
  const words = vocabularyWords || [];
  const currentWord = words[currentIndex];

  const { isPlaying: isAudioPlaying, play: playAudio } = useAudio(
    currentWord?.audioUrl!
  );

  // Tạo danh sách đáp án từ dữ liệu hiện có
  let answerOptions: string[] = [];
  if (currentWord) {
    // Danh sách từ ngẫu nhiên từ danh sách từ vựng
    const otherOptions: string[] = [];
    const wordsCopy = [...words]; // Tạo bản sao để tránh thay đổi mảng gốc

    // Lọc và chỉ lấy tối đa 3 từ khác
    for (let i = 0; i < wordsCopy.length; i++) {
      if (wordsCopy[i].wordId !== currentWord.wordId) {
        otherOptions.push(wordsCopy[i].word);
        // Dừng khi đủ 3 từ
        if (otherOptions.length >= 3) break;
      }
    }

    // Tạo mảng đáp án và xáo trộn
    answerOptions = [currentWord.word, ...otherOptions];
    answerOptions.sort(() => Math.random() - 0.5);
  }

  const utils = trpc.useUtils();

  useEffect(() => {
    setProgress((currentIndex / (words?.length || 1)) * 100);
  }, [currentIndex, words?.length]);

  const handleSelectAnswer = (answer: string) => {
    if (selectedAnswer || showAnswer) return;

    setSelectedAnswer(answer);
    const correct =
      answer.toLocaleUpperCase().trim() ===
      currentWord?.word.toLocaleUpperCase().trim();
    setIsCorrect(correct);
    setStats((prev) => ({
      ...prev,
      [correct ? "correct" : "incorrect"]:
        prev[correct ? "correct" : "incorrect"] + 1,
    }));

    setShowAnswer(true);

    playAudio();
    if (correct) {
      setTimeout(() => {
        handleNext();
      }, 1500);
    }

    if (currentWord) {
      mutateAsync({
        categoryId: collection?.categoryId!,
        correct: correct,
        wordId: currentWord.wordId,
      }).finally(() => {
        utils.userProcess.getCategoryProcesses.invalidate();
      });
    }
  };

  const handleNext = () => {
    if (words && currentIndex < words.length - 1) {
      // Reset states
      setSelectedAnswer(null);
      setIsCorrect(null);
      setShowAnswer(false);

      // Animate to next word
      setCurrentIndex(currentIndex + 1);
    } else {
      // Show celebration animation
      setShowCelebration(true);
      setTimeout(() => {
        router.push(`/vocabulary/${collection?.categoryId}`);
      }, 3000);
    }
  };

  const handleShowAnswer = () => {
    setShowAnswer(true);
    setStats((prev) => ({
      ...prev,
      skipped: prev.skipped + 1,
    }));
  };

  const handlePlayAudio = () => {
    playAudio();
  };

  const handleFinish = () => {
    router.push(`/vocabulary/${collection?.categoryId}`);
  };

  const handleBack = () => {
    router.push(`/vocabulary/${collection?.categoryId}`);
  };

  // Loading state
  if (isWordsLoading || isCollectionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-game-background">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-game-primary border-t-transparent"></div>
      </div>
    );
  }

  // Kiểm tra nếu không có từ vựng nào
  if (words.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-game-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-game-accent mb-4">
            Không có từ vựng
          </h1>
          <p className="text-game-accent/70 mb-6">
            Khóa học này chưa có từ vựng nào. Vui lòng chọn khóa học khác.
          </p>
          <button
            className="game-button"
            onClick={() => router.push("/vocabulary")}
          >
            Quay lại Trang Từ Vựng
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-game-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <NavigationHeader
          collection={collection || undefined}
          onBack={handleBack}
        />

        <ProgressHeader
          currentIndex={currentIndex}
          totalItems={words?.length || 0}
          progress={progress}
          stats={stats}
        />

        <AnimatePresence mode="wait">
          {showCelebration ? (
            <CelebrationScreen stats={stats} onFinish={handleFinish} />
          ) : (
            <RandomStrategy
              {...({
                currentWord,
                answerOptions,
                currentIndex,
                showAnswer,
                isAudioPlaying,
                selectedAnswer,
                isCorrect,
                onPlayAudio: handlePlayAudio,
                onSelectAnswer: handleSelectAnswer,
                onShowAnswer: handleShowAnswer,
                onNext: handleNext,
                onSubmitAnswer: handleSelectAnswer,
              } as unknown as StrategyProps)}
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

interface StrategyProps {
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
  onSubmitAnswer: (answer: string) => void;
}
const STRATEGY = [DefinitionMatching, SpellingPractice, WordCard];
function RandomStrategy(props: StrategyProps) {
  const Component = React.useMemo(() => {
    return STRATEGY[Math.floor(Math.random() * STRATEGY.length)];
  }, [props.currentIndex]);

  // Sử dụng spread operator và as unknown as any để tránh lỗi type instantiation
  return <Component {...(props as unknown as any)} />;
}
