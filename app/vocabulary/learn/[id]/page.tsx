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

	// Queries
	const { data: words, isLoading: isWordsLoading } =
		trpc.vocabularyCategory.getRandomWords.useQuery({
			take: 5,
			categoryId,
		});

	const { data: collection, isLoading: isCollectionLoading } =
		trpc.vocabularyCategory.getVocabularyCategoryById.useQuery(categoryId);

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

	const currentWord = words?.[currentIndex];
	const { isPlaying: isAudioPlaying, play: playAudio } = useAudio(
		currentWord?.audioUrl!
	);

	const answerOptions = React.useMemo(() => {
		if (!currentWord) return [];
		return [currentWord.word, ...currentWord.paronymWords.slice(0, 3)].sort(
			() => Math.random() - 0.5
		);
	}, [currentWord]);
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
		console.log("Playing audio");
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
		return <div>Loading...</div>;
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
						<CelebrationScreen
							stats={stats}
							onFinish={handleFinish}
						/>
					) : (
						<RandomStrategy
							currentWord={currentWord}
							answerOptions={answerOptions}
							currentIndex={currentIndex}
							showAnswer={showAnswer}
							isAudioPlaying={isAudioPlaying}
							selectedAnswer={selectedAnswer}
							isCorrect={isCorrect}
							onPlayAudio={handlePlayAudio}
							onSelectAnswer={handleSelectAnswer}
							onShowAnswer={handleShowAnswer}
							onNext={handleNext}
							onSubmitAnswer={handleSelectAnswer}
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
	return <Component {...(props as any)} />;
}
