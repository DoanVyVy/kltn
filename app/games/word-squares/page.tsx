"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, HelpCircle, RefreshCw, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

interface SquareCell {
  id: string;
  letter: string;
  row: number;
  col: number;
  isSelected: boolean;
  isFixed: boolean;
}

interface GameLevel {
  id: number;
  size: number;
  difficulty: string;
  words: string[];
  preFilledCells: { row: number; col: number; letter: string }[];
}

export default function WordSquaresGame() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [showInstructions, setShowInstructions] = useState(false);
  const [currentLevel, setCurrentLevel] = useState<GameLevel | null>(null);
  const [grid, setGrid] = useState<SquareCell[][]>([]);
  const [selectedCell, setSelectedCell] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const [direction, setDirection] = useState<"horizontal" | "vertical">(
    "horizontal"
  );
  const [currentScore, setCurrentScore] = useState(0);
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error" | "info";
  } | null>(null);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiHint, setAiHint] = useState("");

  // Mock available letters
  const availableLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  // Sample game levels
  const gameLevels: GameLevel[] = [
    {
      id: 1,
      size: 3,
      difficulty: "Easy",
      words: ["CAT", "APE", "TEN"],
      preFilledCells: [
        { row: 0, col: 0, letter: "C" },
        { row: 1, col: 0, letter: "A" },
        { row: 2, col: 2, letter: "N" },
      ],
    },
    {
      id: 2,
      size: 4,
      difficulty: "Medium",
      words: ["CARE", "AREA", "REAR", "EARN"],
      preFilledCells: [
        { row: 0, col: 0, letter: "C" },
        { row: 0, col: 3, letter: "E" },
        { row: 3, col: 0, letter: "E" },
        { row: 3, col: 3, letter: "N" },
      ],
    },
    {
      id: 3,
      size: 5,
      difficulty: "Hard",
      words: ["SMART", "MANGO", "ARROW", "ROUTE", "TREND"],
      preFilledCells: [
        { row: 0, col: 0, letter: "S" },
        { row: 0, col: 4, letter: "T" },
        { row: 4, col: 0, letter: "T" },
        { row: 4, col: 4, letter: "D" },
      ],
    },
  ];

  // Initialize the game
  useEffect(() => {
    const timer = setTimeout(() => {
      // Start with the first level
      const level = gameLevels[0];
      setCurrentLevel(level);
      initializeGrid(level);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Initialize grid based on the current level
  const initializeGrid = (level: GameLevel) => {
    const newGrid: SquareCell[][] = [];

    // Create empty grid
    for (let row = 0; row < level.size; row++) {
      newGrid[row] = [];
      for (let col = 0; col < level.size; col++) {
        newGrid[row][col] = {
          id: `${row}-${col}`,
          letter: "",
          row,
          col,
          isSelected: false,
          isFixed: false,
        };
      }
    }

    // Add pre-filled cells
    level.preFilledCells.forEach((cell) => {
      newGrid[cell.row][cell.col] = {
        ...newGrid[cell.row][cell.col],
        letter: cell.letter,
        isFixed: true,
      };
    });

    setGrid(newGrid);
  };

  // Handle cell selection
  const handleCellClick = (row: number, col: number) => {
    // Cannot select fixed cells
    if (grid[row][col].isFixed) return;

    const newGrid = [...grid];

    // Deselect previous cell if any
    if (selectedCell) {
      newGrid[selectedCell.row][selectedCell.col].isSelected = false;
    }

    // Toggle direction if same cell is clicked
    if (selectedCell && selectedCell.row === row && selectedCell.col === col) {
      setDirection(direction === "horizontal" ? "vertical" : "horizontal");
    } else {
      // Select new cell
      newGrid[row][col].isSelected = true;
      setSelectedCell({ row, col });
    }

    setGrid(newGrid);
  };

  // Handle letter selection
  const handleLetterSelect = (letter: string) => {
    if (!selectedCell) return;

    const newGrid = [...grid];
    newGrid[selectedCell.row][selectedCell.col].letter = letter;

    // Move selection to next cell
    moveSelectionToNextCell();

    setGrid(newGrid);
    checkForWords();
  };

  // Move selection to next cell
  const moveSelectionToNextCell = () => {
    if (!selectedCell || !currentLevel) return;

    const { row, col } = selectedCell;
    const size = currentLevel.size;
    const newGrid = [...grid];

    // Deselect current cell
    newGrid[row][col].isSelected = false;

    // Find next cell
    let nextRow = row;
    let nextCol = col;

    if (direction === "horizontal") {
      nextCol = col + 1;
      if (nextCol >= size) {
        nextCol = 0;
        nextRow = (row + 1) % size;
      }
    } else {
      nextRow = row + 1;
      if (nextRow >= size) {
        nextRow = 0;
        nextCol = (col + 1) % size;
      }
    }

    // Skip if next cell is fixed
    while (newGrid[nextRow][nextCol].isFixed) {
      if (direction === "horizontal") {
        nextCol++;
        if (nextCol >= size) {
          nextCol = 0;
          nextRow = (nextRow + 1) % size;
        }
      } else {
        nextRow++;
        if (nextRow >= size) {
          nextRow = 0;
          nextCol = (nextCol + 1) % size;
        }
      }
    }

    // Select next cell
    newGrid[nextRow][nextCol].isSelected = true;
    setSelectedCell({ row: nextRow, col: nextCol });
    setGrid(newGrid);
  };

  // Check for completed words
  const checkForWords = () => {
    if (!currentLevel) return;

    const size = currentLevel.size;
    const words = currentLevel.words;
    let foundWords = 0;

    // Check horizontal words
    for (let row = 0; row < size; row++) {
      let rowWord = "";
      for (let col = 0; col < size; col++) {
        rowWord += grid[row][col].letter;
      }
      if (words.includes(rowWord)) {
        foundWords++;
      }
    }

    // Check vertical words
    for (let col = 0; col < size; col++) {
      let colWord = "";
      for (let row = 0; row < size; row++) {
        colWord += grid[row][col].letter;
      }
      if (words.includes(colWord)) {
        foundWords++;
      }
    }

    // Update score
    setCurrentScore(foundWords);

    // Check if game is completed
    if (foundWords === size * 2) {
      setGameCompleted(true);
      setMessage({ text: "Great job! Level completed!", type: "success" });
    }
  };

  // Reset the current level
  const resetLevel = () => {
    if (currentLevel) {
      initializeGrid(currentLevel);
      setCurrentScore(0);
      setMessage(null);
      setGameCompleted(false);
    }
  };

  // Get AI hint using Gemini (simulated)
  const getAIHint = async () => {
    setLoadingAI(true);

    // Simulate AI processing time
    setTimeout(() => {
      // In a real implementation, you would call the Gemini API here
      const hints = [
        "Try focusing on shorter words first to guide your choices for longer words.",
        "Remember both horizontal and vertical words must be valid.",
        "Start with the corners and edges where letters are more constrained.",
        "Think of words that share common letters in their intersections.",
        "Some squares can be completed by working on both the row and column simultaneously.",
      ];

      setAiHint(hints[Math.floor(Math.random() * hints.length)]);
      setLoadingAI(false);
    }, 1500);
  };

  // Go to next level
  const goToNextLevel = () => {
    if (!currentLevel) return;

    const nextLevelIndex =
      gameLevels.findIndex((level) => level.id === currentLevel.id) + 1;

    if (nextLevelIndex < gameLevels.length) {
      const nextLevel = gameLevels[nextLevelIndex];
      setCurrentLevel(nextLevel);
      initializeGrid(nextLevel);
      setCurrentScore(0);
      setMessage(null);
      setGameCompleted(false);
      setSelectedCell(null);
    } else {
      // Game completed
      setMessage({
        text: "Congratulations! You've completed all levels!",
        type: "success",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <div className="w-16 h-16 border-4 border-game-primary border-t-transparent rounded-full"></div>
          </motion.div>
          <p className="text-game-accent font-medium">
            Loading Word Squares...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col gap-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => router.push("/games")}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-2xl font-bold text-game-accent">
                Word Squares
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-white">
                Level: {currentLevel?.id} ({currentLevel?.difficulty})
              </Badge>
              <Badge variant="outline" className="bg-white">
                Score: {currentScore}/
                {currentLevel?.size ? currentLevel.size * 2 : 0}
              </Badge>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowInstructions(true)}
              >
                <HelpCircle className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Message */}
          <AnimatePresence>
            {message && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`p-3 rounded-lg text-white text-center ${
                  message.type === "success"
                    ? "bg-green-500"
                    : message.type === "error"
                    ? "bg-red-500"
                    : "bg-blue-500"
                }`}
              >
                {message.text}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Game Grid */}
          <div className="flex justify-center">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div
                className="grid gap-2"
                style={{
                  gridTemplateColumns: `repeat(${
                    currentLevel?.size || 3
                  }, 1fr)`,
                }}
              >
                {grid.map((row, rowIndex) =>
                  row.map((cell) => (
                    <motion.div
                      key={cell.id}
                      whileTap={{ scale: 0.95 }}
                      className={`w-14 h-14 md:w-16 md:h-16 flex items-center justify-center rounded-md text-lg font-bold cursor-pointer border-2 ${
                        cell.isSelected
                          ? "border-game-primary bg-game-primary/10"
                          : cell.isFixed
                          ? "border-gray-300 bg-gray-100"
                          : cell.letter
                          ? "border-game-secondary bg-white"
                          : "border-dashed border-gray-300 bg-white"
                      }`}
                      onClick={() => handleCellClick(cell.row, cell.col)}
                    >
                      {cell.letter}
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Direction Indicator */}
          <div className="flex justify-center gap-4">
            <Badge
              variant={direction === "horizontal" ? "default" : "outline"}
              className={direction === "horizontal" ? "bg-game-primary" : ""}
              onClick={() => setDirection("horizontal")}
            >
              Horizontal →
            </Badge>
            <Badge
              variant={direction === "vertical" ? "default" : "outline"}
              className={direction === "vertical" ? "bg-game-primary" : ""}
              onClick={() => setDirection("vertical")}
            >
              Vertical ↓
            </Badge>
          </div>

          {/* Letter Selection */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="grid grid-cols-9 gap-2">
              {availableLetters.map((letter) => (
                <motion.button
                  key={letter}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center bg-game-secondary/10 rounded-md font-medium hover:bg-game-secondary/20"
                  onClick={() => handleLetterSelect(letter)}
                >
                  {letter}
                </motion.button>
              ))}
            </div>
          </div>

          {/* AI Hint */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-game-accent">Need a hint?</h3>
                <Button
                  size="sm"
                  onClick={getAIHint}
                  disabled={loadingAI}
                  className="bg-gradient-to-r from-blue-500 to-violet-500 text-white"
                >
                  {loadingAI ? (
                    <>
                      <RefreshCw className="h-3 w-3 mr-2 animate-spin" />
                      Thinking...
                    </>
                  ) : (
                    "Ask Gemini AI"
                  )}
                </Button>
              </div>

              {aiHint && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="bg-blue-50 border border-blue-100 p-3 rounded-md text-sm"
                >
                  <p className="text-blue-800">{aiHint}</p>
                </motion.div>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-4">
            <Button
              variant="outline"
              onClick={resetLevel}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Reset Level
            </Button>

            <Button
              disabled={!gameCompleted}
              onClick={goToNextLevel}
              className="flex items-center gap-2 bg-game-primary hover:bg-game-primary/90"
            >
              <Check className="h-4 w-4" />
              Next Level
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Instructions Dialog */}
      <Dialog open={showInstructions} onOpenChange={setShowInstructions}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>How to Play Word Squares</DialogTitle>
            <DialogDescription>
              Create a grid where the words read the same across and down.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-1">Rules:</h4>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>
                  Fill in the grid so that each row and column forms a valid
                  word
                </li>
                <li>Some cells are pre-filled to help you get started</li>
                <li>
                  Click a cell to select it, then click a letter to place it
                </li>
                <li>
                  Click a selected cell to toggle between horizontal and
                  vertical direction
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-1">Scoring:</h4>
              <p className="text-sm">
                You score a point for each valid word formed (horizontally or
                vertically). Complete all words to advance to the next level.
              </p>
            </div>

            <div className="pt-2">
              <p className="text-xs text-muted-foreground">
                Inspired by squares.org but redesigned for English language
                learning.
              </p>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={() => setShowInstructions(false)}>Got it</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
