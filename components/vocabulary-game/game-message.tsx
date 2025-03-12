"use client"

import { memo } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface GameMessageProps {
  message: {
    text: string
    type: "success" | "error" | "info"
  } | null
}

// Use memo to prevent unnecessary re-renders
export const GameMessage = memo(function GameMessage({ message }: GameMessageProps) {
  if (!message) return null

  const messageStyles = {
    success: "bg-green-100 text-green-800",
    error: "bg-red-100 text-red-800",
    info: "bg-blue-100 text-blue-800",
  }

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className={`mb-4 rounded-md p-3 text-center ${messageStyles[message.type]}`}
        >
          {message.text}
        </motion.div>
      )}
    </AnimatePresence>
  )
})

