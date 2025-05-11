"use client";

import React, { useState, useEffect, useRef, use } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
	ArrowLeft,
	Clock,
	Trophy,
	Check,
	RefreshCw,
	HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/navigation";
import { useQuery } from "@tanstack/react-query";
import { CollectionDetail, VocabularyWord } from "@prisma/client";

// Dữ liệu mẫu cho trò chơi từ vựng
const DEFAULT = {
	id: 1,
	courseId: 1,
	courseTitle: "500 Từ vựng TOEIC cơ bản",
	sectionTitle: "Chủ đề: Văn phòng và Công sở",
	timeLimit: 180, // seconds
	gridSize: 4,
	words: [
		{ word: "PERSONNEL", definition: "nhân sự", found: false },
		{ word: "DEADLINE", definition: "thời hạn", found: false },
		{ word: "MEETING", definition: "cuộc họp", found: false },
		{ word: "OFFICE", definition: "văn phòng", found: false },
		{ word: "MANAGER", definition: "người quản lý", found: false },
		{ word: "REPORT", definition: "báo cáo", found: false },
		{ word: "SALARY", definition: "lương", found: false },
		{ word: "TEAM", definition: "đội nhóm", found: false },
	],
};
type GameData = typeof DEFAULT;
type Word = { word: string; definition: string; found: boolean };

// Tạo bảng chữ cái ngẫu nhiên với các từ được giấu bên trong
const generateLetterGrid = (size: number, words: string[]) => {
	// Tạo ma trận trống
	const grid: string[][] = Array(size)
		.fill(null)
		.map(() => Array(size).fill(""));

	// Danh sách các hướng có thể đặt từ
	const directions = [
		[0, 1], // ngang
		[1, 0], // dọc
		[1, 1], // chéo xuống
		[-1, 1], // chéo lên
	];

	// Thử đặt từng từ vào bảng
	for (const word of words) {
		let placed = false;
		let attempts = 0;

		while (!placed && attempts < 100) {
			attempts++;

			// Chọn hướng ngẫu nhiên
			const direction =
				directions[Math.floor(Math.random() * directions.length)];

			// Chọn vị trí bắt đầu
			const startRow = Math.floor(Math.random() * size);
			const startCol = Math.floor(Math.random() * size);

			// Kiểm tra xem từ có thể đặt được không
			if (canPlaceWord(grid, word, startRow, startCol, direction, size)) {
				placeWord(grid, word, startRow, startCol, direction);
				placed = true;
			}
		}
	}

	// Điền các ô trống bằng chữ cái ngẫu nhiên
	for (let i = 0; i < size; i++) {
		for (let j = 0; j < size; j++) {
			if (grid[i][j] === "") {
				grid[i][j] = String.fromCharCode(
					65 + Math.floor(Math.random() * 26)
				); // A-Z
			}
		}
	}

	return grid;
};

// Kiểm tra xem từ có thể đặt được không
const canPlaceWord = (
	grid: string[][],
	word: string,
	startRow: number,
	startCol: number,
	direction: number[],
	size: number
) => {
	const [dRow, dCol] = direction;

	// Kiểm tra xem từ có nằm trong bảng không
	if (
		startRow + dRow * (word.length - 1) >= size ||
		startRow + dRow * (word.length - 1) < 0 ||
		startCol + dCol * (word.length - 1) >= size ||
		startCol + dCol * (word.length - 1) < 0
	) {
		return false;
	}

	// Kiểm tra xem từ có chồng lên từ khác không
	for (let i = 0; i < word.length; i++) {
		const row = startRow + dRow * i;
		const col = startCol + dCol * i;

		if (grid[row][col] !== "" && grid[row][col] !== word[i]) {
			return false;
		}
	}

	return true;
};

// Đặt từ vào bảng
const placeWord = (
	grid: string[][],
	word: string,
	startRow: number,
	startCol: number,
	direction: number[]
) => {
	const [dRow, dCol] = direction;

	for (let i = 0; i < word.length; i++) {
		const row = startRow + dRow * i;
		const col = startCol + dCol * i;
		grid[row][col] = word[i];
	}
};

// Tạo dữ liệu cho bảng chữ cái
const createGridData = (
	words: { word: string; definition: string; found: boolean }[]
) => {
	const wordList = words.map((w) => w.word);
	const grid = generateLetterGrid(8, wordList);

	return grid.map((row, rowIndex) =>
		row.map((letter, colIndex) => ({
			id: `${rowIndex}-${colIndex}`,
			letter,
			row: rowIndex,
			col: colIndex,
			selected: false,
		}))
	);
};

type Grid = ReturnType<typeof createGridData>;

export default function VocabularyGamePage(
    props: {
        params: Promise<{ id: string }>;
    }
) {
    const params = use(props.params);
    const router = useRouter();
    const [timeLeft, setTimeLeft] = useState(360);
    const [gameOver, setGameOver] = useState(false);
    const [gameCompleted, setGameCompleted] = useState(false);
    const [score, setScore] = useState(0);
    const [grid, setGrid] = useState<Grid>([]);
    const [words, setWords] = useState<Word[]>([]);
    const [selectedCells, setSelectedCells] = useState<
		{ id: string; row: number; col: number }[]
	>([]);
    const [currentWord, setCurrentWord] = useState("");
    const [message, setMessage] = useState<{
		text: string;
		type: "success" | "error" | "info";
	} | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [showHint, setShowHint] = useState(false);
    const { data, isLoading: isDataLoading } = useQuery<
		(CollectionDetail & {
			word: VocabularyWord;
		})[]
	>({
		queryKey: ["vocabCollectionFlashcard", params.id],
		queryFn: () =>
			fetch(`/api/vocab_collection/${params.id}/flashcard`).then((res) =>
				res.json()
			),
	});
    function reset() {
		if (!data) return;
		setWords(
			data.map((word) => ({
				word: word.word.word.toUpperCase(),
				definition: word.word.definition,
				found: false,
			})) as any
		);
		setGrid(
			() =>
				createGridData(
					data.map((word) => ({
						word: word.word.word.toUpperCase(),
						definition: word.word.definition,
						found: false,
					}))
				) as any
		);
		setTimeLeft(360);
	}
    React.useEffect(() => {
		if (!data) return;
		reset();
	}, [data]);

    const gridRef = useRef<HTMLDivElement>(null);

    // Đếm ngược thời gian
    useEffect(() => {
		if (gameOver || gameCompleted) return;

		const timer = setInterval(() => {
			setTimeLeft((prev) => {
				if (prev <= 1) {
					clearInterval(timer);
					setGameOver(true);
					return 0;
				}
				return prev - 1;
			});
		}, 1000);

		return () => clearInterval(timer);
	}, [gameOver, gameCompleted]);

    // Kiểm tra xem trò chơi đã hoàn thành chưa
    useEffect(() => {
		if (words!.every((word) => word.found)) {
			setGameCompleted(true);
		}
	}, [words]);

    // Hiển thị thông báo trong 2 giây
    useEffect(() => {
		if (message) {
			const timer = setTimeout(() => {
				setMessage(null);
			}, 2000);

			return () => clearTimeout(timer);
		}
	}, [message]);

    // Xử lý khi người dùng bắt đầu kéo
    const handleMouseDown = (cellId: string, row: number, col: number) => {
		if (gameOver || gameCompleted) return;

		setIsDragging(true);
		setSelectedCells([{ id: cellId, row, col }]);
		setCurrentWord(grid[row][col].letter);
	};

    // Xử lý khi người dùng di chuyển chuột
    const handleMouseEnter = (cellId: string, row: number, col: number) => {
		if (!isDragging || gameOver || gameCompleted) return;

		// Kiểm tra xem ô đã được chọn chưa
		if (selectedCells.some((cell) => cell.id === cellId)) return;

		// Kiểm tra xem ô mới có liền kề với ô cuối cùng không
		const lastCell = selectedCells[selectedCells.length - 1];
		const isAdjacent =
			Math.abs(row - lastCell.row) <= 1 &&
			Math.abs(col - lastCell.col) <= 1;

		if (isAdjacent) {
			setSelectedCells([...selectedCells, { id: cellId, row, col }]);
			setCurrentWord((prev) => prev + grid[row][col].letter);
		}
	};

    // Xử lý khi người dùng thả chuột
    const handleMouseUp = () => {
		if (!isDragging || gameOver || gameCompleted) return;

		setIsDragging(false);

		// Kiểm tra xem từ có trong danh sách không
		const wordIndex = words.findIndex(
			(w) => w.word === currentWord && !w.found
		);

		if (wordIndex !== -1) {
			// Đánh dấu từ đã tìm thấy
			const newWords = [...words];
			newWords[wordIndex].found = true;
			setWords(newWords);

			// Tăng điểm
			setScore(score + currentWord.length * 10);

			// Hiển thị thông báo
			setMessage({
				text: `Tìm thấy: ${currentWord} - ${words[wordIndex].definition}`,
				type: "success",
			});
		} else {
			// Kiểm tra xem từ có trong danh sách nhưng đã tìm thấy chưa
			const alreadyFound = words.some(
				(w) => w.word === currentWord && w.found
			);

			if (alreadyFound) {
				setMessage({
					text: `Từ "${currentWord}" đã được tìm thấy trước đó`,
					type: "info",
				});
			} else if (currentWord.length >= 3) {
				setMessage({
					text: `"${currentWord}" không có trong danh sách từ`,
					type: "error",
				});
			}
		}

		// Reset
		setSelectedCells([]);
		setCurrentWord("");
	};

    // Xử lý khi người dùng rời khỏi lưới
    const handleMouseLeave = () => {
		if (isDragging) {
			setIsDragging(false);
			setSelectedCells([]);
			setCurrentWord("");
		}
	};

    // Định dạng thời gian
    const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
	};

    // Hiển thị gợi ý
    const showRandomHint = () => {
		const unFoundWords = words.filter((word) => !word.found);
		if (unFoundWords.length === 0) return;

		const randomWord =
			unFoundWords[Math.floor(Math.random() * unFoundWords.length)];
		setShowHint(true);
		setMessage({
			text: `Gợi ý: ${randomWord.definition} (${randomWord.word.length} chữ cái)`,
			type: "info",
		});

		// Ẩn gợi ý sau 3 giây
		setTimeout(() => {
			setShowHint(false);
		}, 3000);
	};

    // Khởi động lại trò chơi
    const handleRestart = () => {
		setTimeLeft(360);
		setGameOver(false);
		setGameCompleted(false);
		setScore(0);

		setSelectedCells([]);
		setCurrentWord("");
		setMessage(null);
		reset();
	};

    // Kết thúc trò chơi
    const handleFinish = () => {
		router.push(`/vocabulary`);
	};

    // Tính toán tiến độ
    const progress =
		(words.filter((word) => word.found).length / words.length) * 100;

    return (
		<div className="min-h-screen bg-game-background">
			<Navigation />

			<main className="container mx-auto px-4 py-8">
				<div className="mb-6 flex items-center justify-between">
					<Button
						variant="ghost"
						className="gap-2 text-game-accent hover:bg-game-background/50 hover:text-game-primary"
						onClick={() => router.push(`/vocabulary`)}
					>
						<ArrowLeft className="h-4 w-4" />
						Quay lại
					</Button>

					<div className="text-right">
						<h2 className="text-lg font-bold text-game-accent">
							{DEFAULT.courseTitle}
						</h2>
						<p className="text-sm text-game-accent/70">
							{DEFAULT.sectionTitle}
						</p>
					</div>
				</div>

				{!gameOver && !gameCompleted ? (
					<>
						<div className="mb-6 flex items-center justify-between">
							<Badge
								variant="outline"
								className="bg-amber-100 text-amber-700 text-lg px-3 py-1"
							>
								<Clock className="mr-2 h-4 w-4" />{" "}
								{formatTime(timeLeft)}
							</Badge>

							<Badge
								variant="outline"
								className="bg-game-primary/10 text-game-primary text-lg px-3 py-1"
							>
								<Trophy className="mr-2 h-4 w-4" /> {score} điểm
							</Badge>
						</div>

						<div className="mb-4 space-y-2">
							<div className="flex justify-between text-sm">
								<span className="text-game-accent">
									Tìm thấy:{" "}
									{words.filter((word) => word.found).length}/
									{words.length} từ
								</span>
								<span className="text-game-primary">
									{Math.round(progress)}%
								</span>
							</div>
							<Progress
								value={progress}
								className="h-2 bg-white"
								indicatorClassName="bg-game-primary"
							/>
						</div>

						{message && (
							<motion.div
								initial={{ opacity: 0, y: -20 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -20 }}
								className={`mb-4 rounded-md p-3 text-center ${
									message.type === "success"
										? "bg-green-100 text-green-800"
										: message.type === "error"
										? "bg-red-100 text-red-800"
										: "bg-blue-100 text-blue-800"
								}`}
							>
								{message.text}
							</motion.div>
						)}

						<div className="flex flex-col items-center">
							<Card className="game-card w-full max-w-2xl overflow-hidden">
								<CardContent className="p-4">
									<div
										ref={gridRef}
										className="grid grid-cols-8 gap-1 touch-none"
										onMouseLeave={handleMouseLeave}
									>
										{grid.flat().map((cell) => (
											<div
												key={cell.id}
												className={`flex h-10 w-10 items-center justify-center rounded-md border border-gray-200 font-bold text-lg select-none
                          ${
								selectedCells.some(
									(selected) => selected.id === cell.id
								)
									? "bg-game-primary text-white"
									: "bg-white text-game-accent hover:bg-gray-50"
							}
                        `}
												onMouseDown={() =>
													handleMouseDown(
														cell.id,
														cell.row,
														cell.col
													)
												}
												onMouseEnter={() =>
													handleMouseEnter(
														cell.id,
														cell.row,
														cell.col
													)
												}
												onMouseUp={handleMouseUp}
												onTouchStart={() =>
													handleMouseDown(
														cell.id,
														cell.row,
														cell.col
													)
												}
												onTouchMove={(e) => {
													if (
														!gridRef.current ||
														!isDragging
													)
														return;

													const touch = e.touches[0];
													const gridRect =
														gridRef.current.getBoundingClientRect();

													// Tìm ô dưới ngón tay
													const touchX =
														touch.clientX -
														gridRect.left;
													const touchY =
														touch.clientY -
														gridRect.top;

													const cellWidth =
														gridRect.width / 8;
													const cellHeight =
														gridRect.height / 8;

													const col = Math.floor(
														touchX / cellWidth
													);
													const row = Math.floor(
														touchY / cellHeight
													);

													if (
														row >= 0 &&
														row < 8 &&
														col >= 0 &&
														col < 8
													) {
														const cellId = `${row}-${col}`;
														handleMouseEnter(
															cellId,
															row,
															col
														);
													}
												}}
												onTouchEnd={handleMouseUp}
											>
												{cell.letter}
											</div>
										))}
									</div>
								</CardContent>
							</Card>

							<div className="mt-6 flex w-full max-w-2xl justify-between gap-2">
								<Button
									variant="outline"
									className="gap-2 border-amber-500 bg-amber-50 text-amber-700 hover:bg-amber-100"
									onClick={showRandomHint}
								>
									<HelpCircle className="h-4 w-4" />
									Gợi ý
								</Button>

								<Button
									variant="outline"
									className="gap-2"
									onClick={handleRestart}
								>
									<RefreshCw className="h-4 w-4" />
									Chơi lại
								</Button>
							</div>
						</div>

						<div className="mt-8">
							<h3 className="mb-4 text-xl font-bold text-game-accent">
								Từ đã tìm thấy:
							</h3>
							<div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
								{words.map((word) => (
									<div
										key={word.word}
										className={`rounded-md border p-3 ${
											word.found
												? "border-green-200 bg-green-50"
												: "border-gray-200 bg-gray-50"
										}`}
									>
										<div className="flex items-center justify-between">
											<span
												className={`font-medium ${
													word.found
														? "text-green-700"
														: "text-gray-400"
												}`}
											>
												{word.found
													? word.word
													: "?".repeat(
															word.word.length
													  )}
											</span>
											{word.found && (
												<Check className="h-4 w-4 text-green-600" />
											)}
										</div>
										<p
											className={`text-sm ${
												word.found
													? "text-green-600"
													: "text-gray-400"
											}`}
										>
											{word.found
												? word.definition
												: "?????"}
										</p>
									</div>
								))}
							</div>
						</div>
					</>
				) : (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5 }}
						className="flex flex-col items-center justify-center rounded-lg bg-white p-8 text-center shadow-lg"
					>
						<div className="mb-4 rounded-full bg-game-primary/10 p-4">
							{gameCompleted ? (
								<Trophy className="h-12 w-12 text-game-primary" />
							) : (
								<Clock className="h-12 w-12 text-amber-600" />
							)}
						</div>

						<h2 className="mb-2 text-2xl font-bold text-game-accent">
							{gameCompleted ? "Chúc mừng!" : "Hết giờ!"}
						</h2>

						<p className="mb-6 text-game-accent/70">
							{gameCompleted
								? "Bạn đã tìm thấy tất cả các từ!"
								: "Bạn đã hết thời gian."}
						</p>

						<div className="mb-6 grid w-full max-w-md grid-cols-3 gap-4">
							<div className="rounded-md bg-gray-50 p-4 text-center">
								<div className="text-2xl font-bold text-game-primary">
									{score}
								</div>
								<div className="text-sm text-game-accent/70">
									Điểm số
								</div>
							</div>
							<div className="rounded-md bg-gray-50 p-4 text-center">
								<div className="text-2xl font-bold text-green-600">
									{words.filter((word) => word.found).length}
								</div>
								<div className="text-sm text-game-accent/70">
									Từ đã tìm
								</div>
							</div>
							<div className="rounded-md bg-gray-50 p-4 text-center">
								<div className="text-2xl font-bold text-amber-600">
									{words.filter((word) => !word.found).length}
								</div>
								<div className="text-sm text-game-accent/70">
									Từ còn lại
								</div>
							</div>
						</div>

						<div className="flex w-full max-w-md gap-4">
							<Button
								variant="outline"
								className="flex-1 gap-2"
								onClick={handleRestart}
							>
								<RefreshCw className="h-4 w-4" />
								Chơi lại
							</Button>
							<Button
								className="game-button flex-1 gap-2"
								onClick={handleFinish}
							>
								<Check className="h-4 w-4" />
								Hoàn thành
							</Button>
						</div>
					</motion.div>
				)}
			</main>
		</div>
	);
}
