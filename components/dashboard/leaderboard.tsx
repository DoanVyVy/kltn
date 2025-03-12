"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Crown, Medal, Trophy, ChevronDown, ChevronUp, Users, Award, Flame } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

// Types
interface LeaderboardUser {
  id: number
  name: string
  avatar: string
  score: number
  level: number
  streak: number
  isCurrentUser: boolean
}

interface LeaderboardData {
  weekly: LeaderboardUser[]
  monthly: LeaderboardUser[]
  allTime: LeaderboardUser[]
}

// Dữ liệu mẫu cho bảng xếp hạng
const leaderboardData: LeaderboardData = {
  weekly: [
    { id: 1, name: "Minh Anh", avatar: "/avatars/01.png", score: 2450, level: 15, streak: 21, isCurrentUser: false },
    { id: 2, name: "Hoàng Nam", avatar: "/avatars/02.png", score: 2320, level: 14, streak: 18, isCurrentUser: false },
    { id: 3, name: "Thúy Linh", avatar: "/avatars/03.png", score: 2180, level: 13, streak: 14, isCurrentUser: false },
    { id: 4, name: "Quang Minh", avatar: "/avatars/04.png", score: 1950, level: 12, streak: 12, isCurrentUser: false },
    { id: 5, name: "Hà Trang", avatar: "/avatars/05.png", score: 1820, level: 11, streak: 9, isCurrentUser: false },
    { id: 6, name: "Đức Anh", avatar: "/avatars/06.png", score: 1750, level: 11, streak: 7, isCurrentUser: false },
    { id: 7, name: "Alex", avatar: "/avatars/07.png", score: 1680, level: 10, streak: 7, isCurrentUser: true },
    { id: 8, name: "Thanh Hà", avatar: "/avatars/08.png", score: 1520, level: 9, streak: 5, isCurrentUser: false },
    { id: 9, name: "Minh Tuấn", avatar: "/avatars/09.png", score: 1480, level: 9, streak: 4, isCurrentUser: false },
    { id: 10, name: "Thu Hương", avatar: "/avatars/10.png", score: 1350, level: 8, streak: 3, isCurrentUser: false },
  ],
  monthly: [
    { id: 1, name: "Hoàng Nam", avatar: "/avatars/02.png", score: 9840, level: 14, streak: 18, isCurrentUser: false },
    { id: 2, name: "Minh Anh", avatar: "/avatars/01.png", score: 9650, level: 15, streak: 21, isCurrentUser: false },
    { id: 3, name: "Quang Minh", avatar: "/avatars/04.png", score: 8750, level: 12, streak: 12, isCurrentUser: false },
    { id: 4, name: "Thúy Linh", avatar: "/avatars/03.png", score: 8320, level: 13, streak: 14, isCurrentUser: false },
    { id: 5, name: "Alex", avatar: "/avatars/07.png", score: 7680, level: 10, streak: 7, isCurrentUser: true },
    { id: 6, name: "Hà Trang", avatar: "/avatars/05.png", score: 7520, level: 11, streak: 9, isCurrentUser: false },
    { id: 7, name: "Đức Anh", avatar: "/avatars/06.png", score: 6950, level: 11, streak: 7, isCurrentUser: false },
    { id: 8, name: "Thanh Hà", avatar: "/avatars/08.png", score: 6520, level: 9, streak: 5, isCurrentUser: false },
    { id: 9, name: "Minh Tuấn", avatar: "/avatars/09.png", score: 5980, level: 9, streak: 4, isCurrentUser: false },
    { id: 10, name: "Thu Hương", avatar: "/avatars/10.png", score: 5350, level: 8, streak: 3, isCurrentUser: false },
  ],
  allTime: [
    { id: 1, name: "Hoàng Nam", avatar: "/avatars/02.png", score: 45840, level: 14, streak: 18, isCurrentUser: false },
    { id: 2, name: "Minh Anh", avatar: "/avatars/01.png", score: 42650, level: 15, streak: 21, isCurrentUser: false },
    { id: 3, name: "Thúy Linh", avatar: "/avatars/03.png", score: 38320, level: 13, streak: 14, isCurrentUser: false },
    { id: 4, name: "Quang Minh", avatar: "/avatars/04.png", score: 35750, level: 12, streak: 12, isCurrentUser: false },
    { id: 5, name: "Hà Trang", avatar: "/avatars/05.png", score: 32520, level: 11, streak: 9, isCurrentUser: false },
    { id: 6, name: "Đức Anh", avatar: "/avatars/06.png", score: 29950, level: 11, streak: 7, isCurrentUser: false },
    { id: 7, name: "Thanh Hà", avatar: "/avatars/08.png", score: 26520, level: 9, streak: 5, isCurrentUser: false },
    { id: 8, name: "Alex", avatar: "/avatars/07.png", score: 24680, level: 10, streak: 7, isCurrentUser: true },
    { id: 9, name: "Minh Tuấn", avatar: "/avatars/09.png", score: 21980, level: 9, streak: 4, isCurrentUser: false },
    { id: 10, name: "Thu Hương", avatar: "/avatars/10.png", score: 18350, level: 8, streak: 3, isCurrentUser: false },
  ],
}

// Helper components
const LeaderboardUserItem = ({ user, rank }: { user: LeaderboardUser; rank: number }) => {
  // Hiệu ứng cho các hạng cao nhất
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />
      case 3:
        return <Medal className="h-5 w-5 text-amber-700" />
      default:
        return <span className="flex h-5 w-5 items-center justify-center font-bold text-gray-500">{rank}</span>
    }
  }

  // Hiệu ứng màu sắc cho các hạng cao nhất
  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-yellow-100 border-yellow-300"
      case 2:
        return "bg-gray-100 border-gray-300"
      case 3:
        return "bg-amber-100 border-amber-300"
      default:
        return "bg-white border-gray-200"
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      className={`relative flex items-center justify-between p-3 ${getRankColor(rank)} ${
        user.isCurrentUser ? "border-l-4 border-l-game-primary" : ""
      }`}
    >
      {/* Hiệu ứng cho top 3 */}
      {rank <= 3 && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 300, opacity: 1 }}
          transition={{
            repeat: Number.POSITIVE_INFINITY,
            duration: 2,
            delay: rank * 0.5,
            ease: "linear",
          }}
        />
      )}

      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm">
          {getRankIcon(rank)}
        </div>

        <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
          <AvatarFallback className="bg-game-primary/10 text-game-primary">{user.name.charAt(0)}</AvatarFallback>
          <AvatarImage src={user.avatar} alt={user.name} />
        </Avatar>

        <div>
          <div className="flex items-center gap-1">
            <span className="font-medium text-game-accent">{user.name}</span>
            {user.isCurrentUser && (
              <Badge variant="outline" className="ml-1 h-5 px-1 text-[10px] bg-game-primary/10 text-game-primary">
                Bạn
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="flex items-center">
              <Users className="mr-1 h-3 w-3" />
              Cấp {user.level}
            </span>
            <span className="flex items-center">
              <Flame className="mr-1 h-3 w-3 text-amber-500" />
              {user.streak} ngày
            </span>
          </div>
        </div>
      </div>

      <div className="text-right">
        <div className="font-bold text-game-primary">{user.score.toLocaleString()}</div>
        <div className="text-xs text-gray-500">điểm</div>
      </div>
    </motion.div>
  )
}

export function Leaderboard() {
  const [period, setPeriod] = useState<"weekly" | "monthly" | "allTime">("weekly")
  const [expanded, setExpanded] = useState(false)

  // Lấy dữ liệu theo kỳ hạn đã chọn
  const data = leaderboardData[period]

  // Tìm vị trí của người dùng hiện tại
  const currentUserIndex = useMemo(() => data.findIndex((user) => user.isCurrentUser), [data])
  const currentUserRank = currentUserIndex + 1

  // Xác định số lượng người dùng hiển thị
  const displayCount = expanded ? data.length : 5

  // Tạo danh sách người dùng hiển thị
  const displayedUsers = useMemo(() => (expanded ? data : data.slice(0, 5)), [expanded, data])

  // Kiểm tra xem người dùng hiện tại có nằm trong top hiển thị không
  const currentUserVisible = currentUserIndex < displayCount

  return (
    <Card className="game-card overflow-hidden h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center text-xl text-game-accent">
              <Trophy className="mr-2 h-5 w-5 text-game-primary" />
              Bảng xếp hạng
            </CardTitle>
            <CardDescription className="text-game-accent/70">Những người học tích cực nhất</CardDescription>
          </div>
          <Tabs value={period} onValueChange={(value) => setPeriod(value as any)} className="w-auto">
            <TabsList className="grid w-full grid-cols-3 h-8">
              <TabsTrigger value="weekly" className="text-xs px-2">
                Tuần
              </TabsTrigger>
              <TabsTrigger value="monthly" className="text-xs px-2">
                Tháng
              </TabsTrigger>
              <TabsTrigger value="allTime" className="text-xs px-2">
                Tất cả
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="px-4 py-2 bg-gray-50 border-y border-gray-200 flex justify-between text-xs text-gray-500 font-medium">
          <div className="flex items-center gap-1">
            <Trophy className="h-3 w-3" />
            <span>Hạng</span>
          </div>
          <div className="flex items-center gap-1">
            <Award className="h-3 w-3" />
            <span>Điểm</span>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          <AnimatePresence>
            {displayedUsers.map((user, index) => (
              <LeaderboardUserItem key={user.id} user={user} rank={index + 1} />
            ))}
          </AnimatePresence>
        </div>

        {/* Hiển thị người dùng hiện tại nếu không nằm trong danh sách hiển thị */}
        {!currentUserVisible && !expanded && (
          <>
            <div className="py-1 px-4 bg-gray-100 text-xs text-center text-gray-500">• • •</div>
            <LeaderboardUserItem user={data[currentUserIndex]} rank={currentUserRank} />
          </>
        )}

        {/* Nút xem thêm/thu gọn */}
        <div className="p-2 flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            className="text-game-primary hover:bg-game-primary/10 w-full"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <span className="flex items-center">
                Thu gọn <ChevronUp className="ml-1 h-4 w-4" />
              </span>
            ) : (
              <span className="flex items-center">
                Xem thêm <ChevronDown className="ml-1 h-4 w-4" />
              </span>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

