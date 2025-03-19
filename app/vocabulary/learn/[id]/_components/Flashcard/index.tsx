"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Volume2, ChevronRight, HelpCircle, Check, X } from "lucide-react";
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

	// Generate answer options when word changes
	useEffect(() => {
		if (!currentWord) return;

		// Include correct answer + distractors
		const allOptions = [
			currentWord.word,
			...currentWord.paronymWords.slice(0, 3),
		];

		// Randomize order
		setOptions(allOptions.sort(() => Math.random() - 0.5));
	}, [currentWord]);

	const handleSelectAnswer = (answer: string) => {
		if (selectedAnswer || showAnswer) return; // Prevent multiple selections
		onSelectAnswer(answer);
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
			<Card className="w-full max-w-2xl overflow-hidden bg-white rounded-3xl shadow-lg border-0">
				<div className="p-8">
					<div className="mb-8 space-y-4">
						<div className="flex justify-between items-start">
							<h3 className="text-xl font-medium text-game-accent">
								Chọn từ phù hợp với định nghĩa
							</h3>

							<Button
								variant="ghost"
								size="icon"
								className="rounded-full hover:bg-blue-50 text-blue-600"
								onClick={onPlayAudio}
							>
								<Volume2 className="h-5 w-5" />
							</Button>
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
					</div>

					<div className="grid grid-cols-2 gap-4 mb-6">
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

					{showAnswer && !isCorrect && (
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
			</Card>

			{showAnswer && currentWord && (
				<motion.div
					animate={{ opacity: 1, y: 0 }}
					className="mt-6 w-full max-w-2xl rounded-3xl bg-white p-6 shadow-md"
					initial={{ opacity: 0, y: 20 }}
				>
					<h4 className="mb-2 font-medium text-game-accent">
						Ví dụ:
					</h4>
					<p
						className="text-game-accent/70"
						dangerouslySetInnerHTML={{
							__html: (currentWord.exampleSentence || "").replace(
								"____",
								`<span class="font-bold text-game-primary">${currentWord.word}</span>`
							),
						}}
					/>
					{currentWord.pronunciation && (
						<p className="mt-2 text-sm text-gray-500">
							Phát âm:{" "}
							<span className="font-medium">
								{currentWord.pronunciation}
							</span>
						</p>
					)}
				</motion.div>
			)}
		</motion.div>
	);
};
