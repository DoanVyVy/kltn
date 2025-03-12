"use client"

import type { ReactNode } from "react"
import { motion } from "framer-motion"

interface SectionHeaderProps {
  title: string
  delay?: number
  children?: ReactNode
  className?: string
}

export function SectionHeader({ title, delay = 0.4, children, className = "" }: SectionHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`mt-8 ${className}`}
    >
      <h2 className="mb-4 text-2xl font-bold text-game-accent">{title}</h2>
      {children}
    </motion.div>
  )
}

