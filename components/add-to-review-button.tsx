"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { trpc } from "@/trpc/client";
import { useToast } from "@/hooks/use-toast";

interface AddToReviewButtonProps {
  grammarId?: number;
}

export default function AddToReviewButton({
  grammarId,
}: AddToReviewButtonProps) {
  const [isInReviewList, setIsInReviewList] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Mutation để thêm vào danh sách ôn tập
  const addToReviewMutation = trpc.userLearnedGrammar.addToReview.useMutation({
    onSuccess: () => {
      setIsInReviewList(true);
      toast({
        title: "Thành công!",
        description: "Đã thêm vào danh sách ôn tập của bạn.",
      });
    },
    onError: (error) => {
      toast({
        title: "Lỗi!",
        description:
          "Không thể thêm vào danh sách ôn tập. Vui lòng thử lại sau.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsLoading(false);
    },
  });

  // Mutation để xóa khỏi danh sách ôn tập
  const removeFromReviewMutation =
    trpc.userLearnedGrammar.removeFromReview.useMutation({
      onSuccess: () => {
        setIsInReviewList(false);
        toast({
          title: "Thành công!",
          description: "Đã xóa khỏi danh sách ôn tập của bạn.",
        });
      },
      onError: (error) => {
        toast({
          title: "Lỗi!",
          description:
            "Không thể xóa khỏi danh sách ôn tập. Vui lòng thử lại sau.",
          variant: "destructive",
        });
      },
      onSettled: () => {
        setIsLoading(false);
      },
    });

  // Kiểm tra xem ngữ pháp này có trong danh sách ôn tập không
  const { data: reviewGrammars, isLoading: isLoadingReviewList } =
    trpc.userLearnedGrammar.getReviewGrammars.useQuery(
      { page: 1, limit: 100 },
      {
        enabled: !!grammarId,
      }
    );

  // Cập nhật trạng thái khi có dữ liệu
  useEffect(() => {
    if (grammarId && reviewGrammars?.grammars) {
      const isInList = reviewGrammars.grammars.some(
        (g: any) => g.contentId === grammarId
      );
      setIsInReviewList(isInList);
    }
  }, [grammarId, reviewGrammars]);

  const toggleReviewStatus = () => {
    if (!grammarId) return;

    setIsLoading(true);
    if (isInReviewList) {
      removeFromReviewMutation.mutate({ grammarId });
    } else {
      addToReviewMutation.mutate({ grammarId });
    }
  };

  // Nếu không có grammarId, không hiển thị nút
  if (!grammarId) {
    return null;
  }

  return (
    <Button
      variant={isInReviewList ? "secondary" : "outline"}
      className={`gap-2 ${
        isInReviewList
          ? "bg-green-100 text-green-700 hover:bg-green-200"
          : "text-amber-600 hover:bg-amber-50"
      }`}
      onClick={toggleReviewStatus}
      disabled={isLoading || isLoadingReviewList}
    >
      {isLoading ? (
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
      ) : isInReviewList ? (
        <BookmarkCheck className="h-4 w-4" />
      ) : (
        <Bookmark className="h-4 w-4" />
      )}
      {isInReviewList ? "Đã thêm vào ôn tập" : "Thêm vào ôn tập"}
    </Button>
  );
}
