"use client";

import React from "react";
import { motion } from "framer-motion";
import { ChevronRight, HelpCircle } from "lucide-react";
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
					<div className="mb-8 flex flex-col items-center space-y-4">
						<h3 className="text-xl font-medium text-game-accent">
							Chọn từ bạn nghe được
						</h3>
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

					<div className="grid grid-cols-2 gap-4">
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

					{showAnswer && isCorrect === false && (
						<div className="mt-6 flex justify-center">
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
						<div className="mt-6 flex justify-center">
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
				</motion.div>
			)}
		</motion.div>
	);
};
