"use client"

import { useMemo } from "react"
import { Clock, Trophy } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

interface GameStatsProps {
  timeLeft: number
  score: number
  foundWords: number
  totalWords: number
}

export function GameStats({ timeLeft, score, foundWords, totalWords }: GameStatsProps) {
  // Format time - memoize to avoid recalculation on every render
  const formattedTime = useMemo(() => {
    const mins = Math.floor(timeLeft / 60)
    const secs = timeLeft % 60
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }, [timeLeft])

  // Calculate progress - memoize to avoid recalculation
  const progress = useMemo(() => {
    return (foundWords / totalWords) * 100
  }, [foundWords, totalWords])

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <Badge variant="outline" className="bg-amber-100 text-amber-700 text-lg px-3 py-1">
          <Clock className="mr-2 h-4 w-4" /> {formattedTime}
        </Badge>

        <Badge variant="outline" className="bg-game-primary/10 text-game-primary text-lg px-3 py-1">
          <Trophy className="mr-2 h-4 w-4" /> {score} điểm
        </Badge>
      </div>

      <div className="mb-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-game-accent">
            Tìm thấy: {foundWords}/{totalWords} từ
          </span>
          <span className="text-game-primary">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2 bg-white" indicatorClassName="bg-game-primary" />
      </div>
    </>
  )
}

