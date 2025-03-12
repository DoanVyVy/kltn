"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Search, Filter, Gamepad2, Clock, ChevronRight, BookOpen } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import Navigation from "@/components/navigation"
import { getGamesList, type GameListItem } from "@/services/game-service"

// Game icon mapping
const gameIcons = {
  "word-search": Gamepad2,
  matching: BookOpen,
  quiz: BookOpen,
}

export default function VocabularyGamesPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")

  // Get games list
  const gamesList = useMemo(() => getGamesList(), [])

  // Filter games based on search query - memoize this operation
  const filteredGames = useMemo(() => {
    if (!searchQuery.trim()) return gamesList

    const query = searchQuery.toLowerCase()
    return gamesList.filter(
      (game) =>
        game.title.toLowerCase().includes(query) ||
        game.description.toLowerCase().includes(query) ||
        game.courseTitle.toLowerCase().includes(query),
    )
  }, [gamesList, searchQuery])

  // Render a game card
  const renderGameCard = (game: GameListItem) => {
    const GameIcon = gameIcons[game.type] || Gamepad2

    return (
      <motion.div
        key={game.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={{ y: -5 }}
        className="h-full"
      >
        <Card
          className="game-card h-full transition-all hover:border-game-primary/50 cursor-pointer"
          onClick={() => router.push(`/vocabulary/game/${game.id}`)}
        >
          <CardContent className="p-6 h-full flex flex-col">
            <div className="mb-4 flex justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-game-primary text-white">
                <GameIcon className="h-6 w-6" />
              </div>
              <ChevronRight className="h-6 w-6 text-game-primary/70" />
            </div>
            <h3 className="text-lg font-bold text-game-accent">{game.title}</h3>
            <p className="mb-3 text-sm text-game-accent/70">{game.description}</p>

            <div className="mt-auto space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="bg-game-primary/10 text-game-primary">
                  {game.difficulty}
                </Badge>
                <Badge variant="outline" className="bg-gray-100 text-gray-700">
                  {game.totalWords} từ
                </Badge>
                {game.lastPlayed && (
                  <Badge variant="outline" className="bg-amber-100 text-amber-700">
                    <Clock className="mr-1 h-3 w-3" /> {game.lastPlayed}
                  </Badge>
                )}
              </div>

              {game.progress > 0 && (
                <div>
                  <Progress value={game.progress} className="h-2 bg-white" indicatorClassName="bg-game-primary" />
                  <p className="mt-2 text-xs text-game-accent/70">Hoàn thành {game.progress}%</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <div className="min-h-screen bg-game-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-game-accent">Trò chơi từ vựng</h1>
          <p className="text-game-accent/80">Học từ vựng tiếng Anh thông qua các trò chơi tương tác thú vị</p>
        </div>

        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <Input
              placeholder="Tìm kiếm trò chơi..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Lọc
            </Button>
          </div>
        </div>

        {filteredGames.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{filteredGames.map(renderGameCard)}</div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg bg-white p-8 text-center">
            <Gamepad2 className="mb-4 h-16 w-16 text-gray-300" />
            <h3 className="text-xl font-bold text-game-accent">Không tìm thấy trò chơi nào</h3>
            <p className="text-game-accent/70">Không có trò chơi nào phù hợp với từ khóa tìm kiếm của bạn</p>
          </div>
        )}
      </main>
    </div>
  )
}

