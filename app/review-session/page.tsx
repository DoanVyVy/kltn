"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { BookText, Brain, Clock, Sparkles } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/navigation";
import { trpc } from "@/trpc/client";

export default function ReviewSessionPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>("vocabulary");

  // Fetch vocabulary review count
  const { data: vocabData, isLoading: isLoadingVocab } =
    trpc.userReviewWords.getReviewWords.useQuery(
      {
        page: 1,
        limit: 1,
      },
      {
        refetchOnWindowFocus: false,
      }
    );

  // Fetch grammar review count
  const { data: grammarData, isLoading: isLoadingGrammar } =
    trpc.userReviewGrammars.getReviewGrammars.useQuery(
      {
        page: 1,
        limit: 1,
      },
      {
        refetchOnWindowFocus: false,
      }
    );

  const vocabCount = vocabData?.total || 0;
  const grammarCount = grammarData?.total || 0;

  const handleRedirect = () => {
    if (activeTab === "vocabulary") {
      router.push("/vocabulary/learned");
    } else {
      router.push("/grammar/learned");
    }
  };

  return (
    <div className="min-h-screen bg-game-background">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-game-accent mb-2">
            Ôn tập của bạn
          </h1>
          <p className="text-game-accent/80">
            Ôn tập để nhớ lâu hơn và nâng cao kỹ năng tiếng Anh
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto">
          <Tabs
            defaultValue="vocabulary"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger
                value="vocabulary"
                className="flex gap-2 items-center py-3"
                data-state={activeTab === "vocabulary" ? "active" : "inactive"}
              >
                <BookText className="h-4 w-4" />
                <span>Từ vựng ({isLoadingVocab ? "..." : vocabCount})</span>
              </TabsTrigger>
              <TabsTrigger
                value="grammar"
                className="flex gap-2 items-center py-3"
                data-state={activeTab === "grammar" ? "active" : "inactive"}
              >
                <Brain className="h-4 w-4" />
                <span>
                  Ngữ pháp ({isLoadingGrammar ? "..." : grammarCount})
                </span>
              </TabsTrigger>
            </TabsList>

            <Card className="border-0 shadow-lg bg-white overflow-hidden">
              <CardContent className="p-8">
                <div className="text-center">
                  <div className="mx-auto rounded-full bg-game-primary/10 p-4 w-20 h-20 flex items-center justify-center mb-6">
                    {activeTab === "vocabulary" ? (
                      <BookText className="h-10 w-10 text-game-primary" />
                    ) : (
                      <Brain className="h-10 w-10 text-game-secondary" />
                    )}
                  </div>

                  <h2 className="text-2xl font-bold text-game-accent mb-2">
                    {activeTab === "vocabulary"
                      ? "Ôn tập từ vựng"
                      : "Ôn tập ngữ pháp"}
                  </h2>

                  <p className="text-gray-600 mb-6">
                    {activeTab === "vocabulary"
                      ? `Bạn có ${vocabCount} từ vựng cần ôn tập. Hãy ôn tập để nhớ lâu hơn.`
                      : `Bạn có ${grammarCount} quy tắc ngữ pháp cần ôn tập. Hãy ôn tập để nắm vững hơn.`}
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
                    <Button
                      onClick={handleRedirect}
                      disabled={
                        (activeTab === "vocabulary" && vocabCount === 0) ||
                        (activeTab === "grammar" && grammarCount === 0)
                      }
                      className="game-button flex gap-2 items-center"
                    >
                      <Sparkles className="h-4 w-4" />
                      <span>
                        {activeTab === "vocabulary"
                          ? "Bắt đầu ôn tập từ vựng"
                          : "Bắt đầu ôn tập ngữ pháp"}
                      </span>
                    </Button>
                  </div>

                  {((activeTab === "vocabulary" && vocabCount === 0) ||
                    (activeTab === "grammar" && grammarCount === 0)) && (
                    <p className="text-amber-600 bg-amber-50 p-4 rounded-lg mt-6 text-sm">
                      {activeTab === "vocabulary"
                        ? "Bạn chưa có từ vựng nào để ôn tập. Hãy thêm từ vào danh sách ôn tập từ trang Từ vựng đã học."
                        : "Bạn chưa có quy tắc ngữ pháp nào để ôn tập. Hãy thêm ngữ pháp vào danh sách ôn tập từ trang Ngữ pháp đã học."}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
