"use client";

import React from "react";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { buttonVariants } from "./_animations";

interface AnswerButtonProps {
	option: string;
	correctAnswer: string;
	selectedAnswer: string | null;
	showAnswer: boolean;
	onSelect: (answer: string) => void;
}

export const AnswerButton: React.FC<AnswerButtonProps> = ({
	option,
	correctAnswer,
	selectedAnswer,
	showAnswer,
	onSelect,
}) => {
	const getButtonStyle = () => {
		if (showAnswer) {
			if (option === correctAnswer) {
				return "border-green-400 bg-green-50 text-green-700";
			} else if (selectedAnswer === option) {
				return "border-red-400 bg-red-50 text-red-700";
			} else {
				return "border-gray-200 bg-gray-50 text-gray-400";
			}
		}
		return "border-game-primary/20 bg-white hover:border-game-primary hover:bg-game-primary/5 text-game-accent shadow-sm hover:shadow";
	};

	return (
		<motion.button
			animate={
				showAnswer
					? option === correctAnswer
						? "correct"
						: selectedAnswer === option
						? "incorrect"
						: "idle"
					: "idle"
			}
			className={`relative h-16 rounded-2xl border-2 font-medium text-lg transition-all ${getButtonStyle()}`}
			disabled={showAnswer || selectedAnswer !== null}
			initial="idle"
			onClick={() => onSelect(option)}
			variants={buttonVariants}
			whileHover="hover"
			whileTap="tap"
		>
			{option}
			{showAnswer && option === correctAnswer && (
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
				option !== correctAnswer && (
					<motion.div
						animate={{ scale: 1 }}
						className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 shadow-md"
						initial={{ scale: 0 }}
					>
						<X className="h-4 w-4 text-white" />
					</motion.div>
				)}
		</motion.button>
	);
};
