import { memo } from "react"
import { Check } from "lucide-react"

interface WordListProps {
  words: {
    word: string
    definition: string
    found: boolean
  }[]
}

// Use memo to prevent unnecessary re-renders
export const WordList = memo(function WordList({ words }: WordListProps) {
  return (
    <div className="mt-8">
      <h3 className="mb-4 text-xl font-bold text-game-accent">Từ đã tìm thấy:</h3>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {words.map((word) => (
          <div
            key={word.word}
            className={`rounded-md border p-3 ${
              word.found ? "border-green-200 bg-green-50" : "border-gray-200 bg-gray-50"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`font-medium ${word.found ? "text-green-700" : "text-gray-400"}`}>
                {word.found ? word.word : "?".repeat(word.word.length)}
              </span>
              {word.found && <Check className="h-4 w-4 text-green-600" />}
            </div>
            <p className={`text-sm ${word.found ? "text-green-600" : "text-gray-400"}`}>
              {word.found ? word.definition : "?????"}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
})

