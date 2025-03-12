"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, ChevronRight, Volume2, HelpCircle, Check, X, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import Navigation from "@/components/navigation"

// Animation variants
const containerVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    transition: {
      duration: 0.3,
    },
  },
}

const buttonVariants = {
  idle: { scale: 1 },
  hover: { scale: 1.05 },
  tap: { scale: 0.95 },
  correct: {
    backgroundColor: "rgb(34, 197, 94)",
    color: "white",
    scale: [1, 1.1, 1],
    transition: { duration: 0.3 },
  },
  incorrect: {
    backgroundColor: "rgb(239, 68, 68)",
    color: "white",
    scale: [1, 0.9, 1],
    transition: { duration: 0.3 },
  },
}

const floatAnimation = {
  y: [0, -10, 0],
  transition: {
    duration: 2,
    repeat: Number.POSITIVE_INFINITY,
    ease: "easeInOut",
  },
}

// Types
interface Word {
  id: number
  term: string
  definition: string
  type: string
  example: string
  pronunciation: string
  audioUrl: string
  incorrectAnswers: string[]
}

interface LessonData {
  id: number
  courseId: number
  courseTitle: string
  sectionTitle: string
  totalWords: number
  words: Word[]
}

// Sample lesson data
const lessonData: LessonData = {
  id: 1,
  courseId: 1,
  courseTitle: "500 Từ vựng TOEIC cơ bản",
  sectionTitle: "Chủ đề: Văn phòng và Công sở",
  totalWords: 10,
  words: [
    {
      id: 1,
      term: "deadline",
      definition: "thời hạn",
      type: "n",
      example: "We must meet the ____ for this project submission",
      pronunciation: "/ˈdedlaɪn/",
      audioUrl: "#",
      incorrectAnswers: ["timeline", "schedule", "target"],
    },
    // Add more words as needed
  ],
}

export default function LearnVocabularyPage() {
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [showAnswer, setShowAnswer] = useState(false)
  const [progress, setProgress] = useState(0)
  const [stats, setStats] = useState({
    correct: 0,
    incorrect: 0,
    skipped: 0,
  })
  const [isAudioPlaying, setIsAudioPlaying] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)
  const [answerOptions, setAnswerOptions] = useState<string[]>([])

  const currentWord = lessonData.words[currentIndex]

  useEffect(() => {
    setProgress((currentIndex / lessonData.totalWords) * 100)
  }, [currentIndex])

  const handleSelectAnswer = (answer: string) => {
    if (selectedAnswer || showAnswer) return // Prevent multiple selections

    setSelectedAnswer(answer)
    const correct = answer === currentWord.term
    setIsCorrect(correct)
    setStats((prev) => ({
      ...prev,
      [correct ? "correct" : "incorrect"]: prev[correct ? "correct" : "incorrect"] + 1,
    }))

    // Show the answer after selection
    setShowAnswer(true)

    // Auto advance after a delay if correct
    if (correct) {
      setTimeout(() => {
        handleNext()
      }, 1500)
    }
  }

  const handleNext = () => {
    if (currentIndex < lessonData.words.length - 1) {
      // Reset states
      setSelectedAnswer(null)
      setIsCorrect(null)
      setShowAnswer(false)
      setIsAudioPlaying(false)
      setAnswerOptions([]) // Reset options for the next word

      // Animate to next word
      setCurrentIndex(currentIndex + 1)
    } else {
      // Show celebration animation
      setShowCelebration(true)
      setTimeout(() => {
        router.push(`/vocabulary/${lessonData.courseId}`)
      }, 3000)
    }
  }

  const handlePlayAudio = () => {
    setIsAudioPlaying(true)
    // Simulate audio playing animation
    setTimeout(() => {
      setIsAudioPlaying(false)
    }, 2000)
  }

  // Get shuffled answer options
  const getAnswerOptions = () => {
    // Only shuffle once when the current word changes
    if (answerOptions.length === 0) {
      const options = [currentWord.term, ...currentWord.incorrectAnswers].sort(() => Math.random() - 0.5)
      setAnswerOptions(options)
      return options
    }
    return answerOptions
  }

  return (
    <div className="min-h-screen bg-game-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6 flex items-center justify-between"
        >
          <Button
            variant="ghost"
            className="gap-2 text-game-accent hover:bg-game-primary/10 rounded-full"
            onClick={() => router.push(`/vocabulary/${lessonData.courseId}`)}
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại
          </Button>

          <div className="text-right">
            <h2 className="text-lg font-bold text-game-accent">{lessonData.courseTitle}</h2>
            <p className="text-sm text-game-accent/70">{lessonData.sectionTitle}</p>
          </div>
        </motion.div>

        <div className="mb-6 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-game-accent font-medium">
              Từ {currentIndex + 1}/{lessonData.totalWords}
            </span>
            <div className="flex gap-2">
              <Badge className="bg-green-100 text-green-700 rounded-full px-3">
                <Check className="h-3 w-3 mr-1" />
                {stats.correct}
              </Badge>
              <Badge className="bg-red-100 text-red-700 rounded-full px-3">
                <X className="h-3 w-3 mr-1" />
                {stats.incorrect}
              </Badge>
            </div>
          </div>
          <Progress
            value={progress}
            className="h-3 rounded-full bg-game-background"
            indicatorClassName="bg-gradient-to-r from-game-primary to-game-secondary rounded-full"
          />
        </div>

        <AnimatePresence mode="wait">
          {showCelebration ? (
            <motion.div
              className="flex flex-col items-center justify-center space-y-6 rounded-3xl bg-white p-8 text-center shadow-lg"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
            >
              <motion.div animate={floatAnimation} className="flex gap-2">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                  className="text-6xl"
                >
                  🎉
                </motion.div>
                <motion.div
                  animate={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, delay: 0.3 }}
                  className="text-6xl"
                >
                  🎊
                </motion.div>
              </motion.div>
              <h2 className="text-3xl font-bold text-game-accent">Chúc mừng!</h2>
              <p className="text-game-accent/70">Bạn đã hoàn thành bài học</p>

              <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
                <div className="rounded-2xl bg-green-50 p-4 text-center border-2 border-green-100">
                  <div className="text-2xl font-bold text-green-600">{stats.correct}</div>
                  <div className="text-sm text-green-600">Đúng</div>
                </div>
                <div className="rounded-2xl bg-red-50 p-4 text-center border-2 border-red-100">
                  <div className="text-2xl font-bold text-red-600">{stats.incorrect}</div>
                  <div className="text-sm text-red-600">Sai</div>
                </div>
              </div>

              <motion.div
                className="mt-4 w-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <Button
                  className="game-button w-full rounded-full text-lg py-6"
                  onClick={() => router.push(`/vocabulary/${lessonData.courseId}`)}
                >
                  Hoàn thành
                  <Star className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>

              <motion.p
                className="text-game-accent/50 text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              >
                Đang chuyển hướng...
              </motion.p>
            </motion.div>
          ) : (
            <motion.div
              key={currentIndex}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="flex flex-col items-center"
            >
              <Card className="w-full max-w-2xl overflow-hidden bg-white rounded-3xl shadow-lg border-0">
                <div className="p-8">
                  <div className="mb-8 flex flex-col items-center space-y-4">
                    <h3 className="text-xl font-medium text-game-accent">Chọn từ bạn nghe được</h3>
                    <motion.button
                      animate={
                        isAudioPlaying
                          ? {
                              scale: [1, 1.2, 1],
                              boxShadow: [
                                "0 0 0 rgba(215, 108, 130, 0)",
                                "0 0 20px rgba(215, 108, 130, 0.7)",
                                "0 0 0 rgba(215, 108, 130, 0)",
                              ],
                            }
                          : {}
                      }
                      className="h-32 w-32 rounded-full bg-gradient-to-r from-game-primary to-game-secondary text-white transition-all"
                      onClick={handlePlayAudio}
                      transition={{ duration: 0.5 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Volume2 className="h-16 w-16 mx-auto" />
                    </motion.button>
                    {showAnswer && (
                      <motion.div
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center"
                        initial={{ opacity: 0, y: -20 }}
                      >
                        <p className="text-2xl font-medium text-game-accent">{currentWord.term}</p>
                        <p className="text-sm text-game-accent/70">{currentWord.pronunciation}</p>
                      </motion.div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {getAnswerOptions().map((option) => (
                      <motion.button
                        animate={
                          showAnswer
                            ? option === currentWord.term
                              ? "correct"
                              : selectedAnswer === option
                                ? "incorrect"
                                : "idle"
                            : "idle"
                        }
                        className={`relative h-16 rounded-2xl border-2 font-medium text-lg transition-all
  ${
    showAnswer
      ? option === currentWord.term
        ? "border-green-400 bg-green-50 text-green-700"
        : selectedAnswer === option
          ? "border-red-400 bg-red-50 text-red-700"
          : "border-gray-200 bg-gray-50 text-gray-400"
      : "border-game-primary/20 bg-white hover:border-game-primary hover:bg-game-primary/5 text-game-accent shadow-sm hover:shadow"
  }
`}
                        disabled={showAnswer || selectedAnswer !== null}
                        initial="idle"
                        key={option}
                        onClick={() => handleSelectAnswer(option)}
                        variants={buttonVariants}
                        whileHover="hover"
                        whileTap="tap"
                      >
                        {option}
                        {showAnswer && option === currentWord.term && (
                          <motion.div
                            animate={{ scale: 1 }}
                            className="absolute -right-2 -top-2 rounded-full bg-green-500 p-1 shadow-md"
                            initial={{ scale: 0 }}
                          >
                            <Check className="h-4 w-4 text-white" />
                          </motion.div>
                        )}
                        {showAnswer && selectedAnswer === option && option !== currentWord.term && (
                          <motion.div
                            animate={{ scale: 1 }}
                            className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 shadow-md"
                            initial={{ scale: 0 }}
                          >
                            <X className="h-4 w-4 text-white" />
                          </motion.div>
                        )}
                      </motion.button>
                    ))}
                  </div>

                  {showAnswer && !isCorrect && (
                    <div className="mt-6 flex justify-center">
                      <Button className="game-button rounded-full px-6" onClick={handleNext}>
                        Từ tiếp theo
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  )}

                  {!showAnswer && (
                    <div className="mt-6 flex justify-center">
                      <Button
                        className="rounded-full px-6 border-amber-400 bg-amber-50 text-amber-600 hover:bg-amber-100"
                        onClick={() => setShowAnswer(true)}
                        variant="outline"
                      >
                        <HelpCircle className="mr-2 h-4 w-4" />
                        Hiện đáp án
                      </Button>
                    </div>
                  )}
                </div>
              </Card>

              {showAnswer && (
                <motion.div
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 w-full max-w-2xl rounded-3xl bg-white p-6 shadow-md"
                  initial={{ opacity: 0, y: 20 }}
                >
                  <h4 className="mb-2 font-medium text-game-accent">Ví dụ:</h4>
                  <p
                    className="text-game-accent/70"
                    dangerouslySetInnerHTML={{
                      __html: currentWord.example.replace(
                        "____",
                        `<span class="font-bold text-game-primary">${currentWord.term}</span>`,
                      ),
                    }}
                  />
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}

