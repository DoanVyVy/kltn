"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/trpc/client";
import { iconMap } from "./achievement-icon-map";

interface AchievementNotificationProps {
  onClose?: () => void;
  autoCheckAchievements?: boolean;
  autoCloseTimeout?: number; // ms
}

export function AchievementNotification({
  onClose,
  autoCheckAchievements = true,
  autoCloseTimeout = 5000, // 5 seconds
}: AchievementNotificationProps) {
  const [achievements, setAchievements] = useState<any[]>([]);
  const [visibleIndex, setVisibleIndex] = useState(0);

  const { mutate: checkAchievements } =
    trpc.achievement.checkAchievements.useMutation({
      onSuccess: (data) => {
        if (data.newAchievements && data.newAchievements.length > 0) {
          setAchievements(data.newAchievements);
        }
      },
    });

  // Auto check achievements on mount if enabled
  useEffect(() => {
    if (autoCheckAchievements) {
      checkAchievements();
    }
  }, [autoCheckAchievements, checkAchievements]);

  // Auto close timeout
  useEffect(() => {
    if (achievements.length > 0 && autoCloseTimeout > 0) {
      const timeout = setTimeout(() => {
        if (visibleIndex < achievements.length - 1) {
          // Show next achievement
          setVisibleIndex(visibleIndex + 1);
        } else {
          // Close notification
          onClose?.();
        }
      }, autoCloseTimeout);

      return () => clearTimeout(timeout);
    }
  }, [achievements, visibleIndex, autoCloseTimeout, onClose]);

  if (!achievements.length) return null;

  const currentAchievement = achievements[visibleIndex];
  if (!currentAchievement) return null;

  const IconComponent = iconMap[currentAchievement.icon_name] || Trophy;
  const isCategoryVocabulary = currentAchievement.category === "vocabulary";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-4 right-4 z-50"
      >
        <div className="w-72 bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100">
          <div className="relative">
            {/* Header with confetti animation */}
            <motion.div
              className={`p-4 text-white ${
                isCategoryVocabulary ? "bg-game-primary" : "bg-game-secondary"
              }`}
              initial={{ backgroundColor: "#ffffff" }}
              animate={{
                backgroundColor: isCategoryVocabulary
                  ? "var(--game-primary)"
                  : "var(--game-secondary)",
              }}
            >
              <div className="absolute inset-0 overflow-hidden">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0.8, 1.2, 1.5],
                    rotateZ: [0, 15, -15, 0],
                  }}
                  transition={{
                    duration: 2,
                    ease: "easeInOut",
                    times: [0, 0.5, 1],
                    repeat: 0,
                  }}
                  className="w-full h-full flex items-center justify-center"
                >
                  {/* Confetti effect */}
                  {Array.from({ length: 20 }).map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 rounded-full bg-yellow-300"
                      initial={{
                        x: "50%",
                        y: "50%",
                        opacity: 1,
                      }}
                      animate={{
                        x: `${50 + Math.random() * 100 - 50}%`,
                        y: `${50 + Math.random() * 100 - 50}%`,
                        opacity: 0,
                      }}
                      transition={{
                        duration: 1 + Math.random(),
                        delay: Math.random() * 0.2,
                      }}
                      style={{
                        backgroundColor: [
                          "#FCD34D",
                          "#FBBF24",
                          "#F59E0B",
                          "#F97316",
                          "#FB7185",
                          "#F43F5E",
                          "#8B5CF6",
                          "#6366F1",
                        ][Math.floor(Math.random() * 8)],
                      }}
                    />
                  ))}
                </motion.div>
              </div>
              <div className="flex justify-between items-center relative z-10">
                <h3 className="font-bold text-lg flex items-center">
                  <Trophy className="mr-2 h-5 w-5" />
                  Thành tích mới!
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full text-white hover:bg-white/20"
                  onClick={() => onClose?.()}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>

            {/* Achievement content */}
            <div className="p-4">
              <div className="flex items-center space-x-3 mb-3">
                <div
                  className={`p-2 rounded-full ${
                    isCategoryVocabulary
                      ? "bg-game-primary/10 text-game-primary"
                      : "bg-game-secondary/10 text-game-secondary"
                  }`}
                >
                  <IconComponent className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-semibold">{currentAchievement.title}</h4>
                  <p className="text-xs text-gray-500">
                    {isCategoryVocabulary ? "Từ vựng" : "Ngữ pháp"}
                  </p>
                </div>
              </div>

              <p className="text-sm text-gray-700 mb-4">
                {currentAchievement.description}
              </p>

              {currentAchievement.pointsReward > 0 && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="flex items-center justify-center p-2 bg-yellow-50 rounded-md border border-yellow-100 text-amber-700 font-medium"
                >
                  <Trophy className="h-4 w-4 mr-2 text-yellow-500" />
                  <span>+{currentAchievement.pointsReward} XP</span>
                </motion.div>
              )}
            </div>

            {/* Navigation between achievements */}
            {achievements.length > 1 && (
              <div className="flex justify-between items-center px-4 py-3 bg-gray-50 border-t border-gray-100">
                <div className="text-xs text-gray-500">
                  {visibleIndex + 1} / {achievements.length}
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs"
                    disabled={visibleIndex === 0}
                    onClick={() => setVisibleIndex((prev) => prev - 1)}
                  >
                    Trước
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs"
                    disabled={visibleIndex === achievements.length - 1}
                    onClick={() => setVisibleIndex((prev) => prev + 1)}
                  >
                    Tiếp
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
