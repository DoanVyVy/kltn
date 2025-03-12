"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Calendar, Trophy } from "lucide-react"

// Game types
interface Game {
  id: string
  title: string
  completed: boolean
  order: number
}

export default function DailyGamesPage() {
  const router = useRouter()
  const [streakCount] = useState(5) // This would come from user data in a real app
  const [isLoading, setIsLoading] = useState(true)
  const [activeGameId, setActiveGameId] = useState<string | null>(null)

  // Define all available games
  const games: Game[] = [
    {
      id: "word-guess",
      title: "Word Guess",
      completed: false,
      order: 1,
    },
    {
      id: "sentence-scramble",
      title: "Sentence Scramble",
      completed: false,
      order: 2,
    },
    {
      id: "word-association",
      title: "Word Association",
      completed: false,
      order: 3,
    },
    {
      id: "idiom-challenge",
      title: "Idiom Challenge",
      completed: false,
      order: 4,
    },
  ]

  useEffect(() => {
    // Simulate loading and fetching game state
    const timer = setTimeout(() => {
      // Find the first uncompleted game
      const nextGame = games.find((game) => !game.completed)
      if (nextGame) {
        setActiveGameId(nextGame.id)
      }
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    // Redirect to the first game (word-guess) after loading
    if (!isLoading) {
      router.push(`/daily-games/word-guess`)
    }
  }, [isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-game-background to-white flex items-center justify-center">
        <motion.div
          className="flex flex-col items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="relative"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-game-primary to-game-secondary blur-lg opacity-70"></div>
            <div className="relative w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-lg">
              <Calendar className="h-10 w-10 text-game-primary" />
            </div>
          </motion.div>

          <motion.h2
            className="mt-6 text-2xl font-bold text-game-accent"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Loading Daily Challenge
          </motion.h2>

          <motion.div
            className="mt-4 flex space-x-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-3 h-3 rounded-full bg-game-primary"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{
                  duration: 1,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: i * 0.2,
                }}
              />
            ))}
          </motion.div>

          <motion.div
            className="mt-8 flex items-center gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <motion.div
              className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-md"
              whileHover={{ scale: 1.05 }}
            >
              <Calendar className="h-5 w-5 text-game-primary" />
              <span className="text-game-accent font-medium">
                {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </span>
            </motion.div>

            <motion.div
              className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-md"
              whileHover={{ scale: 1.05 }}
              animate={{
                scale: [1, 1.05, 1],
                transition: { duration: 2, repeat: Number.POSITIVE_INFINITY },
              }}
            >
              <Trophy className="h-5 w-5 text-amber-500" />
              <span className="text-game-accent font-medium">{streakCount} day streak</span>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    )
  }

  // This page should never be visible as we redirect to the active game
  return null
}

