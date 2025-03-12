import Navigation from "@/components/navigation"

export default function GrammarPage() {
  return (
    <div className="min-h-screen bg-game-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-game-accent mb-4">Ngữ pháp tiếng Anh</h1>
        <p className="text-game-accent/80">Học và thực hành các quy tắc ngữ pháp tiếng Anh quan trọng.</p>
      </main>
    </div>
  )
}

