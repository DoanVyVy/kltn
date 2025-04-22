"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Crown,
  Medal,
  Trophy,
  ChevronDown,
  ChevronUp,
  Users,
  Award,
  Flame,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

// Types
interface LeaderboardUserBase {
  id: number;
  name: string;
  avatar_url?: string;
  current_xp: number;
  level: number;
  learning_streak?: number;
}

interface LeaderboardUserWithCurrentFlag extends LeaderboardUserBase {
  isCurrentUser: boolean;
}

// We use this type for all user data after processing
type ProcessedLeaderboardUser = LeaderboardUserWithCurrentFlag;

interface LeaderboardProps {
  data?: LeaderboardUserBase[];
  currentUserId?: number;
}

// Helper components
const LeaderboardUserItem = ({
  user,
  rank,
}: {
  user: ProcessedLeaderboardUser;
  rank: number;
}) => {
  // Hiệu ứng cho các hạng cao nhất
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Medal className="h-5 w-5 text-amber-700" />;
      default:
        return (
          <span className="flex h-5 w-5 items-center justify-center font-bold text-gray-500">
            {rank}
          </span>
        );
    }
  };

  // Hiệu ứng màu sắc cho các hạng cao nhất
  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-yellow-100 border-yellow-300";
      case 2:
        return "bg-gray-100 border-gray-300";
      case 3:
        return "bg-amber-100 border-amber-300";
      default:
        return "bg-white border-gray-200";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      className={`relative flex items-center justify-between p-3 ${getRankColor(
        rank
      )} ${user.isCurrentUser ? "border-l-4 border-l-game-primary" : ""}`}
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
          <AvatarFallback className="bg-game-primary/10 text-game-primary">
            {user.name ? user.name.charAt(0) : "U"}
          </AvatarFallback>
          <AvatarImage
            src={user.avatar_url || "/placeholder-user.jpg"}
            alt={user.name}
          />
        </Avatar>

        <div>
          <div className="flex items-center gap-1">
            <span className="font-medium text-game-accent">
              {user.name || "Người dùng"}
            </span>
            {user.isCurrentUser && (
              <Badge
                variant="outline"
                className="ml-1 h-5 px-1 text-[10px] bg-game-primary/10 text-game-primary"
              >
                Bạn
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="flex items-center">
              <Users className="mr-1 h-3 w-3" />
              Cấp {user.level || 1}
            </span>
            {user.learning_streak !== undefined && (
              <span className="flex items-center">
                <Flame className="mr-1 h-3 w-3 text-amber-500" />
                {user.learning_streak} ngày
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="text-right">
        <div className="font-bold text-game-primary">
          {user.current_xp?.toLocaleString() || "0"}
        </div>
        <div className="text-xs text-gray-500">điểm</div>
      </div>
    </motion.div>
  );
};

// Mock data as fallback
const mockLeaderboardData: ProcessedLeaderboardUser[] = [
  {
    id: 1,
    name: "Minh Anh",
    avatar_url: "/placeholder-user.jpg",
    current_xp: 2450,
    level: 15,
    learning_streak: 21,
    isCurrentUser: false,
  },
  {
    id: 2,
    name: "Hoàng Nam",
    avatar_url: "/placeholder-user.jpg",
    current_xp: 2320,
    level: 14,
    learning_streak: 18,
    isCurrentUser: false,
  },
  {
    id: 3,
    name: "Thúy Linh",
    avatar_url: "/placeholder-user.jpg",
    current_xp: 2180,
    level: 13,
    learning_streak: 14,
    isCurrentUser: false,
  },
  {
    id: 4,
    name: "Quang Minh",
    avatar_url: "/placeholder-user.jpg",
    current_xp: 1950,
    level: 12,
    learning_streak: 12,
    isCurrentUser: false,
  },
  {
    id: 5,
    name: "Hà Trang",
    avatar_url: "/placeholder-user.jpg",
    current_xp: 1820,
    level: 11,
    learning_streak: 9,
    isCurrentUser: false,
  },
  {
    id: 6,
    name: "Đức Anh",
    avatar_url: "/placeholder-user.jpg",
    current_xp: 1750,
    level: 11,
    learning_streak: 7,
    isCurrentUser: false,
  },
  {
    id: 7,
    name: "Alex",
    avatar_url: "/placeholder-user.jpg",
    current_xp: 1680,
    level: 10,
    learning_streak: 7,
    isCurrentUser: false,
  },
  {
    id: 8,
    name: "Thanh Hà",
    avatar_url: "/placeholder-user.jpg",
    current_xp: 1520,
    level: 9,
    learning_streak: 5,
    isCurrentUser: false,
  },
  {
    id: 9,
    name: "Minh Tuấn",
    avatar_url: "/placeholder-user.jpg",
    current_xp: 1480,
    level: 9,
    learning_streak: 4,
    isCurrentUser: false,
  },
  {
    id: 10,
    name: "Thu Hương",
    avatar_url: "/placeholder-user.jpg",
    current_xp: 1350,
    level: 8,
    learning_streak: 3,
    isCurrentUser: false,
  },
];

export function Leaderboard({ data = [], currentUserId }: LeaderboardProps) {
  const [period, setPeriod] = useState<"weekly" | "monthly" | "allTime">(
    "weekly"
  );
  const [expanded, setExpanded] = useState(false);

  // Process the real data or use mock data if none is provided
  const processedData: ProcessedLeaderboardUser[] = useMemo(() => {
    if (data && data.length > 0) {
      // Map the real data and mark the current user
      return data.map((user) => ({
        ...user,
        isCurrentUser: user.id === currentUserId,
      }));
    }
    // Fallback to mock data if no real data is provided
    return mockLeaderboardData;
  }, [data, currentUserId]);

  // Tìm vị trí của người dùng hiện tại
  const currentUserIndex = useMemo(
    () => processedData.findIndex((user) => user.isCurrentUser),
    [processedData]
  );
  const currentUserRank = currentUserIndex + 1;

  // Xác định số lượng người dùng hiển thị
  const displayCount = expanded ? processedData.length : 5;

  // Tạo danh sách người dùng hiển thị
  const displayedUsers = useMemo(
    () => (expanded ? processedData : processedData.slice(0, 5)),
    [expanded, processedData]
  );

  // Kiểm tra xem người dùng hiện tại có nằm trong top hiển thị không
  const currentUserVisible =
    currentUserIndex < displayCount && currentUserIndex >= 0;

  return (
    <Card className="game-card overflow-hidden h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center text-xl text-game-accent">
              <Trophy className="mr-2 h-5 w-5 text-game-primary" />
              Bảng xếp hạng
            </CardTitle>
            <CardDescription className="text-game-accent/70">
              Những người học tích cực nhất
            </CardDescription>
          </div>
          <Tabs
            value={period}
            onValueChange={(value) => setPeriod(value as any)}
            className="w-auto"
          >
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

        {processedData.length > 0 ? (
          <>
            <div className="divide-y divide-gray-100">
              <AnimatePresence>
                {displayedUsers.map((user, index) => (
                  <LeaderboardUserItem
                    key={user.id}
                    user={user}
                    rank={index + 1}
                  />
                ))}
              </AnimatePresence>
            </div>

            {/* Hiển thị người dùng hiện tại nếu không nằm trong danh sách hiển thị */}
            {!currentUserVisible && !expanded && currentUserIndex >= 0 && (
              <>
                <div className="py-1 px-4 bg-gray-100 text-xs text-center text-gray-500">
                  • • •
                </div>
                <LeaderboardUserItem
                  user={processedData[currentUserIndex]}
                  rank={currentUserRank}
                />
              </>
            )}
          </>
        ) : (
          <div className="p-8 text-center text-game-accent/70">
            Chưa có dữ liệu bảng xếp hạng
          </div>
        )}

        {/* Nút xem thêm/thu gọn */}
        {processedData.length > 5 && (
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
        )}
      </CardContent>
    </Card>
  );
}
