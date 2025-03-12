"use client"

import type { ReactNode } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface StatsCardProps {
  icon: ReactNode
  title: string
  description?: string
  children: ReactNode
  className?: string
  delay?: number
}

export function StatsCard({ icon, title, description, children, className = "", delay = 0.1 }: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="h-full"
      whileHover={{ y: -5 }}
    >
      <Card className={`game-card h-full overflow-hidden ${className}`}>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center text-xl text-game-accent">
            <motion.div whileHover={{ rotate: 10 }} whileTap={{ scale: 0.95 }}>
              {icon}
            </motion.div>
            {title}
          </CardTitle>
          {description && <CardDescription className="text-game-accent/70">{description}</CardDescription>}
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </motion.div>
  )
}

