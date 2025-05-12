import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, X, HelpCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import confetti from "canvas-confetti";
import { dispatchAppEvent } from "@/events/handlers";

// Exercise types
export type ExerciseType =
	| "multipleChoice"
	| "fillBlank"
	| "reorder"
	| "trueFalse";

export interface GrammarExercise {
	id: number;
	type: ExerciseType;
	question: string;
	options?: string[];
	answer: string | string[];
	explanation: string;
	hint?: string;
}

interface GrammarExerciseProps {
	exercise: GrammarExercise;
	onComplete: (correct: boolean) => void;
	onNext: () => void;
}

export function GrammarExercise({
	exercise,
	onComplete,
	onNext,
}: GrammarExerciseProps) {
	const [userAnswer, setUserAnswer] = useState<string>("");
	const [userReorderAnswer, setUserReorderAnswer] = useState<string[]>([]);
	const [showResult, setShowResult] = useState(false);
	const [isCorrect, setIsCorrect] = useState(false);
	const [showHint, setShowHint] = useState(false);

	// Reset state when exercise changes
	useEffect(() => {
		setUserAnswer("");
		setUserReorderAnswer([]);
		setShowResult(false);
		setIsCorrect(false);
		setShowHint(false);
	}, [exercise?.id]);

	// Handle submit answer
	const handleSubmit = () => {
		let correct = false;

		switch (exercise.type) {
			case "multipleChoice":
			case "trueFalse":
				correct = userAnswer === exercise.answer;
				break;
			case "fillBlank":
				// For fill blank, we check if the answer is included in possible answers
				const possibleAnswers = Array.isArray(exercise.answer)
					? exercise.answer
					: [exercise.answer];
				correct = possibleAnswers.some(
					(answer) =>
						userAnswer.toLowerCase().trim() ===
						answer.toLowerCase().trim()
				);
				break;
			case "reorder":
				correct =
					JSON.stringify(userReorderAnswer) ===
					JSON.stringify(exercise.answer);
				break;
		}

		setIsCorrect(correct);
		if (correct) {
			dispatchAppEvent({
				eventType: "learned_grammar",
				payload: {
					correct: correct,
					grammarId: exercise.id,
					categoryId: exercise.id,
				},
				timestamp: new Date(),
			});
		}
		setShowResult(true);
		onComplete(correct);

		if (correct) {
			triggerConfetti();
		}
	};

	// Trigger confetti effect when correct
	const triggerConfetti = () => {
		confetti({
			particleCount: 100,
			spread: 70,
			origin: { y: 0.6 },
		});
	};

	// Reorder functionality - move item up in the array
	const moveUp = (index: number) => {
		if (index <= 0) return;
		const newOrder = [...userReorderAnswer];
		const temp = newOrder[index - 1];
		newOrder[index - 1] = newOrder[index];
		newOrder[index] = temp;
		setUserReorderAnswer(newOrder);
	};

	// Reorder functionality - move item down in the array
	const moveDown = (index: number) => {
		if (index >= userReorderAnswer.length - 1) return;
		const newOrder = [...userReorderAnswer];
		const temp = newOrder[index + 1];
		newOrder[index + 1] = newOrder[index];
		newOrder[index] = temp;
		setUserReorderAnswer(newOrder);
	};

	// Handle words being selected for reordering
	const handleWordSelect = (word: string) => {
		if (userReorderAnswer.includes(word)) {
			setUserReorderAnswer(userReorderAnswer.filter((w) => w !== word));
		} else {
			setUserReorderAnswer([...userReorderAnswer, word]);
		}
	};

	// Prepare reorder words from the answer
	useEffect(() => {
		if (
			exercise?.type === "reorder" &&
			Array.isArray(exercise.answer) &&
			userReorderAnswer.length === 0
		) {
			// Shuffle the answer array to create a scrambled version
			const shuffled = [...exercise.answer].sort(
				() => Math.random() - 0.5
			);
			setUserReorderAnswer(shuffled);
		}
	}, [exercise]);

	// Render the exercise based on type
	const renderExercise = () => {
		switch (exercise.type) {
			case "multipleChoice":
				return (
					<RadioGroup
						value={userAnswer}
						onValueChange={setUserAnswer}
					>
						{exercise.options?.map((option, index) => (
							<div
								key={index}
								className="flex items-center space-x-2 rounded-md p-2 hover:bg-gray-50"
							>
								<RadioGroupItem
									value={option}
									id={`option-${index}`}
								/>
								<Label
									htmlFor={`option-${index}`}
									className="w-full cursor-pointer"
								>
									{option}
								</Label>
							</div>
						))}
					</RadioGroup>
				);

			case "fillBlank":
				return (
					<div className="space-y-4">
						<p className="whitespace-pre-line text-gray-700">
							{exercise.question}
						</p>
						<Input
							placeholder="Nhập câu trả lời..."
							value={userAnswer}
							onChange={(e) => setUserAnswer(e.target.value)}
							className="w-full"
							data-testid="fill-blank-input"
						/>
					</div>
				);

			case "reorder":
				return (
					<div className="space-y-4">
						<p className="mb-4 text-gray-700">
							{exercise.question}
						</p>
						<div className="space-y-2">
							{userReorderAnswer.map((word, index) => (
								<div
									key={index}
									className="flex items-center gap-2 rounded-md border bg-white p-2"
								>
									<span className="text-sm text-gray-500">
										{index + 1}.
									</span>
									<span className="flex-1">{word}</span>
									<div className="flex gap-1">
										<Button
											size="sm"
											variant="outline"
											onClick={() => moveUp(index)}
											disabled={index === 0}
											className="h-8 w-8 p-0"
										>
											↑
										</Button>
										<Button
											size="sm"
											variant="outline"
											onClick={() => moveDown(index)}
											disabled={
												index ===
												userReorderAnswer.length - 1
											}
											className="h-8 w-8 p-0"
										>
											↓
										</Button>
									</div>
								</div>
							))}
						</div>
					</div>
				);

			case "trueFalse":
				return (
					<RadioGroup
						value={userAnswer}
						onValueChange={setUserAnswer}
					>
						<div className="flex items-center space-x-2 rounded-md p-2 hover:bg-gray-50">
							<RadioGroupItem value="true" id="option-true" />
							<Label
								htmlFor="option-true"
								className="w-full cursor-pointer"
							>
								Đúng
							</Label>
						</div>
						<div className="flex items-center space-x-2 rounded-md p-2 hover:bg-gray-50">
							<RadioGroupItem value="false" id="option-false" />
							<Label
								htmlFor="option-false"
								className="w-full cursor-pointer"
							>
								Sai
							</Label>
						</div>
					</RadioGroup>
				);

			default:
				return <p>Loại bài tập không được hỗ trợ.</p>;
		}
	};

	return (
		<Card className="overflow-hidden">
			<CardHeader className="bg-white pb-4">
				<div className="flex items-center justify-between">
					<Badge
						variant="outline"
						className="mb-2 bg-blue-50 text-blue-700"
					>
						{exercise.type === "multipleChoice" && "Trắc nghiệm"}
						{exercise.type === "fillBlank" && "Điền vào chỗ trống"}
						{exercise.type === "reorder" && "Sắp xếp câu"}
						{exercise.type === "trueFalse" && "Đúng/Sai"}
					</Badge>
					{exercise.hint && (
						<Button
							variant="ghost"
							size="sm"
							className="text-amber-500 hover:text-amber-600"
							onClick={() => setShowHint(!showHint)}
						>
							<HelpCircle className="h-4 w-4" />
							<span className="ml-1">Gợi ý</span>
						</Button>
					)}
				</div>
				<CardTitle className="text-lg text-game-accent">
					{exercise.type !== "fillBlank"
						? exercise.question
						: "Điền từ thích hợp"}
				</CardTitle>
				{showHint && exercise.hint && (
					<motion.div
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: "auto" }}
						exit={{ opacity: 0, height: 0 }}
						className="mt-2 rounded-md bg-amber-50 p-2 text-sm text-amber-700"
					>
						{exercise.hint}
					</motion.div>
				)}
			</CardHeader>

			<CardContent className="p-6">
				<div className="space-y-4">
					{renderExercise()}

					{showResult && (
						<motion.div
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							className={`mt-4 rounded-md p-4 ${
								isCorrect ? "bg-green-50" : "bg-red-50"
							}`}
						>
							<div className="flex items-start">
								{isCorrect ? (
									<Check className="mr-3 h-5 w-5 shrink-0 text-green-500" />
								) : (
									<X className="mr-3 h-5 w-5 shrink-0 text-red-500" />
								)}
								<div>
									<p
										className={`font-medium ${
											isCorrect
												? "text-green-700"
												: "text-red-700"
										}`}
									>
										{isCorrect
											? "Chính xác!"
											: "Chưa chính xác"}
									</p>
									<p className="mt-1 text-sm">
										{exercise.explanation}
									</p>
									{!isCorrect && (
										<p className="mt-2 font-medium">
											Đáp án đúng:{" "}
											{Array.isArray(exercise.answer)
												? exercise.answer.join(", ")
												: exercise.answer}
										</p>
									)}
								</div>
							</div>
						</motion.div>
					)}
				</div>
			</CardContent>

			<CardFooter className="flex justify-end gap-2 bg-gray-50 p-4">
				{!showResult ? (
					<Button
						className="game-button"
						onClick={handleSubmit}
						disabled={
							(exercise.type === "fillBlank" && !userAnswer) ||
							(exercise.type !== "fillBlank" &&
								!userAnswer &&
								exercise.type !== "reorder") ||
							(exercise.type === "reorder" &&
								userReorderAnswer.length === 0)
						}
					>
						Kiểm tra
					</Button>
				) : (
					<Button className="game-button" onClick={onNext}>
						Tiếp theo <ArrowRight className="ml-2 h-4 w-4" />
					</Button>
				)}
			</CardFooter>
		</Card>
	);
}
