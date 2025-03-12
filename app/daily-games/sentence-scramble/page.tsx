"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence, Reorder } from "framer-motion"
import {
  ArrowLeft,
  Check,
  RefreshCw,
  Clock,
  Trophy,
  Calendar,
  ChevronRight,
  Sparkles,
  GripVertical,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Navigation from "@/components/navigation"

// Types
interface Word {
  id: string
  text: string
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

export default function SentenceScramblePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [gameWon, setGameWon] = useState(false)
  const [attemptsLeft, setAttemptsLeft] = useState(3)
  const [message, setMessage] = useState<string | null>(null)
  const [redirectCountdown, setRedirectCountdown] = useState(3)
  const [isRedirecting, setIsRedirecting] = useState(false)

  // Game data
  const [sentences, setSentences] = useState([
    {
      original: "The quick brown fox jumps over the lazy dog",
      hint: "A sentence containing all letters of the alphabet",
      words: [] as Word[],
      completed: false,
    },
    {
      original: "Actions speak louder than words",
      hint: "A common proverb about behavior vs. speech",
      words: [] as Word[],
      completed: false,
    },
    {
      original: "Time flies when you are having fun",
      hint: "A saying about how enjoyment affects our perception",
      words: [] as Word[],
      completed: false,
    },
  ])
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0)
  const [words, setWords] = useState<Word[]>([])

  // Initialize the game
  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      // Initialize the first sentence
      initializeSentence(0)
      setIsLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  // Initialize a sentence by scrambling its words
  const initializeSentence = (index: number) => {
    const sentence = sentences[index]
    const wordArray = sentence.original.split(" ").map((word, i) => ({
      id: `word-${i}`,
      text: word,
    }))

    // Shuffle the words
    const shuffled = [...wordArray].sort(() => Math.random() - 0.5)

    // Update the sentence words and current words state
    const updatedSentences = [...sentences]
    updatedSentences[index].words = wordArray
    setSentences(updatedSentences)
    setWords(shuffled)
  }

  // Handle checking the sentence
  const checkSentence = () => {
    const currentSentence = sentences[currentSentenceIndex]
    const originalWords = currentSentence.words.map((w) => w.text)
    const currentWords = words.map((w) => w.text)

    // Check if the order is correct
    const isCorrect = originalWords.join(" ") === currentWords.join(" ")

    if (isCorrect) {
      // Mark as completed
      const updatedSentences = [...sentences]
      updatedSentences[currentSentenceIndex].completed = true
      setSentences(updatedSentences)

      setMessage("Correct! The sentence is in the right order.")
      setGameWon(true)

      // Move to next sentence or end game
      if (currentSentenceIndex < sentences.length - 1) {
        setTimeout(() => {
          setCurrentSentenceIndex(currentSentenceIndex + 1)
          initializeSentence(currentSentenceIndex + 1)
          setMessage(null)
          setGameWon(false)
        }, 2000)
      } else {
        setGameOver(true)
        // Start the redirect countdown after a short delay
        setTimeout(() => {
          setIsRedirecting(true)
        }, 2000)
      }
    } else {
      setMessage("That's not quite right. Try again!")
      const remaining = attemptsLeft - 1
      setAttemptsLeft(remaining)

      if (remaining <= 0) {
        setGameOver(true)
        setMessage(`Game over! The correct sentence was: "${currentSentence.original}"`)
      }
    }
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
      router.push("/daily-games/word-association")
    }
  }, [isRedirecting, redirectCountdown, router])

  // Reset the current sentence
  const resetSentence = () => {
    initializeSentence(currentSentenceIndex)
    setMessage(null)
  }

  // Reset the entire game
  const resetGame = () => {
    setCurrentSentenceIndex(0)
    initializeSentence(0)
    setGameOver(false)
    setGameWon(false)
    setAttemptsLeft(3)
    setMessage(null)

    // Reset completion status
    const updatedSentences = sentences.map((sentence) => ({
      ...sentence,
      completed: false,
    }))
    setSentences(updatedSentences)
  }

  const currentSentence = sentences[currentSentenceIndex]

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
              Sentence Scramble
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
                <Sparkles className="h-5 w-5 text-blue-500" />
              </motion.span>
            </h1>
            <p className="text-game-accent/80">Rearrange the words to form a correct English sentence</p>
          </motion.div>

          <motion.div className="flex items-center gap-4 mt-4 md:mt-0" variants={itemVariants}>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Badge
                variant="outline"
                className="bg-white text-game-accent border-blue-500/20 px-3 py-1.5 text-sm rounded-full shadow-sm"
              >
                <Calendar className="mr-2 h-4 w-4 text-blue-500" />
                {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </Badge>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              animate={
                attemptsLeft <= 1
                  ? {
                      scale: [1, 1.05, 1],
                      transition: { duration: 1, repeat: Number.POSITIVE_INFINITY },
                    }
                  : {}
              }
            >
              <Badge
                variant="outline"
                className={`bg-white text-game-accent border-blue-500/20 px-3 py-1.5 text-sm rounded-full shadow-sm ${
                  attemptsLeft <= 1 ? "border-red-500" : ""
                }`}
              >
                <Clock className={`mr-2 h-4 w-4 ${attemptsLeft <= 1 ? "text-red-500" : "text-blue-500"}`} />
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
                <CardTitle>
                  Sentence Challenge {currentSentenceIndex + 1}/{sentences.length}
                </CardTitle>
                <CardDescription className="text-game-accent/70">
                  Drag and drop the words to form a correct sentence
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Hint */}
                <motion.div className="bg-blue-50 border border-blue-100 p-4 rounded-xl" variants={itemVariants}>
                  <h3 className="font-medium text-blue-700 mb-1">Hint:</h3>
                  <p className="text-blue-600">{currentSentence.hint}</p>
                </motion.div>

                {/* Words area */}
                <motion.div variants={itemVariants} className="bg-gray-50 p-4 rounded-xl min-h-32">
                  <h3 className="font-medium text-lg mb-4">Arrange the words:</h3>
                  <Reorder.Group axis="y" values={words} onReorder={setWords} className="space-y-2">
                    {words.map((word) => (
                      <Reorder.Item
                        key={word.id}
                        value={word}
                        className="bg-white border border-gray-200 p-3 rounded-lg shadow-sm flex items-center justify-between cursor-move"
                        whileDrag={{
                          scale: 1.05,
                          backgroundColor: "rgb(239, 246, 255)",
                          borderColor: "rgb(147, 197, 253)",
                        }}
                      >
                        <span className="font-medium">{word.text}</span>
                        <GripVertical className="h-4 w-4 text-gray-400" />
                      </Reorder.Item>
                    ))}
                  </Reorder.Group>
                </motion.div>

                {/* Preview of the sentence */}
                <motion.div variants={itemVariants} className="bg-gray-50 p-4 rounded-xl">
                  <h3 className="font-medium text-lg mb-2">Your sentence:</h3>
                  <p className="text-game-accent text-lg">{words.map((w) => w.text).join(" ")}</p>
                </motion.div>

                {/* Action buttons */}
                {!gameOver && (
                  <motion.div className="flex gap-2 justify-between" variants={itemVariants}>
                    <Button
                      variant="outline"
                      onClick={resetSentence}
                      className="border-blue-500/20 text-blue-600 hover:bg-blue-50"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Reset Order
                    </Button>
                    <Button
                      onClick={checkSentence}
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700"
                    >
                      Check Sentence
                    </Button>
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
              </CardContent>

              {gameOver && !isRedirecting && (
                <CardFooter className="flex justify-between">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="outline"
                      className="border-blue-500/20 text-game-accent hover:bg-blue-50 rounded-full"
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
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 rounded-full"
                        onClick={() => router.push("/daily-games/word-association")}
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
                      Moving to next challenge in <span className="font-bold text-blue-500">{redirectCountdown}</span>{" "}
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
                    Your Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {sentences.map((sentence, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg flex items-center gap-2 ${
                          sentence.completed
                            ? "bg-green-50 border border-green-100"
                            : index === currentSentenceIndex
                              ? "bg-blue-50 border border-blue-100"
                              : "bg-gray-50 border border-gray-100"
                        }`}
                      >
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center ${
                            sentence.completed
                              ? "bg-green-500 text-white"
                              : index === currentSentenceIndex
                                ? "bg-blue-500 text-white"
                                : "bg-gray-300 text-white"
                          }`}
                        >
                          {sentence.completed ? <Check className="h-4 w-4" /> : index + 1}
                        </div>
                        <span
                          className={`text-sm ${
                            sentence.completed
                              ? "text-green-700"
                              : index === currentSentenceIndex
                                ? "text-blue-700 font-medium"
                                : "text-gray-500"
                          }`}
                        >
                          Sentence {index + 1}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2">
                    <h3 className="text-sm font-medium mb-2">How to Play</h3>
                    <ul className="space-y-2 text-sm text-game-accent/70 list-disc list-inside">
                      <li>Drag and drop the words to rearrange them</li>
                      <li>Form a grammatically correct English sentence</li>
                      <li>Use the hint to guide you</li>
                      <li>You have 3 attempts for each sentence</li>
                      <li>Complete all sentences to win</li>
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

