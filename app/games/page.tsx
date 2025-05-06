"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search, Gamepad2, Trophy, Clock, Star } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/navigation";

interface Game {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  image: string;
  category: string;
  playCount: number;
  bestScore?: number;
  bestTime?: number;
}

export default function GamesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [games, setGames] = useState<Game[]>([]);
  const [filteredGames, setFilteredGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Sample game data - in a real app, this would come from an API
  useEffect(() => {
    // Simulate loading games from an API
    setTimeout(() => {
      const demoGames: Game[] = [
        {
          id: "vocabulary-puzzle",
          title: "Vocabulary Puzzle",
          description: "Match vocabulary words with their correct definitions",
          difficulty: "Medium",
          image: "/games/vocabulary-puzzle.jpg",
          category: "vocabulary",
          playCount: 253,
          bestScore: 85,
        },
        {
          id: "word-search",
          title: "Word Search",
          description: "Find hidden words in a grid of letters",
          difficulty: "Easy",
          image: "/games/word-search.jpg",
          category: "vocabulary",
          playCount: 187,
          bestScore: 92,
        },
        {
          id: "word-squares",
          title: "Word Squares",
          description:
            "Create a grid where words read the same across and down",
          difficulty: "Medium",
          image: "/games/word-squares.jpg",
          category: "vocabulary",
          playCount: 124,
          bestScore: 78,
        },
        {
          id: "grammar-challenge",
          title: "Grammar Challenge",
          description: "Test your knowledge of English grammar rules",
          difficulty: "Hard",
          image: "/games/grammar-challenge.jpg",
          category: "grammar",
          playCount: 142,
          bestScore: 70,
        },
        {
          id: "sentence-builder",
          title: "Sentence Builder",
          description: "Arrange words to form grammatically correct sentences",
          difficulty: "Medium",
          image: "/games/sentence-builder.jpg",
          category: "grammar",
          playCount: 165,
          bestScore: 80,
        },
        {
          id: "listening-quest",
          title: "Listening Quest",
          description: "Listen to audio clips and answer questions",
          difficulty: "Medium",
          image: "/games/listening-quest.jpg",
          category: "listening",
          playCount: 128,
          bestTime: 145,
        },
        {
          id: "pronunciation-check",
          title: "Pronunciation Check",
          description: "Practice your English pronunciation with AI feedback",
          difficulty: "Medium",
          image: "/games/pronunciation-check.jpg",
          category: "speaking",
          playCount: 176,
          bestScore: 88,
        },
      ];

      setGames(demoGames);
      setFilteredGames(demoGames);
      setIsLoading(false);
    }, 800);
  }, []);

  // Filter games based on search query and category
  useEffect(() => {
    let result = games;

    // Filter by category
    if (activeCategory !== "all") {
      result = result.filter((game) => game.category === activeCategory);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (game) =>
          game.title.toLowerCase().includes(query) ||
          game.description.toLowerCase().includes(query)
      );
    }

    setFilteredGames(result);
  }, [searchQuery, activeCategory, games]);

  // Handle game selection
  const handlePlayGame = (gameId: string) => {
    router.push(`/games/${gameId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <motion.div
          className="flex flex-col gap-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div>
              <h1 className="text-3xl font-bold text-game-accent">Games</h1>
              <p className="text-muted-foreground mt-1">
                Play games to improve your English skills
              </p>
            </div>

            {/* Search */}
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search games..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Categories */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            <Button
              variant={activeCategory === "all" ? "default" : "outline"}
              className={`rounded-full ${
                activeCategory === "all"
                  ? "bg-game-primary hover:bg-game-primary/90"
                  : ""
              }`}
              onClick={() => setActiveCategory("all")}
            >
              <Gamepad2 className="mr-2 h-4 w-4" />
              All Games
            </Button>
            <Button
              variant={activeCategory === "vocabulary" ? "default" : "outline"}
              className={`rounded-full ${
                activeCategory === "vocabulary"
                  ? "bg-game-primary hover:bg-game-primary/90"
                  : ""
              }`}
              onClick={() => setActiveCategory("vocabulary")}
            >
              Vocabulary
            </Button>
            <Button
              variant={activeCategory === "grammar" ? "default" : "outline"}
              className={`rounded-full ${
                activeCategory === "grammar"
                  ? "bg-game-primary hover:bg-game-primary/90"
                  : ""
              }`}
              onClick={() => setActiveCategory("grammar")}
            >
              Grammar
            </Button>
            <Button
              variant={activeCategory === "listening" ? "default" : "outline"}
              className={`rounded-full ${
                activeCategory === "listening"
                  ? "bg-game-primary hover:bg-game-primary/90"
                  : ""
              }`}
              onClick={() => setActiveCategory("listening")}
            >
              Listening
            </Button>
            <Button
              variant={activeCategory === "speaking" ? "default" : "outline"}
              className={`rounded-full ${
                activeCategory === "speaking"
                  ? "bg-game-primary hover:bg-game-primary/90"
                  : ""
              }`}
              onClick={() => setActiveCategory("speaking")}
            >
              Speaking
            </Button>
          </div>

          {/* Games Grid */}
          {isLoading ? (
            // Loading skeleton
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="bg-white shadow-sm animate-pulse">
                  <div className="h-40 bg-gray-200 rounded-t-lg"></div>
                  <CardHeader>
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : filteredGames.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Gamepad2 className="h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-600">
                No games found
              </h3>
              <p className="text-gray-500">
                Try a different search term or category
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGames.map((game) => (
                <motion.div
                  key={game.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card className="overflow-hidden hover:shadow-md transition-all bg-white">
                    <div className="h-40 bg-gray-200 relative">
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40 flex items-end p-4">
                        <div className="px-2 py-1 bg-black/60 text-white text-xs rounded-full">
                          {game.difficulty}
                        </div>
                      </div>
                    </div>
                    <CardHeader>
                      <CardTitle className="text-game-accent">
                        {game.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {game.description}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <div className="flex items-center text-xs text-gray-500">
                          <Gamepad2 className="h-3 w-3 mr-1 text-game-primary" />
                          <span>{game.playCount} plays</span>
                        </div>
                        {game.bestScore && (
                          <div className="flex items-center text-xs text-gray-500">
                            <Trophy className="h-3 w-3 mr-1 text-amber-500" />
                            <span>Best: {game.bestScore}%</span>
                          </div>
                        )}
                        {game.bestTime && (
                          <div className="flex items-center text-xs text-gray-500">
                            <Clock className="h-3 w-3 mr-1 text-blue-500" />
                            <span>
                              Best: {Math.floor(game.bestTime / 60)}:
                              {game.bestTime % 60 < 10 ? "0" : ""}
                              {game.bestTime % 60}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button
                        onClick={() => handlePlayGame(game.id)}
                        className="w-full bg-game-primary hover:bg-game-primary/90"
                      >
                        Play Now
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
