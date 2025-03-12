"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback, memo } from "react"

interface LetterCell {
  id: string
  letter: string
  row: number
  col: number
  selected: boolean
}

interface LetterGridProps {
  grid: LetterCell[][]
  gameOver: boolean
  gameCompleted: boolean
  onWordFound: (word: string, wordIndex: number) => void
  words: { word: string; definition: string; found: boolean }[]
}

// Use memo to prevent unnecessary re-renders
export const LetterGrid = memo(function LetterGrid({
  grid,
  gameOver,
  gameCompleted,
  onWordFound,
  words,
}: LetterGridProps) {
  const [selectedCells, setSelectedCells] = useState<{ id: string; row: number; col: number }[]>([])
  const [currentWord, setCurrentWord] = useState("")
  const [isDragging, setIsDragging] = useState(false)
  const gridRef = useRef<HTMLDivElement>(null)

  // Reset selection when game state changes
  useEffect(() => {
    if (gameOver || gameCompleted) {
      setSelectedCells([])
      setCurrentWord("")
      setIsDragging(false)
    }
  }, [gameOver, gameCompleted])

  // Optimize handlers with useCallback
  const handleMouseDown = useCallback(
    (cellId: string, row: number, col: number) => {
      if (gameOver || gameCompleted) return

      setIsDragging(true)
      setSelectedCells([{ id: cellId, row, col }])
      setCurrentWord(grid[row][col].letter)
    },
    [gameOver, gameCompleted, grid],
  )

  const handleMouseEnter = useCallback(
    (cellId: string, row: number, col: number) => {
      if (!isDragging || gameOver || gameCompleted) return

      // Check if cell is already selected
      if (selectedCells.some((cell) => cell.id === cellId)) return

      // Check if new cell is adjacent to the last cell
      const lastCell = selectedCells[selectedCells.length - 1]
      const isAdjacent = Math.abs(row - lastCell.row) <= 1 && Math.abs(col - lastCell.col) <= 1

      if (isAdjacent) {
        setSelectedCells((prev) => [...prev, { id: cellId, row, col }])
        setCurrentWord((prev) => prev + grid[row][col].letter)
      }
    },
    [isDragging, gameOver, gameCompleted, selectedCells, grid],
  )

  const handleMouseUp = useCallback(() => {
    if (!isDragging || gameOver || gameCompleted) return

    setIsDragging(false)

    // Check if the word is in the list
    const wordIndex = words.findIndex((w) => w.word === currentWord && !w.found)

    if (wordIndex !== -1) {
      // Notify word found
      onWordFound(currentWord, wordIndex)
    }

    // Reset
    setSelectedCells([])
    setCurrentWord("")
  }, [isDragging, gameOver, gameCompleted, currentWord, words, onWordFound])

  const handleMouseLeave = useCallback(() => {
    if (isDragging) {
      setIsDragging(false)
      setSelectedCells([])
      setCurrentWord("")
    }
  }, [isDragging])

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!gridRef.current || !isDragging) return

      const touch = e.touches[0]
      const gridRect = gridRef.current.getBoundingClientRect()

      // Find cell under finger
      const touchX = touch.clientX - gridRect.left
      const touchY = touch.clientY - gridRect.top

      const cellWidth = gridRect.width / 8
      const cellHeight = gridRect.height / 8

      const col = Math.floor(touchX / cellWidth)
      const row = Math.floor(touchY / cellHeight)

      if (row >= 0 && row < 8 && col >= 0 && col < 8) {
        const cellId = `${row}-${col}`
        handleMouseEnter(cellId, row, col)
      }
    },
    [gridRef, isDragging, handleMouseEnter],
  )

  return (
    <div ref={gridRef} className="grid grid-cols-8 gap-1 touch-none" onMouseLeave={handleMouseLeave}>
      {grid.flat().map((cell) => (
        <div
          key={cell.id}
          className={`flex h-10 w-10 items-center justify-center rounded-md border border-gray-200 font-bold text-lg select-none
            ${
              selectedCells.some((selected) => selected.id === cell.id)
                ? "bg-game-primary text-white"
                : "bg-white text-game-accent hover:bg-gray-50"
            }
          `}
          onMouseDown={() => handleMouseDown(cell.id, cell.row, cell.col)}
          onMouseEnter={() => handleMouseEnter(cell.id, cell.row, cell.col)}
          onMouseUp={handleMouseUp}
          onTouchStart={() => handleMouseDown(cell.id, cell.row, cell.col)}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleMouseUp}
        >
          {cell.letter}
        </div>
      ))}
    </div>
  )
})

