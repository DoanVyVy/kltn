import { Loader2 } from "lucide-react"
import Navigation from "@/components/navigation"

export default function Loading() {
  return (
    <div className="min-h-screen bg-game-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[80vh]">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 text-game-primary animate-spin" />
          <p className="mt-4 text-game-accent">Đang tải trò chơi...</p>
        </div>
      </div>
    </div>
  )
}

