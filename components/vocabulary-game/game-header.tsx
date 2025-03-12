"use client"

import { memo } from "react"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

interface GameHeaderProps {
  courseTitle: string
  sectionTitle: string
  onBack: () => void
}

// Use memo to prevent unnecessary re-renders
export const GameHeader = memo(function GameHeader({ courseTitle, sectionTitle, onBack }: GameHeaderProps) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <Button
        variant="ghost"
        className="gap-2 text-game-accent hover:bg-game-background/50 hover:text-game-primary"
        onClick={onBack}
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại
      </Button>

      <div className="text-right">
        <h2 className="text-lg font-bold text-game-accent">{courseTitle}</h2>
        <p className="text-sm text-game-accent/70">{sectionTitle}</p>
      </div>
    </div>
  )
})

