"use client"

import { memo } from "react"
import { HelpCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface GameControlsProps {
  onHint: () => void
  onRestart: () => void
}

// Use memo to prevent unnecessary re-renders
export const GameControls = memo(function GameControls({ onHint, onRestart }: GameControlsProps) {
  return (
    <div className="mt-6 flex w-full max-w-2xl justify-between gap-2">
      <Button
        variant="outline"
        className="gap-2 border-amber-500 bg-amber-50 text-amber-700 hover:bg-amber-100"
        onClick={onHint}
      >
        <HelpCircle className="h-4 w-4" />
        Gợi ý
      </Button>

      <Button variant="outline" className="gap-2" onClick={onRestart}>
        <RefreshCw className="h-4 w-4" />
        Chơi lại
      </Button>
    </div>
  )
})

