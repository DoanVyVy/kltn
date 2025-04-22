"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ChevronRight,
  BookOpen,
  BookText,
  Brain,
  Gamepad2,
  MessageSquare,
  Pencil,
} from "lucide-react";
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
  // Add more icons as needed
};

interface GameCardProps {
  id: number;
  title: string;
  description: string;
  icon: string | LucideIcon; // Can accept both string name or actual component
  iconColor: string;
  progress: number;
  index: number;
}

export function GameCard({
  id,
  title,
  description,
  icon,
  iconColor,
  progress,
  index,
}: GameCardProps) {
  // Determine which icon to use
  let IconComponent: LucideIcon;

  if (typeof icon === "string") {
    // If it's a string, look it up in our map
    IconComponent = iconMap[icon] || BookOpen; // Default to BookOpen if not found
  } else {
    // If it's already a component, use it
    IconComponent = icon;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 * index }}
      whileHover={{ y: -10, transition: { type: "spring", stiffness: 300 } }}
      className="h-full"
    >
      <Link href={`/games/${id}`} className="h-full block">
        <Card className="game-card h-full transition-all hover:border-game-primary/50">
          <CardContent className="p-6 h-full flex flex-col">
            <div className="mb-4 flex justify-between">
              <motion.div
                className={`flex h-12 w-12 items-center justify-center rounded-full ${iconColor} text-white`}
                whileHover={{ rotate: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <IconComponent className="h-6 w-6" />
              </motion.div>
              <motion.div
                whileHover={{ x: 5 }}
                animate={{ x: [0, 5, 0] }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "reverse",
                }}
              >
                <ChevronRight className="h-6 w-6 text-game-primary/70" />
              </motion.div>
            </div>
            <h3 className="text-lg font-bold text-game-accent">{title}</h3>
            <p className="mb-3 text-sm text-game-accent/70">{description}</p>
            <div className="mt-auto">
              <div className="w-full bg-white h-2 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-game-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1, delay: 0.2 + index * 0.1 }}
                />
              </div>
              <p className="mt-2 text-xs text-game-accent/70">
                Hoàn thành {progress}%
              </p>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
