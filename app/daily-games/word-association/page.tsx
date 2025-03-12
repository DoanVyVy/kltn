"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, Check, RefreshCw, Clock, Trophy, Calendar, ChevronRight, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Navigation from "@/components/navigation"

// Types
interface WordPair {
  id: number
  word: string
  match: string
  isMatched: boolean
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100 },
  },
}

export default function WordAssociationPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [gameWon, setGameWon] = useState(false)
  const [timeLeft, setTimeLeft] = useState(60) // 60 seconds
  const [message, setMessage] = useState<string | null>(null)
  const [redirectCountdown, setRedirectCountdown] = useState(3)
  const [isRedirecting, setIsRedirecting] = useState(false)

  // Game data
  const [wordPairs, setWordPairs] = useState<WordPair[]>([
    { id: 1, word: "hot", match: "cold", isMatched: false },
    { id: 2, word: "happy", match: "sad", isMatched: false },
    { id: 3, word: "big", match: "small", isMatched: false },
    { id: 4, word: "fast", match: "slow", isMatched: false },
    { id: 5, word: "day", match: "night", isMatched: false },
    { id: 6, word: "rich", match: "poor", isMatched: false },
    { id: 7, word: "easy", match: "difficult", isMatched: false },
    { id: 8, word: "light", match: "dark", isMatched: false },
    { id: 9, word: "high", match: "low", isMatched: false },
    { id: 10, word: "strong", match: "weak", isMatched: false },
  ])

  const [leftWords, setLeftWords] = useState<string[]>([])
  const [rightWords, setRightWords] = useState<string[]>([])
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null)
  const [selectedRight, setSelectedRight] = useState<string | null>(null)
  const [score, setScore] = useState(0)

  // Initialize the game
  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      initializeGame()
      setIsLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  // Timer countdown
  useEffect(() => {
    if (isLoading || gameOver) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          if (!gameWon) {
            setGameOver(true)
            setMessage("Time's up! Let's see how many pairs you matched.")
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isLoading, gameOver, gameWon])

  // Initialize the game by shuffling words
  const initializeGame = () => {
    // Extract words and matches
    const left = wordPairs.map((pair) => pair.word)
    const right = wordPairs.map((pair) => pair.match)

    // Shuffle both arrays
    setLeftWords([...left].sort(() => Math.random() - 0.5))
    setRightWords([...right].sort(() => Math.random() - 0.5))

    // Reset selections
    setSelectedLeft(null)
    setSelectedRight(null)

    // Reset matched status
    setWordPairs(wordPairs.map((pair) => ({ ...pair, isMatched: false })))

    // Reset score
    setScore(0)
  }

  // Handle word selection
  const handleSelectLeft = (word: string) => {
    if (gameOver) return

    // If already matched, do nothing
    if (wordPairs.find((pair) => pair.word === word && pair.isMatched)) return

    setSelectedLeft(word)

    // If right is already selected, check for match
    if (selectedRight) {
      checkMatch(word, selectedRight)
    }
  }

  const handleSelectRight = (word: string) => {
    if (gameOver) return

    // If already matched, do nothing
    if (wordPairs.find((pair) => pair.match === word && pair.isMatched)) return

    setSelectedRight(word)

    // If left is already selected, check for match
    if (selectedLeft) {
      checkMatch(selectedLeft, word)
    }
  }

  // Check if selected words match
  const checkMatch = (leftWord: string, rightWord: string) => {
    // Find the pair
    const pair = wordPairs.find((p) => p.word === leftWord && p.match === rightWord)

    if (pair) {
      // It's a match!
      setMessage("Correct match!")

      // Update the pair's matched status
      const updatedPairs = wordPairs.map((p) => (p.id === pair.id ? { ...p, isMatched: true } : p))
      setWordPairs(updatedPairs)

      // Increase score
      setScore(score + 1)

      // Check if all pairs are matched
      if (updatedPairs.every((p) => p.isMatched)) {
        setGameWon(true)
        setGameOver(true)
        setMessage("Congratulations! You've matched all the pairs!")

        // Start the redirect countdown after a short delay
        setTimeout(() => {
          setIsRedirecting(true)
        }, 2000)
      }
    } else {
      // Not a match
      setMessage("Not a match. Try again!")
    }

    // Reset selections after a short delay
    setTimeout(() => {
      setSelectedLeft(null)
      setSelectedRight(null)
      setMessage(null)
    }, 1000)
  }

  // Handle automatic redirection after winning
  useEffect(() => {
    if (isRedirecting && redirectCountdown > 0) {
      const timer = setTimeout(() => {
        setRedirectCountdown(redirectCountdown - 1)
      }, 1000)

      return () => clearTimeout(timer)
    } else if (isRedirecting && redirectCountdown === 0) {
      // Navigate to the next game
      router.push("/daily-games/idiom-challenge")
    }
  }, [isRedirecting, redirectCountdown, router])

  // Reset the game
  const resetGame = () => {
    initializeGame()
    setGameOver(false)
    setGameWon(false)
    setTimeLeft(60)
    setMessage(null)
  }

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-game-background to-white">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
          <Button
            variant="ghost"
            className="mb-6 gap-2 text-game-accent hover:bg-white/50 rounded-full"
            onClick={() => router.push("/daily-games")}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Games
          </Button>
        </motion.div>

        <motion.div
          className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <h1 className="text-3xl font-bold text-game-accent mb-2">
              Word Association
              <motion.span
                className="inline-block ml-2"
                animate={{
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "reverse",
                }}
              >
                <Sparkles className="h-5 w-5 text-green-500" />
              </motion.span>
            </h1>
            <p className="text-game-accent/80">Match words with their opposites</p>
          </motion.div>

          <motion.div className="flex items-center gap-4 mt-4 md:mt-0" variants={itemVariants}>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Badge
                variant="outline"
                className="bg-white text-game-accent border-green-500/20 px-3 py-1.5 text-sm rounded-full shadow-sm"
              >
                <Calendar className="mr-2 h-4 w-4 text-green-500" />
                {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </Badge>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              animate={
                timeLeft <= 10
                  ? {
                      scale: [1, 1.05, 1],
                      transition: { duration: 1, repeat: Number.POSITIVE_INFINITY },
                    }
                  : {}
              }
            >
              <Badge
                variant="outline"
                className={`bg-white text-game-accent border-green-500/20 px-3 py-1.5 text-sm rounded-full shadow-sm ${
                  timeLeft <= 10 ? "border-red-500" : ""
                }`}
              >
                <Clock className={`mr-2 h-4 w-4 ${timeLeft <= 10 ? "text-red-500" : "text-green-500"}`} />
                {formatTime(timeLeft)}
              </Badge>
            </motion.div>
          </motion.div>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Game area */}
          <motion.div className="md:col-span-2" variants={containerVariants} initial="hidden" animate="visible">
            <Card className="bg-white border-0 shadow-lg rounded-xl text-game-accent overflow-hidden">
              <CardHeader>
                <CardTitle>Match the Opposites</CardTitle>
                <CardDescription className="text-game-accent/70">
                  Select a word from each column to match opposites
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Score display */}
                <motion.div
                  className="bg-green-50 border border-green-100 p-4 rounded-xl flex justify-between items-center"
                  variants={itemVariants}
                >
                  <h3 className="font-medium text-green-700">Your Score:</h3>
                  <div className="text-2xl font-bold text-green-600">
                    {score} / {wordPairs.length}
                  </div>
                </motion.div>

                {/* Word columns */}
                <motion.div variants={itemVariants} className="grid grid-cols-2 gap-6">
                  {/* Left column */}
                  <div className="space-y-2">
                    <h3 className="font-medium text-lg mb-2 text-center">Words</h3>
                    <div className="space-y-2">
                      {leftWords.map((word, index) => {
                        const isPaired = wordPairs.find((p) => p.word === word && p.isMatched)
                        return (
                          <motion.button
                            key={index}
                            onClick={() => handleSelectLeft(word)}
                            className={`w-full p-3 rounded-lg text-center font-medium transition-all ${
                              isPaired
                                ? "bg-green-100 border border-green-200 text-green-700 cursor-default"
                                : selectedLeft === word
                                  ? "bg-emerald-500 text-white shadow-md"
                                  : "bg-white border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50"
                            }`}
                            whileHover={!isPaired && selectedLeft !== word ? { scale: 1.03 } : {}}
                            whileTap={!isPaired && selectedLeft !== word ? { scale: 0.98 } : {}}
                            disabled={isPaired !== undefined}
                          >
                            {word}
                            {isPaired && <Check className="inline-block ml-2 h-4 w-4" />}
                          </motion.button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Right column */}
                  <div className="space-y-2">
                    <h3 className="font-medium text-lg mb-2 text-center">Opposites</h3>
                    <div className="space-y-2">
                      {rightWords.map((word, index) => {
                        const isPaired = wordPairs.find((p) => p.match === word && p.isMatched)
                        return (
                          <motion.button
                            key={index}
                            onClick={() => handleSelectRight(word)}
                            className={`w-full p-3 rounded-lg text-center font-medium transition-all ${
                              isPaired
                                ? "bg-green-100 border border-green-200 text-green-700 cursor-default"
                                : selectedRight === word
                                  ? "bg-emerald-500 text-white shadow-md"
                                  : "bg-white border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50"
                            }`}
                            whileHover={!isPaired && selectedRight !== word ? { scale: 1.03 } : {}}
                            whileTap={!isPaired && selectedRight !== word ? { scale: 0.98 } : {}}
                            disabled={isPaired !== undefined}
                          >
                            {word}
                            {isPaired && <Check className="inline-block ml-2 h-4 w-4" />}
                          </motion.button>
                        )
                      })}
                    </div>
                  </div>
                </motion.div>

                {/* Message alert */}
                <AnimatePresence>
                  {message && (
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Alert
                        className={`${
                          gameWon
                            ? "bg-green-50 border-green-200 text-green-700"
                            : gameOver
                              ? "bg-red-50 border-red-200 text-red-700"
                              : message.includes("Correct")
                                ? "bg-green-50 border-green-200 text-green-700"
                                : "bg-amber-50 border-amber-200 text-amber-700"
                        } rounded-xl`}
                      >
                        <AlertDescription>{message}</AlertDescription>
                      </Alert>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>

              {gameOver && !isRedirecting && (
                <CardFooter className="flex justify-between">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="outline"
                      className="border-green-500/20 text-game-accent hover:bg-green-50 rounded-full"
                      onClick={resetGame}
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Try Again
                    </Button>
                  </motion.div>

                  {gameWon && (
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, delay: 0.5 }}
                    >
                      <Button
                        className="bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 rounded-full"
                        onClick={() => router.push("/daily-games/idiom-challenge")}
                      >
                        Next Game
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </motion.div>
                  )}
                </CardFooter>
              )}

              {/* Redirect countdown */}
              {isRedirecting && (
                <CardFooter>
                  <div className="w-full text-center">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-game-accent/70">
                      Moving to next challenge in <span className="font-bold text-green-500">{redirectCountdown}</span>{" "}
                      seconds...
                    </motion.div>
                  </div>
                </CardFooter>
              )}
            </Card>
          </motion.div>

          {/* Stats and info */}
          <motion.div className="space-y-6" variants={containerVariants} initial="hidden" animate="visible">
            <motion.div variants={itemVariants}>
              <Card className="bg-white border-0 shadow-lg rounded-xl text-game-accent">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Trophy className="mr-2 h-5 w-5 text-amber-500" />
                    Game Info
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
                      <div className="text-2xl font-bold text-green-600">{score}</div>
                      <div className="text-sm text-game-accent/70">Pairs Matched</div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
                      <div className="text-2xl font-bold text-green-600">{wordPairs.length - score}</div>
                      <div className="text-sm text-game-accent/70">Remaining</div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <h3 className="text-sm font-medium mb-2">How to Play</h3>
                    <ul className="space-y-2 text-sm text-game-accent/70 list-disc list-inside">
                      <li>Select a word from the left column</li>
                      <li>Then select its opposite from the right column</li>
                      <li>Correctly matched pairs will stay highlighted</li>
                      <li>Match all pairs before time runs out</li>
                      <li>You have 60 seconds to complete the game</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}

