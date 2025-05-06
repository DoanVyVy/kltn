"use client";

import { motion } from "framer-motion";
import { Calendar, Gamepad2, Trophy, Target } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-game-background to-gray-900 flex items-center justify-center">
      <div className="container max-w-7xl mx-auto px-4 py-10">
        <motion.div
          className="flex flex-col items-center mb-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="relative mb-6"
            animate={{ rotate: 360 }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
          >
            <motion.div
              className="absolute inset-0 rounded-full bg-gradient-to-r from-game-primary to-game-secondary blur-lg opacity-70"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            />
            <div className="relative w-24 h-24 rounded-full bg-gray-900 flex items-center justify-center">
              <Calendar className="h-10 w-10 text-game-primary" />
            </div>
          </motion.div>

          <motion.h1
            className="mt-6 text-3xl font-bold text-white text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Đang tải trò chơi hàng ngày
          </motion.h1>

          <motion.p
            className="mt-2 text-gray-300 text-center max-w-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Vui lòng chờ trong giây lát trong khi chúng tôi chuẩn bị các thử
            thách hàng ngày cho bạn...
          </motion.p>

          <motion.div
            className="mt-4 flex space-x-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-3 h-3 rounded-full bg-game-primary"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{
                  duration: 1,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: i * 0.2,
                }}
              />
            ))}
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: <Gamepad2 className="h-8 w-8 text-blue-400" />,
              title: "Word Association",
            },
            {
              icon: <Target className="h-8 w-8 text-amber-400" />,
              title: "Word Guess",
            },
            {
              icon: <Trophy className="h-8 w-8 text-green-400" />,
              title: "Idiom Challenge",
            },
          ].map((game, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    {game.icon}
                    <Skeleton className="h-7 w-40 bg-gray-700" />
                  </div>

                  <Skeleton className="h-4 w-full bg-gray-700 mb-3" />
                  <Skeleton className="h-4 w-3/4 bg-gray-700 mb-6" />

                  <div className="flex gap-3 items-center mb-4">
                    <Skeleton className="h-6 w-6 rounded-full bg-gray-700" />
                    <Skeleton className="h-4 w-20 bg-gray-700" />
                  </div>

                  <Skeleton className="h-10 w-full bg-gray-700" />

                  <div className="mt-4 flex justify-between items-center">
                    <Skeleton className="h-5 w-20 bg-gray-700" />
                    <Skeleton className="h-8 w-8 rounded-full bg-gray-700" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
