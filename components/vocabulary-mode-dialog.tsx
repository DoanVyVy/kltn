"use client"
import { useRouter } from "next/navigation"
import { BookOpen, Gamepad2 } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"

interface VocabularyModeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  courseId: number
  sectionId?: number
}

export function VocabularyModeDialog({ open, onOpenChange, courseId, sectionId }: VocabularyModeDialogProps) {
  const router = useRouter()

  const handleSelectMode = (mode: "learn" | "game") => {
    let url = `/vocabulary/${mode}/${courseId}`

    if (sectionId) {
      url += `?section=${sectionId}`
    }

    router.push(url)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl text-game-accent">Chọn chế độ học</DialogTitle>
          <DialogDescription className="text-center text-game-accent/70">
            Bạn muốn học từ vựng bằng phương pháp nào?
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 pt-4">
          <Card
            className="cursor-pointer border-2 border-transparent transition-all hover:border-game-primary hover:shadow-md"
            onClick={() => handleSelectMode("learn")}
          >
            <CardContent className="flex flex-col items-center gap-4 p-6">
              <div className="rounded-full bg-game-primary/10 p-3">
                <BookOpen className="h-8 w-8 text-game-primary" />
              </div>
              <div className="text-center">
                <h3 className="font-medium text-game-accent">Flashcards</h3>
                <p className="text-sm text-game-accent/70">Học từng từ với thẻ ghi nhớ</p>
              </div>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer border-2 border-transparent transition-all hover:border-game-primary hover:shadow-md"
            onClick={() => handleSelectMode("game")}
          >
            <CardContent className="flex flex-col items-center gap-4 p-6">
              <div className="rounded-full bg-game-primary/10 p-3">
                <Gamepad2 className="h-8 w-8 text-game-primary" />
              </div>
              <div className="text-center">
                <h3 className="font-medium text-game-accent">Trò chơi</h3>
                <p className="text-sm text-game-accent/70">Học từ vựng qua các trò chơi tương tác</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}

