"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft,
  Check,
  X,
  HelpCircle,
  RefreshCw,
  Clock,
  Trophy,
  Calendar,
  ChevronRight,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Navigation from "@/components/navigation"

// Types
interface Guess {
  word: string
  correct: boolean
  partialMatch: boolean
}

interface Clue {
  text: string
  revealed: boolean
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

const letterVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.3,
    },
  }),
}

export default function WordGuessGame() {
  const router = useRouter()
  const [targetWord] = useState("VOCABULARY")
  const [guesses, setGuesses] = useState<Guess[]>([])
  const [currentGuess, setCurrentGuess] = useState("")
  const [gameOver, setGameOver] = useState(false)
  const [gameWon, setGameWon] = useState(false)
  const [attemptsLeft, setAttemptsLeft] = useState(6)
  const [message, setMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  // Update the initial clues state to ensure only the first clue is revealed
  const [clues, setClues] = useState<Clue[]>([
    { text: "This word refers to all the words known and used by a person", revealed: true },
    { text: "It starts with the letter V", revealed: false },
    { text: "It has 10 letters", revealed: false },
    { text: "It's related to language learning", revealed: false },
    { text: "It ends with the letters 'ARY'", revealed: false },
  ])
  const [redirectCountdown, setRedirectCountdown] = useState(3)
  const [isRedirecting, setIsRedirecting] = useState(false)

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1800)

    return () => clearTimeout(timer)
  }, [])

  // Fix the clue reveal logic to only show one new clue at a time after an incorrect guess

  // Replace the current useEffect for revealing clues with this corrected version:
  // Reveal a new clue after each incorrect guess
  useEffect(() => {
    const revealNextClue = () => {
      const nextUnrevealedIndex = clues.findIndex((clue) => !clue.revealed)
      if (nextUnrevealedIndex !== -1) {
        const updatedClues = [...clues]
        updatedClues[nextUnrevealedIndex].revealed = true
        setClues(updatedClues)
      }
    }

    // Only reveal a new clue when a new incorrect guess is added
    if (guesses.length > 0 && !guesses[guesses.length - 1].correct) {
      revealNextClue()
    }
  }, [guesses])

  // Handle automatic redirection after winning
  useEffect(() => {
    if (isRedirecting && redirectCountdown > 0) {
      const timer = setTimeout(() => {
        setRedirectCountdown(redirectCountdown - 1)
      }, 1000)

      return () => clearTimeout(timer)
    } else if (isRedirecting && redirectCountdown === 0) {
      // Navigate to the next game (sentence-scramble)
      router.push("/daily-games/sentence-scramble")
    }
  }, [isRedirecting, redirectCountdown, router])

  // Update the handleGuess function to ensure it doesn't interfere with the clue reveal logic
  const handleGuess = () => {
    if (!currentGuess) return

    const formattedGuess = currentGuess.trim().toUpperCase()

    // Check if the word has already been guessed
    if (guesses.some((g) => g.word === formattedGuess)) {
      setMessage("You've already tried this word!")
      setTimeout(() => setMessage(null), 2000)
      return
    }

    const isCorrect = formattedGuess === targetWord
    const hasPartialMatch =
      (!isCorrect && targetWord.includes(formattedGuess)) ||
      (formattedGuess.length >= 3 && targetWord.includes(formattedGuess.substring(0, 3)))

    const newGuess: Guess = {
      word: formattedGuess,
      correct: isCorrect,
      partialMatch: hasPartialMatch,
    }

    setGuesses([...guesses, newGuess])
    setCurrentGuess("")

    if (isCorrect) {
      setGameWon(true)
      setGameOver(true)
      setMessage("Congratulations! You found the word!")

      // Start the redirect countdown after a short delay
      setTimeout(() => {
        setIsRedirecting(true)
      }, 2000)
    } else {
      const remaining = attemptsLeft - 1
      setAttemptsLeft(remaining)

      if (remaining <= 0) {
        setGameOver(true)
        setMessage(`Game over! The word was ${targetWord}`)
      }
    }
  }

  // Also update the resetGame function to ensure only the first clue is revealed when resetting:
  const resetGame = () => {
    // Reset the game state
    setGuesses([])
    setCurrentGuess("")
    setGameOver(false)
    setGameWon(false)
    setAttemptsLeft(6)
    setMessage(null)
    setClues(
      clues.map((clue, index) => ({
        ...clue,
        revealed: index === 0, // Only reveal the first clue
      })),
    )
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
              Word Guess
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
                <Sparkles className="h-5 w-5 text-amber-500" />
              </motion.span>
            </h1>
            <p className="text-game-accent/80">Guess the word based on the clues provided</p>
          </motion.div>

          <motion.div className="flex items-center gap-4 mt-4 md:mt-0" variants={itemVariants}>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Badge
                variant="outline"
                className="bg-white text-game-accent border-game-primary/20 px-3 py-1.5 text-sm rounded-full shadow-sm"
              >
                <Calendar className="mr-2 h-4 w-4 text-game-primary" />
                {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </Badge>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              animate={
                attemptsLeft <= 2
                  ? {
                      scale: [1, 1.05, 1],
                      transition: { duration: 1, repeat: Number.POSITIVE_INFINITY },
                    }
                  : {}
              }
            >
              <Badge
                variant="outline"
                className={`bg-white text-game-accent border-game-primary/20 px-3 py-1.5 text-sm rounded-full shadow-sm ${
                  attemptsLeft <= 2 ? "border-red-500" : ""
                }`}
              >
                <Clock className={`mr-2 h-4 w-4 ${attemptsLeft <= 2 ? "text-red-500" : "text-amber-500"}`} />
                {attemptsLeft} attempts left
              </Badge>
            </motion.div>
          </motion.div>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Game area */}
          <motion.div className="md:col-span-2" variants={containerVariants} initial="hidden" animate="visible">
            <Card className="bg-white border-0 shadow-lg rounded-xl text-game-accent overflow-hidden">
              <CardHeader>
                <CardTitle>Daily Word Challenge</CardTitle>
                <CardDescription className="text-game-accent/70">Use the clues to guess today's word</CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Clues section */}
                <motion.div className="space-y-3" variants={itemVariants}>
                  <h3 className="font-medium text-lg">Clues:</h3>
                  <div className="space-y-2">
                    {clues.map((clue, index) => (
                      <AnimatePresence key={index} mode="wait">
                        <motion.div
                          initial={clue.revealed ? { opacity: 1, height: "auto" } : { opacity: 0, height: 0 }}
                          animate={clue.revealed ? { opacity: 1, height: "auto" } : { opacity: 0.3, height: "auto" }}
                          transition={{ duration: 0.5 }}
                          className={`p-3 rounded-xl ${
                            clue.revealed
                              ? "bg-amber-50 border border-amber-100 text-game-accent"
                              : "bg-gray-50 border border-gray-100 text-gray-500"
                          }`}
                        >
                          {clue.revealed ? (
                            <motion.div
                              className="flex items-start"
                              initial={{ x: -10, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              transition={{ duration: 0.3 }}
                            >
                              <HelpCircle className="h-5 w-5 mr-2 text-amber-500 shrink-0 mt-0.5" />
                              <span>{clue.text}</span>
                            </motion.div>
                          ) : (
                            <div className="flex items-center">
                              <HelpCircle className="h-5 w-5 mr-2 text-gray-500" />
                              <span>Clue locked - Make a guess to reveal</span>
                            </div>
                          )}
                        </motion.div>
                      </AnimatePresence>
                    ))}
                  </div>
                </motion.div>

                {/* Input area */}
                {!gameOver && (
                  <motion.div className="flex gap-2" variants={itemVariants}>
                    <Input
                      type="text"
                      placeholder="Enter your guess"
                      value={currentGuess}
                      onChange={(e) => setCurrentGuess(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleGuess()}
                      className="bg-white border-game-primary/20 text-game-accent placeholder:text-gray-400 rounded-full"
                      maxLength={15}
                    />
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button onClick={handleGuess} className="game-button rounded-full" disabled={!currentGuess}>
                        Guess
                      </Button>
                    </motion.div>
                  </motion.div>
                )}

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
                              : "bg-blue-50 border-blue-200 text-blue-700"
                        } rounded-xl`}
                      >
                        <AlertDescription>{message}</AlertDescription>
                      </Alert>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Previous guesses */}
                {guesses.length > 0 && (
                  <motion.div variants={itemVariants}>
                    <h3 className="font-medium text-lg mb-2">Your Guesses:</h3>
                    <div className="space-y-2">
                      {guesses.map((guess, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3 }}
                          className={`flex items-center justify-between p-3 rounded-xl ${
                            guess.correct
                              ? "bg-green-50 border border-green-200"
                              : guess.partialMatch
                                ? "bg-amber-50 border border-amber-200"
                                : "bg-red-50 border border-red-200"
                          }`}
                        >
                          <div className="flex">
                            {guess.word.split("").map((letter, i) => (
                              <motion.span
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05, duration: 0.2 }}
                                className="font-medium"
                              >
                                {letter}
                              </motion.span>
                            ))}
                          </div>

                          {guess.correct ? (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", stiffness: 500 }}
                            >
                              <Check className="h-5 w-5 text-green-500" />
                            </motion.div>
                          ) : guess.partialMatch ? (
                            <div className="flex items-center">
                              <span className="text-sm mr-2 text-amber-600">Partial match</span>
                              <motion.div
                                className="h-5 w-5 rounded-full border-2 border-amber-500 flex items-center justify-center"
                                animate={{
                                  scale: [1, 1.2, 1],
                                  borderColor: ["rgb(245, 158, 11)", "rgb(251, 191, 36)", "rgb(245, 158, 11)"],
                                }}
                                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                              >
                                <div className="h-2 w-2 bg-amber-500 rounded-full"></div>
                              </motion.div>
                            </div>
                          ) : (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", stiffness: 500 }}
                            >
                              <X className="h-5 w-5 text-red-500" />
                            </motion.div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </CardContent>

              {gameOver && !isRedirecting && (
                <CardFooter className="flex justify-between">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="outline"
                      className="border-game-primary/20 text-game-accent hover:bg-game-primary/10 rounded-full"
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
                        className="game-button rounded-full"
                        onClick={() => router.push("/daily-games/sentence-scramble")}
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
                      Moving to next challenge in{" "}
                      <span className="font-bold text-game-primary">{redirectCountdown}</span> seconds...
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
                    Your Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <motion.div
                      className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100"
                      whileHover={{ y: -5, backgroundColor: "rgba(215, 108, 130, 0.05)" }}
                    >
                      <motion.div
                        className="text-2xl font-bold text-game-primary"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                      >
                        12
                      </motion.div>
                      <div className="text-sm text-game-accent/70">Words Guessed</div>
                    </motion.div>
                    <motion.div
                      className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100"
                      whileHover={{ y: -5, backgroundColor: "rgba(215, 108, 130, 0.05)" }}
                    >
                      <motion.div
                        className="text-2xl font-bold text-game-primary"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, delay: 0.3 }}
                      >
                        5
                      </motion.div>
                      <div className="text-sm text-game-accent/70">Day Streak</div>
                    </motion.div>
                  </div>

                  <div className="pt-2">
                    <h3 className="text-sm font-medium mb-2">How to Play</h3>
                    <ul className="space-y-2 text-sm text-game-accent/70 list-disc list-inside">
                      <li>Read the clues carefully</li>
                      <li>Type your guess in the input field</li>
                      <li>Each incorrect guess reveals a new clue</li>
                      <li>You have 6 attempts to guess the word</li>
                      <li>Green means correct, yellow means partial match</li>
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

