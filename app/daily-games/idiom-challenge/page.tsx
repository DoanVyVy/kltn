"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, Check, X, RefreshCw, Clock, Trophy, Calendar, ChevronRight, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import Navigation from "@/components/navigation"

// Types
interface Idiom {
  id: number
  phrase: string
  meaning: string
  options: string[]
  correctOption: number
  userAnswer: number | null
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

export default function IdiomChallengePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [gameWon, setGameWon] = useState(false)
  const [attemptsLeft, setAttemptsLeft] = useState(5)
  const [message, setMessage] = useState<string | null>(null)
  const [redirectCountdown, setRedirectCountdown] = useState(3)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [currentIdiomIndex, setCurrentIdiomIndex] = useState(0)
  const [score, setScore] = useState(0)

  // Game data
  const [idioms, setIdioms] = useState<Idiom[]>([
    {
      id: 1,
      phrase: "Break a leg",
      meaning: "Good luck",
      options: ["Good luck", "Be careful", "Take a rest", "Run away quickly"],
      correctOption: 0,
      userAnswer: null,
    },
    {
      id: 2,
      phrase: "Bite the bullet",
      meaning: "To face a difficult situation bravely",
      options: [
        "To eat something hard",
        "To face a difficult situation bravely",
        "To speak harshly to someone",
        "To make a mistake",
      ],
      correctOption: 1,
      userAnswer: null,
    },
    {
      id: 3,
      phrase: "Cost an arm and a leg",
      meaning: "To be very expensive",
      options: ["To require a lot of effort", "To cause physical harm", "To be very expensive", "To take a long time"],
      correctOption: 2,
      userAnswer: null,
    },
    {
      id: 4,
      phrase: "Hit the nail on the head",
      meaning: "To describe exactly what is causing a situation or problem",
      options: [
        "To hurt yourself while working",
        "To complete a task perfectly",
        "To describe exactly what is causing a situation or problem",
        "To fix something quickly",
      ],
      correctOption: 2,
      userAnswer: null,
    },
    {
      id: 5,
      phrase: "Under the weather",
      meaning: "Feeling ill",
      options: ["Feeling sad", "Feeling ill", "Experiencing bad luck", "Being unprepared"],
      correctOption: 1,
      userAnswer: null,
    },
  ])

  // Initialize the game
  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  // Handle automatic redirection after winning
  useEffect(() => {
    if (isRedirecting && redirectCountdown > 0) {
      const timer = setTimeout(() => {
        setRedirectCountdown(redirectCountdown - 1)
      }, 1000)

      return () => clearTimeout(timer)
    } else if (isRedirecting && redirectCountdown === 0) {
      // Navigate back to the dashboard
      router.push("/dashboard")
    }
  }, [isRedirecting, redirectCountdown, router])

  // Handle answer selection
  const handleSelectAnswer = (optionIndex: number) => {
    if (gameOver) return

    // Update the idiom with user's answer
    const updatedIdioms = [...idioms]
    updatedIdioms[currentIdiomIndex].userAnswer = optionIndex
    setIdioms(updatedIdioms)

    const currentIdiom = idioms[currentIdiomIndex]
    const isCorrect = optionIndex === currentIdiom.correctOption

    if (isCorrect) {
      setMessage("Correct! That's the right meaning.")
      setScore(score + 1)

      // Move to next idiom after a delay
      setTimeout(() => {
        if (currentIdiomIndex < idioms.length - 1) {
          setCurrentIdiomIndex(currentIdiomIndex + 1)
          setMessage(null)
        } else {
          // All idioms completed
          setGameWon(true)
          setGameOver(true)
          setMessage(`Congratulations! You got ${score + 1} out of ${idioms.length} correct!`)

          // Start the redirect countdown after a short delay
          setTimeout(() => {
            setIsRedirecting(true)
          }, 2000)
        }
      }, 1500)
    } else {
      setMessage(`Incorrect. The right meaning is: "${currentIdiom.meaning}"`)
      const remaining = attemptsLeft - 1
      setAttemptsLeft(remaining)

      // Move to next idiom after a delay
      setTimeout(() => {
        if (currentIdiomIndex < idioms.length - 1 && remaining > 0) {
          setCurrentIdiomIndex(currentIdiomIndex + 1)
          setMessage(null)
        } else {
          // Game over
          setGameOver(true)
          if (remaining <= 0) {
            setMessage(`Game over! You got ${score} out of ${idioms.length} correct.`)
          }
        }
      }, 2000)
    }
  }

  // Reset the game
  const resetGame = () => {
    // Reset idioms
    const resetIdioms = idioms.map((idiom) => ({
      ...idiom,
      userAnswer: null,
    }))
    setIdioms(resetIdioms)

    // Reset game state
    setCurrentIdiomIndex(0)
    setScore(0)
    setGameOver(false)
    setGameWon(false)
    setAttemptsLeft(5)
    setMessage(null)
  }

  const currentIdiom = idioms[currentIdiomIndex]

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
              Idiom Challenge
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
                <Sparkles className="h-5 w-5 text-purple-500" />
              </motion.span>
            </h1>
            <p className="text-game-accent/80">Test your knowledge of English idioms</p>
          </motion.div>

          <motion.div className="flex items-center gap-4 mt-4 md:mt-0" variants={itemVariants}>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Badge
                variant="outline"
                className="bg-white text-game-accent border-purple-500/20 px-3 py-1.5 text-sm rounded-full shadow-sm"
              >
                <Calendar className="mr-2 h-4 w-4 text-purple-500" />
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
                className={`bg-white text-game-accent border-purple-500/20 px-3 py-1.5 text-sm rounded-full shadow-sm ${
                  attemptsLeft <= 2 ? "border-red-500" : ""
                }`}
              >
                <Clock className={`mr-2 h-4 w-4 ${attemptsLeft <= 2 ? "text-red-500" : "text-purple-500"}`} />
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
                  Idiom {currentIdiomIndex + 1}/{idioms.length}
                </CardTitle>
                <CardDescription className="text-game-accent/70">
                  Choose the correct meaning of the idiom
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Idiom display */}
                <motion.div
                  className="bg-purple-50 border border-purple-100 p-6 rounded-xl text-center"
                  variants={itemVariants}
                >
                  <h2 className="text-2xl font-bold text-purple-700 mb-2">"{currentIdiom.phrase}"</h2>
                  <p className="text-purple-600 text-sm">What does this idiom mean?</p>
                </motion.div>

                {/* Options */}
                <motion.div variants={itemVariants} className="space-y-4">
                  <RadioGroup
                    value={currentIdiom.userAnswer?.toString() || ""}
                    disabled={currentIdiom.userAnswer !== null || gameOver}
                  >
                    {currentIdiom.options.map((option, index) => (
                      <div
                        key={index}
                        className={`flex items-center space-x-2 p-4 rounded-lg border ${
                          currentIdiom.userAnswer === null
                            ? "border-gray-200 hover:border-purple-200 hover:bg-purple-50"
                            : currentIdiom.userAnswer === index
                              ? currentIdiom.correctOption === index
                                ? "border-green-200 bg-green-50"
                                : "border-red-200 bg-red-50"
                              : currentIdiom.correctOption === index
                                ? "border-green-200 bg-green-50"
                                : "border-gray-200 bg-gray-50"
                        }`}
                      >
                        <RadioGroupItem
                          value={index.toString()}
                          id={`option-${index}`}
                          onClick={() => handleSelectAnswer(index)}
                          className={
                            currentIdiom.correctOption === index && currentIdiom.userAnswer !== null
                              ? "text-green-500 border-green-500"
                              : ""
                          }
                        />
                        <Label
                          htmlFor={`option-${index}`}
                          className={`flex-grow ${
                            currentIdiom.userAnswer === null
                              ? "text-game-accent"
                              : currentIdiom.userAnswer === index
                                ? currentIdiom.correctOption === index
                                  ? "text-green-700"
                                  : "text-red-700"
                                : currentIdiom.correctOption === index
                                  ? "text-green-700"
                                  : "text-gray-500"
                          }`}
                        >
                          {option}
                        </Label>
                        {currentIdiom.userAnswer !== null &&
                          (currentIdiom.correctOption === index ? (
                            <Check className="h-5 w-5 text-green-500" />
                          ) : currentIdiom.userAnswer === index ? (
                            <X className="h-5 w-5 text-red-500" />
                          ) : null)}
                      </div>
                    ))}
                  </RadioGroup>
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
                          message.includes("Correct")
                            ? "bg-green-50 border-green-200 text-green-700"
                            : message.includes("Congratulations")
                              ? "bg-purple-50 border-purple-200 text-purple-700"
                              : "bg-red-50 border-red-200 text-red-700"
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
                      className="border-purple-500/20 text-game-accent hover:bg-purple-50 rounded-full"
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
                        className="bg-gradient-to-r from-purple-500 to-violet-600 text-white hover:from-purple-600 hover:to-violet-700 rounded-full"
                        onClick={() => router.push("/dashboard")}
                      >
                        Complete Challenge
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
                      Completing daily challenges in{" "}
                      <span className="font-bold text-purple-500">{redirectCountdown}</span> seconds...
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
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
                      <div className="text-2xl font-bold text-purple-600">{score}</div>
                      <div className="text-sm text-game-accent/70">Correct</div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
                      <div className="text-2xl font-bold text-purple-600">
                        {currentIdiomIndex + 1}/{idioms.length}
                      </div>
                      <div className="text-sm text-game-accent/70">Progress</div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <h3 className="text-sm font-medium mb-2">How to Play</h3>
                    <ul className="space-y-2 text-sm text-game-accent/70 list-disc list-inside">
                      <li>Read the idiom carefully</li>
                      <li>Select the correct meaning from the options</li>
                      <li>You have 5 attempts in total</li>
                      <li>Each correct answer earns you a point</li>
                      <li>Try to learn new idioms as you play!</li>
                    </ul>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                    <h3 className="text-sm font-medium text-purple-700 mb-1">Did you know?</h3>
                    <p className="text-xs text-purple-600">
                      English has over 25,000 idioms! These expressions often have meanings that can't be understood
                      from the individual words.
                    </p>
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

