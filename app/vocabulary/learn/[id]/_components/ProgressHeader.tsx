"use client";

import React from "react";
import { Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { LearningStats } from "../_types";

interface ProgressHeaderProps {
  currentIndex: number;
  totalItems: number;
  progress: number;
  stats: LearningStats;
}

export const ProgressHeader: React.FC<ProgressHeaderProps> = ({
  currentIndex,
  totalItems,
  progress,
  stats,
}) => {
  return (
    <div className="mb-6 space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-game-accent font-medium">
          Từ {currentIndex + 1}/{totalItems}
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
        style={
          {
            "--progress-indicator-color":
              "linear-gradient(to right, var(--game-primary), var(--game-secondary))",
          } as React.CSSProperties
        }
      />
    </div>
  );
};
