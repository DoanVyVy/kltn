"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { PlusCircle, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

import DailyGameTable from "./DailyGameTable";
import DailyGameForm from "./DailyGameForm";
import { trpc } from "@/trpc/client";

export default function DailyGameManagement() {
  const [selectedTab, setSelectedTab] = useState<
    "wordGuess" | "sentenceScramble" | "wordAssociation" | "idiomChallenge"
  >("wordGuess");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentGame, setCurrentGame] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Word Guess data and mutations
  const {
    data: wordGuessData,
    isLoading: isLoadingWordGuess,
    refetch: refetchWordGuess,
  } = trpc.dailyGames.getAllDailyWordGuesses.useQuery({
    page: 1,
    limit: 50,
    search: searchTerm,
  });

  const createWordGuessMutation =
    trpc.dailyGames.createDailyWordGuess.useMutation({
      onSuccess: () => {
        refetchWordGuess();
        setIsAddDialogOpen(false);
        toast.success("Đố từ hàng ngày đã được tạo thành công");
      },
      onError: (error) => {
        toast.error(`Lỗi khi tạo đố từ: ${error.message}`);
      },
    });

  const updateWordGuessMutation =
    trpc.dailyGames.updateDailyWordGuess.useMutation({
      onSuccess: () => {
        refetchWordGuess();
        setIsEditDialogOpen(false);
        toast.success("Đố từ hàng ngày đã được cập nhật thành công");
      },
      onError: (error) => {
        toast.error(`Lỗi khi cập nhật đố từ: ${error.message}`);
      },
    });

  const deleteWordGuessMutation =
    trpc.dailyGames.deleteDailyWordGuess.useMutation({
      onSuccess: () => {
        refetchWordGuess();
        setIsDeleteDialogOpen(false);
        toast.success("Đố từ hàng ngày đã được xóa thành công");
      },
      onError: (error) => {
        toast.error(`Lỗi khi xóa đố từ: ${error.message}`);
      },
    });

  // Sentence Scramble data and mutations
  const {
    data: sentenceScrambleData,
    isLoading: isLoadingSentenceScramble,
    refetch: refetchSentenceScramble,
  } = trpc.dailyGames.getAllDailySentenceScrambles.useQuery({
    page: 1,
    limit: 50,
    search: searchTerm,
  });

  const createSentenceScrambleMutation =
    trpc.dailyGames.createDailySentenceScramble.useMutation({
      onSuccess: () => {
        refetchSentenceScramble();
        setIsAddDialogOpen(false);
        toast.success("Câu đố hàng ngày đã được tạo thành công");
      },
      onError: (error) => {
        toast.error(`Lỗi khi tạo câu đố: ${error.message}`);
      },
    });

  const updateSentenceScrambleMutation =
    trpc.dailyGames.updateDailySentenceScramble.useMutation({
      onSuccess: () => {
        refetchSentenceScramble();
        setIsEditDialogOpen(false);
        toast.success("Câu đố hàng ngày đã được cập nhật thành công");
      },
      onError: (error) => {
        toast.error(`Lỗi khi cập nhật câu đố: ${error.message}`);
      },
    });

  const deleteSentenceScrambleMutation =
    trpc.dailyGames.deleteDailySentenceScramble.useMutation({
      onSuccess: () => {
        refetchSentenceScramble();
        setIsDeleteDialogOpen(false);
        toast.success("Câu đố hàng ngày đã được xóa thành công");
      },
      onError: (error) => {
        toast.error(`Lỗi khi xóa câu đố: ${error.message}`);
      },
    });

  // Word Association data and mutations
  const {
    data: wordAssociationData,
    isLoading: isLoadingWordAssociation,
    refetch: refetchWordAssociation,
  } = trpc.dailyGames.getAllDailyWordAssociations.useQuery({
    page: 1,
    limit: 50,
    search: searchTerm,
  });

  const createWordAssociationMutation =
    trpc.dailyGames.createDailyWordAssociation.useMutation({
      onSuccess: () => {
        refetchWordAssociation();
        setIsAddDialogOpen(false);
        toast.success("Liên kết từ hàng ngày đã được tạo thành công");
      },
      onError: (error) => {
        toast.error(`Lỗi khi tạo liên kết từ: ${error.message}`);
      },
    });

  const updateWordAssociationMutation =
    trpc.dailyGames.updateDailyWordAssociation.useMutation({
      onSuccess: () => {
        refetchWordAssociation();
        setIsEditDialogOpen(false);
        toast.success("Liên kết từ hàng ngày đã được cập nhật thành công");
      },
      onError: (error) => {
        toast.error(`Lỗi khi cập nhật liên kết từ: ${error.message}`);
      },
    });

  const deleteWordAssociationMutation =
    trpc.dailyGames.deleteDailyWordAssociation.useMutation({
      onSuccess: () => {
        refetchWordAssociation();
        setIsDeleteDialogOpen(false);
        toast.success("Liên kết từ hàng ngày đã được xóa thành công");
      },
      onError: (error) => {
        toast.error(`Lỗi khi xóa liên kết từ: ${error.message}`);
      },
    });

  // Idiom Challenge data and mutations
  const {
    data: idiomChallengeData,
    isLoading: isLoadingIdiomChallenge,
    refetch: refetchIdiomChallenge,
  } = trpc.dailyGames.getAllDailyIdiomChallenges.useQuery({
    page: 1,
    limit: 50,
    search: searchTerm,
  });

  const createIdiomChallengeMutation =
    trpc.dailyGames.createDailyIdiomChallenge.useMutation({
      onSuccess: () => {
        refetchIdiomChallenge();
        setIsAddDialogOpen(false);
        toast.success("Thách thức thành ngữ hàng ngày đã được tạo thành công");
      },
      onError: (error) => {
        toast.error(`Lỗi khi tạo thách thức thành ngữ: ${error.message}`);
      },
    });

  const updateIdiomChallengeMutation =
    trpc.dailyGames.updateDailyIdiomChallenge.useMutation({
      onSuccess: () => {
        refetchIdiomChallenge();
        setIsEditDialogOpen(false);
        toast.success(
          "Thách thức thành ngữ hàng ngày đã được cập nhật thành công"
        );
      },
      onError: (error) => {
        toast.error(`Lỗi khi cập nhật thách thức thành ngữ: ${error.message}`);
      },
    });

  const deleteIdiomChallengeMutation =
    trpc.dailyGames.deleteDailyIdiomChallenge.useMutation({
      onSuccess: () => {
        refetchIdiomChallenge();
        setIsDeleteDialogOpen(false);
        toast.success("Thách thức thành ngữ hàng ngày đã được xóa thành công");
      },
      onError: (error) => {
        toast.error(`Lỗi khi xóa thách thức thành ngữ: ${error.message}`);
      },
    });

  const handleAdd = () => {
    setCurrentGame(null);
    setIsAddDialogOpen(true);
  };

  const handleEdit = (game: any) => {
    setCurrentGame(game);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (game: any) => {
    setCurrentGame(game);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmitAdd = (data: any) => {
    switch (selectedTab) {
      case "wordGuess":
        createWordGuessMutation.mutate(data);
        break;
      case "sentenceScramble":
        createSentenceScrambleMutation.mutate(data);
        break;
      case "wordAssociation":
        createWordAssociationMutation.mutate(data);
        break;
      case "idiomChallenge":
        createIdiomChallengeMutation.mutate(data);
        break;
    }
  };

  const handleSubmitEdit = (data: any) => {
    const payload = { id: currentGame.id, ...data };

    switch (selectedTab) {
      case "wordGuess":
        updateWordGuessMutation.mutate(payload);
        break;
      case "sentenceScramble":
        updateSentenceScrambleMutation.mutate(payload);
        break;
      case "wordAssociation":
        updateWordAssociationMutation.mutate(payload);
        break;
      case "idiomChallenge":
        updateIdiomChallengeMutation.mutate(payload);
        break;
    }
  };

  const handleConfirmDelete = () => {
    if (!currentGame) return;

    switch (selectedTab) {
      case "wordGuess":
        deleteWordGuessMutation.mutate({ id: currentGame.id });
        break;
      case "sentenceScramble":
        deleteSentenceScrambleMutation.mutate({ id: currentGame.id });
        break;
      case "wordAssociation":
        deleteWordAssociationMutation.mutate({ id: currentGame.id });
        break;
      case "idiomChallenge":
        deleteIdiomChallengeMutation.mutate({ id: currentGame.id });
        break;
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Quản lý trò chơi hàng ngày</h2>

        <div className="flex space-x-2">
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm trò chơi..."
              className="pl-8"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          <Button onClick={handleAdd}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Thêm mới
          </Button>
        </div>
      </div>

      <Tabs
        defaultValue="wordGuess"
        value={selectedTab}
        onValueChange={(value) => setSelectedTab(value as any)}
        className="w-full"
      >
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="wordGuess">Đố từ</TabsTrigger>
          <TabsTrigger value="sentenceScramble">Xếp câu</TabsTrigger>
          <TabsTrigger value="wordAssociation">Liên kết từ</TabsTrigger>
          <TabsTrigger value="idiomChallenge">Thành ngữ</TabsTrigger>
        </TabsList>

        <TabsContent value="wordGuess">
          <DailyGameTable
            games={wordGuessData?.items || []}
            gameType="wordGuess"
            isLoading={isLoadingWordGuess}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </TabsContent>

        <TabsContent value="sentenceScramble">
          <DailyGameTable
            games={sentenceScrambleData?.items || []}
            gameType="sentenceScramble"
            isLoading={isLoadingSentenceScramble}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </TabsContent>

        <TabsContent value="wordAssociation">
          <DailyGameTable
            games={wordAssociationData?.items || []}
            gameType="wordAssociation"
            isLoading={isLoadingWordAssociation}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </TabsContent>

        <TabsContent value="idiomChallenge">
          <DailyGameTable
            games={idiomChallengeData?.items || []}
            gameType="idiomChallenge"
            isLoading={isLoadingIdiomChallenge}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </TabsContent>
      </Tabs>

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Thêm{" "}
              {selectedTab === "wordGuess"
                ? "đố từ"
                : selectedTab === "sentenceScramble"
                ? "câu đố"
                : selectedTab === "wordAssociation"
                ? "liên kết từ"
                : "thách thức thành ngữ"}{" "}
              hàng ngày
            </DialogTitle>
            <DialogDescription>
              Điền thông tin để tạo trò chơi hàng ngày mới
            </DialogDescription>
          </DialogHeader>

          <DailyGameForm
            gameType={selectedTab}
            onSubmit={handleSubmitAdd}
            onCancel={() => setIsAddDialogOpen(false)}
            isSubmitting={
              createWordGuessMutation.isLoading ||
              createSentenceScrambleMutation.isLoading ||
              createWordAssociationMutation.isLoading ||
              createIdiomChallengeMutation.isLoading
            }
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Sửa{" "}
              {selectedTab === "wordGuess"
                ? "đố từ"
                : selectedTab === "sentenceScramble"
                ? "câu đố"
                : selectedTab === "wordAssociation"
                ? "liên kết từ"
                : "thách thức thành ngữ"}{" "}
              hàng ngày
            </DialogTitle>
            <DialogDescription>
              Cập nhật thông tin trò chơi hàng ngày
            </DialogDescription>
          </DialogHeader>

          <DailyGameForm
            gameType={selectedTab}
            initialData={currentGame}
            onSubmit={handleSubmitEdit}
            onCancel={() => setIsEditDialogOpen(false)}
            isSubmitting={
              updateWordGuessMutation.isLoading ||
              updateSentenceScrambleMutation.isLoading ||
              updateWordAssociationMutation.isLoading ||
              updateIdiomChallengeMutation.isLoading
            }
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa{" "}
              {selectedTab === "wordGuess"
                ? "đố từ"
                : selectedTab === "sentenceScramble"
                ? "câu đố"
                : selectedTab === "wordAssociation"
                ? "liên kết từ"
                : "thách thức thành ngữ"}{" "}
              hàng ngày này không? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={
                deleteWordGuessMutation.isLoading ||
                deleteSentenceScrambleMutation.isLoading ||
                deleteWordAssociationMutation.isLoading ||
                deleteIdiomChallengeMutation.isLoading
              }
            >
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
