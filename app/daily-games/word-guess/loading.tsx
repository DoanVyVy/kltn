"use client"

import { motion } from "framer-motion"

// Animation variants for letters
const letterVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.3,
    },
  }),
}

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-game-background to-gray-900 flex items-center justify-center">
      <motion.div
        className="flex flex-col items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div className="relative w-32 h-32">
          <motion.div
            className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 blur-lg opacity-70"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          />

          <div className="relative w-32 h-32 flex items-center justify-center">
            {/* Animated letters */}
            {["W", "O", "R", "D"].map((letter, i) => (
              <motion.div
                key={i}
                custom={i}
                variants={letterVariants}
                initial="hidden"
                animate="visible"
                className="text-4xl font-bold text-white mx-1"
              >
                {letter}
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="mt-8 flex space-x-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              className="w-10 h-10 rounded-md border-2 border-amber-500 flex items-center justify-center"
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: 1,
                scale: 1,
                rotateY: [0, 180, 0],
              }}
              transition={{
                duration: 1.5,
                delay: 0.7 + i * 0.15,
                repeat: 0,
                repeatType: "reverse",
              }}
            >
              <span className="text-xl font-bold text-white">?</span>
            </motion.div>
          ))}
        </motion.div>

        <motion.p
          className="mt-6 text-xl text-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          Preparing your challenge...
        </motion.p>
      </motion.div>
    </div>
  )
}

