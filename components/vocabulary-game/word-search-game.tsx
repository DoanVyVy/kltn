"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { LetterGrid } from "@/components/vocabulary-game/letter-grid"
import { GameStats } from "@/components/vocabulary-game/game-stats"
import { WordList } from "@/components/vocabulary-game/word-list"
import { GameOverModal } from "@/components/vocabulary-game/game-over-modal"
import { GameMessage } from "@/components/vocabulary-game/game-message"
import { GameControls } from "@/components/vocabulary-game/game-controls"
import { GameHeader } from "@/components/vocabulary-game/game-header"
import { createGridData } from "@/components/vocabulary-game/grid-utils"

interface GameWord {
  word: string
  definition: string
  found: boolean
}

interface GameData {
  id: number
  courseId: number
  courseTitle: string
  title: string
  timeLimit: number
  words: GameWord[]
}

interface WordSearchGameProps {
  gameData: GameData
}

export function WordSearchGame({ gameData }: WordSearchGameProps) {
  const router = useRouter()
  const [timeLeft, setTimeLeft] = useState(gameData.timeLimit)
  const [gameOver, setGameOver] = useState(false)
  const [gameCompleted, setGameCompleted] = useState(false)
  const [score, setScore] = useState(0)
  const [grid, setGrid] = useState(() => createGridData(gameData.words))
  const [words, setWords] = useState(gameData.words)
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null)

  // Optimize with useCallback
  const handleWordFound = useCallback(
    (word: string, wordIndex: number) => {
      setWords((prevWords) => {
        const newWords = [...prevWords]
        newWords[wordIndex].found = true
        return newWords
      })

      setScore((prevScore) => prevScore + word.length * 10)

      setMessage({
        text: `Tìm thấy: ${word} - ${gameData.words[wordIndex].definition}`,
        type: "success",
      })
    },
    [gameData.words],
  )

  const showRandomHint = useCallback(() => {
    const unFoundWords = words.filter((word) => !word.found)
    if (unFoundWords.length === 0) return

    const randomWord = unFoundWords[Math.floor(Math.random() * unFoundWords.length)]

    setMessage({
      text: `Gợi ý: ${randomWord.definition} (${randomWord.word.length} chữ cái)`,
      type: "info",
    })
  }, [words])

  const handleRestart = useCallback(() => {
    setTimeLeft(gameData.timeLimit)
    setGameOver(false)
    setGameCompleted(false)
    setScore(0)
    setGrid(createGridData(gameData.words))
    setWords(gameData.words.map((word) => ({ ...word, found: false })))
    setMessage(null)
  }, [gameData.timeLimit, gameData.words])

  // Timer effect
  useEffect(() => {
    if (gameOver || gameCompleted) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          setGameOver(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [gameOver, gameCompleted])

  // Check game completion
  useEffect(() => {
    if (words.every((word) => word.found)) {
      setGameCompleted(true)
    }
  }, [words])

  // Message timeout
  useEffect(() => {
    if (!message) return

    const timer = setTimeout(() => {
      setMessage(null)
    }, 2000)

    return () => clearTimeout(timer)
  }, [message])

  return (
    <>
      <GameHeader
        courseTitle={gameData.courseTitle}
        sectionTitle={gameData.title}
        onBack={() => router.push(`/vocabulary/game`)}
      />

      {!gameOver && !gameCompleted ? (
        <>
          <GameStats
            timeLeft={timeLeft}
            score={score}
            foundWords={words.filter((word) => word.found).length}
            totalWords={words.length}
          />

          <GameMessage message={message} />

          <div className="flex flex-col items-center">
            <Card className="game-card w-full max-w-2xl overflow-hidden">
              <CardContent className="p-4">
                <LetterGrid
                  grid={grid}
                  gameOver={gameOver}
                  gameCompleted={gameCompleted}
                  onWordFound={handleWordFound}
                  words={words}
                />
              </CardContent>
            </Card>

            <GameControls onHint={showRandomHint} onRestart={handleRestart} />
          </div>

          <WordList words={words} />
        </>
      ) : (
        <GameOverModal
          gameCompleted={gameCompleted}
          score={score}
          foundWords={words.filter((word) => word.found).length}
          totalWords={words.length}
          onRestart={handleRestart}
          onFinish={() => router.push(`/vocabulary/game`)}
        />
      )}
    </>
  )
}

