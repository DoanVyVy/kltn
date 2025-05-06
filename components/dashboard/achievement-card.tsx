"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import {
  Trophy,
  BookOpen,
  BookText,
  Brain,
  Gamepad2,
  MessageSquare,
  Pencil,
  Flame,
  Calendar,
  Award,
  Star,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

// Map of icon names to Lucide components
const iconMap: Record<string, LucideIcon> = {
  BookOpen,
  BookText,
  Brain,
  Gamepad2,
  MessageSquare,
  Pencil,
  Trophy,
  Flame,
  Calendar,
  Award,
  Star,
  // Add more icons as needed
};

interface AchievementCardProps {
  id: number;
  title: string;
  description: string;
  icon: string | LucideIcon;
  completed: boolean;
  category: string;
  index: number;
  dateAchieved?: Date | string | null;
  pointsReward?: number;
  onClick?: () => void;
}

export function AchievementCard({
  id,
  title,
  description,
  icon,
  completed,
  category,
  index,
  dateAchieved,
  pointsReward,
  onClick,
}: AchievementCardProps) {
  // Determine which icon to use
  let IconComponent: LucideIcon;

  if (typeof icon === "string") {
    // If it's a string, look it up in our map
    IconComponent = iconMap[icon] || Trophy; // Default to Trophy if not found
  } else {
    // If it's already a component, use it
    IconComponent = icon;
  }

  // Check if category is a string that matches "vocabulary" or "grammar"
  const categoryText =
    typeof category === "string"
      ? category.toLowerCase() === "vocabulary"
        ? "Từ vựng"
        : category.toLowerCase() === "grammar"
        ? "Ngữ pháp"
        : category
      : "Khác";

  // Determine category styling
  const isCategoryVocabulary =
    typeof category === "string" && category.toLowerCase() === "vocabulary";

  // Format date if provided
  const formattedDate = dateAchieved
    ? new Date(dateAchieved).toLocaleDateString("vi-VN")
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ y: -5 }}
      onClick={onClick}
      className={onClick ? "cursor-pointer" : ""}
    >
      <Card
        className={`game-card h-full transition-all ${
          completed
            ? isCategoryVocabulary
              ? "border-game-primary/30 bg-game-primary/5"
              : "border-game-secondary/30 bg-game-secondary/5"
            : "border-gray-200 bg-gray-50"
        }`}
      >
        <CardContent className="p-6">
          <div className="mb-4 flex justify-between">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-full ${
                completed
                  ? isCategoryVocabulary
                    ? "bg-game-primary text-white"
                    : "bg-game-secondary text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              <IconComponent className="h-6 w-6" />
            </div>
            {completed && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                  rotate: { duration: 1, repeat: 1 },
                }}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-game-primary/10 text-game-primary"
              >
                <Trophy className="h-4 w-4" />
              </motion.div>
            )}
          </div>
          <h3 className="text-lg font-bold text-game-accent">{title}</h3>
          <p className="text-sm text-game-accent/70">{description}</p>
          <motion.div className="mt-2" whileHover={{ scale: 1.05 }}>
            <Badge
              variant="outline"
              className={`${
                isCategoryVocabulary
                  ? "bg-game-primary/10 text-game-primary"
                  : "bg-game-secondary/10 text-game-secondary"
              }`}
            >
              {categoryText}
            </Badge>
            {pointsReward && pointsReward > 0 && (
              <Badge
                variant="outline"
                className="ml-2 bg-yellow-100 text-amber-700"
              >
                +{pointsReward} XP
              </Badge>
            )}
          </motion.div>
          {completed && formattedDate && (
            <p className="mt-2 text-xs text-game-accent/70">
              Đạt được: {formattedDate}
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
