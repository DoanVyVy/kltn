"use client"

import { memo } from "react"
import { motion } from "framer-motion"
import { Trophy, Clock, RefreshCw, Check } from "lucide-react"
import { Button } from "@/components/ui/button"

interface GameOverModalProps {
  gameCompleted: boolean
  score: number
  foundWords: number
  totalWords: number
  onRestart: () => void
  onFinish: () => void
}

// Use memo to prevent unnecessary re-renders
export const GameOverModal = memo(function GameOverModal({
  gameCompleted,
  score,
  foundWords,
  totalWords,
  onRestart,
  onFinish,
}: GameOverModalProps) {
  return (
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

      <h2 className="mb-2 text-2xl font-bold text-game-accent">{gameCompleted ? "Chúc mừng!" : "Hết giờ!"}</h2>

      <p className="mb-6 text-game-accent/70">
        {gameCompleted ? "Bạn đã tìm thấy tất cả các từ!" : "Bạn đã hết thời gian."}
      </p>

      <div className="mb-6 grid w-full max-w-md grid-cols-3 gap-4">
        <div className="rounded-md bg-gray-50 p-4 text-center">
          <div className="text-2xl font-bold text-game-primary">{score}</div>
          <div className="text-sm text-game-accent/70">Điểm số</div>
        </div>
        <div className="rounded-md bg-gray-50 p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{foundWords}</div>
          <div className="text-sm text-game-accent/70">Từ đã tìm</div>
        </div>
        <div className="rounded-md bg-gray-50 p-4 text-center">
          <div className="text-2xl font-bold text-amber-600">{totalWords - foundWords}</div>
          <div className="text-sm text-game-accent/70">Từ còn lại</div>
        </div>
      </div>

      <div className="flex w-full max-w-md gap-4">
        <Button variant="outline" className="flex-1 gap-2" onClick={onRestart}>
          <RefreshCw className="h-4 w-4" />
          Chơi lại
        </Button>
        <Button className="game-button flex-1 gap-2" onClick={onFinish}>
          <Check className="h-4 w-4" />
          Hoàn thành
        </Button>
      </div>
    </motion.div>
  )
})

