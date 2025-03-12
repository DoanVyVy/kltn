"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

interface AchievementCardProps {
  id: number;
  title: string;
  description: string;
  icon: LucideIcon;
  completed: boolean;
  category: "vocabulary" | "grammar";
  index: number;
}

export function AchievementCard({
  id,
  title,
  description,
  icon: Icon,
  completed,
  category,
  index,
}: AchievementCardProps) {
  return (
    <motion.div
      key={id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 * index }}
      whileHover={{
        scale: 1.05,
        transition: { type: "spring", stiffness: 300 },
      }}
      className="h-full"
    >
      <Card
        className={`game-card h-full transition-all ${
          completed
            ? "border-game-primary/30 bg-game-primary/5"
            : "border-gray-200 bg-gray-50"
        }`}
      >
        <CardContent className="p-6 h-full">
          <div className="mb-4 flex justify-between">
            <motion.div
              className={`flex h-12 w-12 items-center justify-center rounded-full ${
                completed
                  ? "bg-game-primary text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
              whileHover={{ rotate: 10 }}
              animate={
                completed
                  ? {
                      boxShadow: [
                        "0 0 0 rgba(215, 108, 130, 0)",
                        "0 0 15px rgba(215, 108, 130, 0.7)",
                        "0 0 0 rgba(215, 108, 130, 0)",
                      ],
                    }
                  : {}
              }
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            >
              <Icon className="h-6 w-6" />
            </motion.div>
            {completed && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
                transition={{
                  scale: { type: "spring", stiffness: 260, damping: 20 },
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
                category === "vocabulary"
                  ? "bg-game-primary/10 text-game-primary"
                  : "bg-game-secondary/10 text-game-secondary"
              }`}
            >
              {category === "vocabulary" ? "Từ vựng" : "Ngữ pháp"}
            </Badge>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
