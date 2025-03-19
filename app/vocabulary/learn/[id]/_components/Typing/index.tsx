"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
	Volume2,
	ChevronRight,
	Check,
	X,
	Lightbulb,
	Delete,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { containerVariants } from "../_animations";
import { VocabularyWord } from "@prisma/client";

interface SpellingPracticeProps {
	currentWord: VocabularyWord | undefined;
	currentIndex: number;
	showAnswer: boolean;
	isAudioPlaying: boolean;
	isCorrect: boolean | null;
	onPlayAudio: () => void;
	onSubmitAnswer: (answer: string) => void;
	onShowAnswer: () => void;
	onNext: () => void;
}

export const SpellingPractice: React.FC<SpellingPracticeProps> = ({
	currentWord,
	currentIndex,
	showAnswer,
	isAudioPlaying,
	isCorrect,
	onPlayAudio,
	onSubmitAnswer,
	onShowAnswer,
	onNext,
}) => {
	const [inputValue, setInputValue] = useState("");
	const [revealedHint, setRevealedHint] = useState<string>("");
	const [hintCount, setHintCount] = useState(0);
	const [cursorBlinking, setCursorBlinking] = useState(true);
	const inputRef = useRef<HTMLDivElement>(null);

	const keyboardLetters = React.useMemo(() => {
		if (!currentWord) return [];
		const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
		const keyboard = currentWord.word.toLocaleUpperCase().split("");
		const remainingLetters = alphabet
			.split("")
			.filter((letter) => !keyboard.includes(letter));
		for (let i = 0; i < 5; i++) {
			keyboard.push(
				remainingLetters[
					Math.floor(Math.random() * remainingLetters.length)
				]
			);
		}
		keyboard.sort(() => Math.random() - 0.5);
		return keyboard;
	}, [currentWord]);

	// Reset state when word changes
	useEffect(() => {
		setInputValue("");
		setRevealedHint("");
		setHintCount(0);
		setCursorBlinking(true);
	}, [currentWord]);

	// Auto focus input when component mounts
	useEffect(() => {
		if (inputRef.current) {
			inputRef.current.focus();
		}

		// Set up event listener for keyboard input
		const handleKeyDown = (e: KeyboardEvent) => {
			if (showAnswer) return;

			if (e.key === "Backspace") {
				setInputValue((prev) => prev.slice(0, -1));
			} else if (e.key.length === 1 && e.key.match(/^[a-zA-Z]$/)) {
				setInputValue((prev) => prev + e.key.toUpperCase());
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [showAnswer]);

	const handleKeyboardInput = (letter: string) => {
		if (showAnswer) return;
		setInputValue((prev) => prev + letter);
		setCursorBlinking(true);
		if (inputRef.current) {
			inputRef.current.focus();
		}
	};

	const handleDelete = () => {
		if (showAnswer) return;
		setInputValue((prev) => prev.slice(0, -1));
		setCursorBlinking(true);
	};

	const handleSubmit = (e?: React.FormEvent) => {
		if (e) e.preventDefault();
		if (!inputValue.trim() || showAnswer) return;

		setCursorBlinking(false);
		onSubmitAnswer(inputValue.trim());
	};

	const handleHint = () => {
		if (!currentWord || showAnswer) return;

		const wordLetters = currentWord.word.toUpperCase().split("");
		if (hintCount < wordLetters.length) {
			setHintCount((prev) => prev + 1);
			setRevealedHint(wordLetters.slice(0, hintCount + 1).join(""));

			// Update input value with the hint
			if (inputValue.length < hintCount + 1) {
				setInputValue(wordLetters.slice(0, hintCount + 1).join(""));
			}
		}
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
					<div className="mb-8 flex flex-col items-center space-y-4">
						<h3 className="text-xl font-medium text-game-accent">
							Gõ vào những gì bạn nghe thấy
						</h3>
						<motion.button
							animate={
								isAudioPlaying
									? {
											scale: [1, 1.2, 1],
											boxShadow: [
												"0 0 0 rgba(215, 108, 130, 0)",
												"0 0 20px rgba(215, 108, 130, 0.7)",
												"0 0 0 rgba(215, 108, 130, 0)",
											],
									  }
									: {}
							}
							className="h-32 w-32 rounded-full bg-gradient-to-r from-game-primary to-game-secondary text-white transition-all"
							onClick={onPlayAudio}
							transition={{ duration: 0.5 }}
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							disabled={showAnswer}
						>
							<Volume2 className="h-16 w-16 mx-auto" />
						</motion.button>
					</div>

					<div className="mb-6">
						<div
							ref={inputRef}
							className="relative w-full h-16 rounded-2xl border-2 border-gray-200 bg-gray-50 focus-within:border-game-primary focus-within:ring-1 focus-within:ring-game-primary/30 transition-all duration-200 overflow-hidden"
							tabIndex={showAnswer ? -1 : 0}
							onFocus={() => setCursorBlinking(true)}
							onBlur={() => setCursorBlinking(false)}
						>
							{revealedHint && !inputValue && (
								<div className="absolute inset-0 flex items-center justify-center text-gray-400 pointer-events-none text-xl">
									{revealedHint}
									<span className="ml-1 opacity-30">...</span>
								</div>
							)}

							{!inputValue && !revealedHint && (
								<div className="absolute inset-0 flex items-center justify-center text-gray-400 pointer-events-none text-xl">
									Nhập từ ở đây
								</div>
							)}

							<div className="absolute inset-0 flex items-center justify-center space-x-1 px-4">
								{inputValue.split("").map((char, index) => (
									<motion.span
										key={index}
										initial={{ opacity: 0, y: 10 }}
										animate={{ opacity: 1, y: 0 }}
										className="text-2xl font-medium text-game-accent"
									>
										{char}
									</motion.span>
								))}
								{cursorBlinking && !showAnswer && (
									<motion.span
										animate={{ opacity: [1, 0, 1] }}
										transition={{
											duration: 1.2,
											repeat: Infinity,
											repeatType: "loop",
										}}
										className="inline-block w-0.5 h-8 bg-game-primary mx-1"
									/>
								)}
							</div>
						</div>
					</div>

					<div className="space-y-2 mb-6 flex flex-wrap justify-center gap-2 px-8">
						{keyboardLetters.map((letter, rowIndex) => (
							<motion.button
								key={letter}
								onClick={() => handleKeyboardInput(letter)}
								className="w-12 h-12 rounded-xl border-2 border-gray-200 bg-white text-game-accent text-lg font-medium hover:bg-gray-50 hover:border-game-primary/50 active:bg-gray-100 transition-all"
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
								disabled={showAnswer}
							>
								{letter}
							</motion.button>
						))}
						<motion.button
							onClick={handleDelete}
							className="w-12 h-12 rounded-xl border-2 border-gray-200 bg-white text-red-500 hover:bg-red-50 hover:border-red-300 transition-all flex items-center justify-center"
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							disabled={showAnswer || inputValue.length === 0}
						>
							<Delete className="h-5 w-5" />
						</motion.button>
					</div>

					{!showAnswer ? (
						<div className="flex justify-center space-x-3">
							<Button
								className="game-button rounded-full px-6 py-6 text-base"
								onClick={handleSubmit}
								disabled={!inputValue.trim()}
							>
								Kiểm tra
								<Check className="ml-2 h-5 w-5" />
							</Button>
							<Button
								onClick={handleHint}
								className="rounded-full px-6 py-6 text-base border-amber-400 bg-amber-50 text-amber-600 hover:bg-amber-100"
								variant="outline"
								disabled={
									showAnswer ||
									(currentWord &&
										hintCount >= currentWord.word.length)
								}
							>
								<Lightbulb className="mr-2 h-5 w-5" />
								Gợi ý
							</Button>
						</div>
					) : (
						<div className="text-center">
							{isCorrect ? (
								<motion.div
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									className="p-4 rounded-xl bg-green-50 border-2 border-green-200 text-green-600 mb-6"
								>
									<Check className="inline-block mr-2 h-5 w-5" />
									Chính xác! Từ vựng:{" "}
									<span className="font-bold">
										{currentWord?.word}
									</span>
								</motion.div>
							) : (
								<motion.div
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									className="p-4 rounded-xl bg-red-50 border-2 border-red-200 text-red-600 mb-6"
								>
									<X className="inline-block mr-2 h-5 w-5" />
									Chưa đúng. Từ vựng đúng là:{" "}
									<span className="font-bold">
										{currentWord?.word}
									</span>
								</motion.div>
							)}

							<Button
								className="game-button rounded-full px-6 py-6 text-base"
								onClick={onNext}
							>
								Từ tiếp theo
								<ChevronRight className="ml-2 h-5 w-5" />
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
