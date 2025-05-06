"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { trpc } from "@/trpc/client";
import { Badge } from "@/components/ui/badge";
import { FileJson, Gamepad2, Pencil, Plus, Search, Trash2 } from "lucide-react";
import ImportGameDialog from "@/components/admin/ImportGameDialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function GameManagementPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [gameType, setGameType] = useState<string>("all");

  const pageSize = 10;

  // Fetch games with pagination and filtering
  const {
    data: gamesData,
    isLoading,
    refetch,
  } = trpc.games.getAll.useQuery({
    page: currentPage,
    limit: pageSize,
    search: searchQuery,
    difficulty: activeTab !== "all" ? activeTab : undefined,
    type: gameType !== "all" ? gameType : undefined,
  });

  // Delete game mutation
  const deleteGameMutation = trpc.games.delete.useMutation({
    onSuccess: () => {
      toast({
        title: "Game deleted",
        description: "The game was deleted successfully.",
      });
      refetch();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete game: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Handle delete game
  const handleDeleteGame = (id: number) => {
    if (confirm("Are you sure you want to delete this game?")) {
      deleteGameMutation.mutate({ id });
    }
  };

  // Handle import completed
  const handleImportSuccess = () => {
    refetch();
    toast({
      title: "Import completed",
      description: "Game data imported successfully!",
      variant: "success",
    });
  };

  // Render difficulty badge
  const renderDifficultyBadge = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return <Badge className="bg-green-500">Easy</Badge>;
      case "medium":
        return <Badge className="bg-amber-500">Medium</Badge>;
      case "hard":
        return <Badge className="bg-red-500">Hard</Badge>;
      default:
        return <Badge className="bg-gray-500">{difficulty}</Badge>;
    }
  };

  // Format game type for display
  const formatGameType = (type: string) => {
    switch (type) {
      case "word-guess":
        return "Word Guess";
      case "sentence-scramble":
        return "Sentence Scramble";
      case "word-association":
        return "Word Association";
      case "idiom-challenge":
        return "Idiom Challenge";
      default:
        return type
          .replace(/-/g, " ")
          .replace(/\b\w/g, (char) => char.toUpperCase());
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Game Management
            </h1>
            <p className="text-muted-foreground">
              Manage game data for the learning platform.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setImportDialogOpen(true)}
              className="flex items-center gap-2"
            >
              <FileJson className="h-4 w-4" />
              Import Games
            </Button>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Game
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Daily Games</CardTitle>
            <CardDescription>
              Browse, search, and manage all game content.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6 space-y-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search for games..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <Select value={gameType} onValueChange={setGameType}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Game Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Games</SelectItem>
                    <SelectItem value="word-guess">Word Guess</SelectItem>
                    <SelectItem value="sentence-scramble">
                      Sentence Scramble
                    </SelectItem>
                    <SelectItem value="word-association">
                      Word Association
                    </SelectItem>
                    <SelectItem value="idiom-challenge">
                      Idiom Challenge
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-fit"
                >
                  <TabsList>
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="easy">Easy</TabsTrigger>
                    <TabsTrigger value="medium">Medium</TabsTrigger>
                    <TabsTrigger value="hard">Hard</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              </div>
            ) : (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Difficulty</TableHead>
                        <TableHead>Content</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {gamesData?.items && gamesData.items.length > 0 ? (
                        gamesData.items.map((game) => (
                          <TableRow key={game.id}>
                            <TableCell className="font-medium">
                              {game.id}
                            </TableCell>
                            <TableCell>{game.title}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Gamepad2 className="h-4 w-4 text-blue-500" />
                                <span>{formatGameType(game.type)}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {renderDifficultyBadge(
                                game.difficulty || "medium"
                              )}
                            </TableCell>
                            <TableCell>
                              {game.type === "word-guess" && game.words && (
                                <span className="text-sm">
                                  {game.words.length} words
                                </span>
                              )}
                              {game.type === "sentence-scramble" &&
                                game.sentences && (
                                  <span className="text-sm">
                                    {game.sentences.length} sentences
                                  </span>
                                )}
                              {game.type === "word-association" &&
                                game.associations && (
                                  <span className="text-sm">
                                    {game.associations.length} pairs
                                  </span>
                                )}
                              {game.type === "idiom-challenge" &&
                                game.idioms && (
                                  <span className="text-sm">
                                    {game.idioms.length} idioms
                                  </span>
                                )}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="icon">
                                  <Pencil className="h-4 w-4" />
                                  <span className="sr-only">Edit</span>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteGame(game.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                  <span className="sr-only">Delete</span>
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center">
                            No games found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {gamesData?.totalPages && gamesData.totalPages > 1 && (
                  <div className="flex items-center justify-between space-x-2 py-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <div className="text-sm text-muted-foreground">
                      Page {currentPage} of {gamesData.totalPages}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) =>
                          Math.min(prev + 1, gamesData.totalPages)
                        )
                      }
                      disabled={currentPage === gamesData.totalPages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Import Game Dialog */}
      <ImportGameDialog
        isOpen={importDialogOpen}
        setIsOpen={setImportDialogOpen}
        onImportSuccess={handleImportSuccess}
      />
    </div>
  );
}
