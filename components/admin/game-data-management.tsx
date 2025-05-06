"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  PlusCircle,
  Pencil,
  Trash2,
  Search,
  Minus,
  FileUp,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/trpc/client";
import ImportGameDialog from "./ImportGameDialog";

export default function GameDataManagement() {
  // Real data fetching
  const {
    data: gameData,
    isLoading: isLoadingGames,
    refetch: refetchGames,
  } = trpc.games.getAll.useQuery();
  const games = gameData?.games || MOCK_GAMES; // Fallback to mock data if API call fails

  type Game = {
    id: number;
    type: string;
    title: string;
    description: string;
    difficulty: string;
    words?: string[];
    sentences?: { original: string; scrambled: string[] }[];
    wordPairs?: { word: string; association: string }[];
    idioms?: { idiom: string; meaning: string; explanation: string }[];
    active: boolean;
  };

  // State variables
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [currentGame, setCurrentGame] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedTab, setSelectedTab] = useState("word-guess");
  const [formData, setFormData] = useState({
    type: "word-guess",
    title: "",
    description: "",
    difficulty: "medium",
    words: [""],
    sentences: [{ original: "", scrambled: [""] }],
    wordPairs: [{ word: "", association: "" }],
    idioms: [{ idiom: "", meaning: "", explanation: "" }],
    active: true,
  });

  // Create mutation
  const createGameMutation = trpc.games.create.useMutation({
    onSuccess: () => {
      refetchGames();
      setIsAddDialogOpen(false);
      resetForm();
    },
  });

  // Update mutation
  const updateGameMutation = trpc.games.update.useMutation({
    onSuccess: () => {
      refetchGames();
      setIsEditDialogOpen(false);
    },
  });

  // Delete mutation
  const deleteGameMutation = trpc.games.delete.useMutation({
    onSuccess: () => {
      refetchGames();
      setIsDeleteDialogOpen(false);
    },
  });

  // Lọc trò chơi dựa trên tìm kiếm và loại
  const filteredGames = games.filter((game) => {
    const matchesSearch = game.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "all" || game.type === selectedType;
    return matchesSearch && matchesType;
  });

  const handleAddGame = () => {
    const newGame = {
      type: formData.type,
      title: formData.title,
      description: formData.description,
      difficulty: formData.difficulty,
      active: formData.active,
      ...(formData.type === "word-guess" && { words: formData.words }),
      ...(formData.type === "sentence-scramble" && {
        sentences: formData.sentences,
      }),
      ...(formData.type === "word-association" && {
        wordPairs: formData.wordPairs,
      }),
      ...(formData.type === "idiom-challenge" && { idioms: formData.idioms }),
    };

    createGameMutation.mutate(newGame);
  };

  const handleEditGame = () => {
    const updatedGame = {
      id: currentGame.id,
      type: formData.type,
      title: formData.title,
      description: formData.description,
      difficulty: formData.difficulty,
      active: formData.active,
      ...(formData.type === "word-guess" && { words: formData.words }),
      ...(formData.type === "sentence-scramble" && {
        sentences: formData.sentences,
      }),
      ...(formData.type === "word-association" && {
        wordPairs: formData.wordPairs,
      }),
      ...(formData.type === "idiom-challenge" && { idioms: formData.idioms }),
    };

    updateGameMutation.mutate(updatedGame);
  };

  const handleDeleteGame = () => {
    if (currentGame?.id) {
      deleteGameMutation.mutate({ id: currentGame.id });
    }
  };

  const openEditDialog = (game: any) => {
    setCurrentGame(game);
    setSelectedTab(game.type);
    setFormData({
      type: game.type,
      title: game.title,
      description: game.description,
      difficulty: game.difficulty,
      active: game.active,
      words: game.type === "word-guess" ? [...game.words] : [""],
      sentences:
        game.type === "sentence-scramble"
          ? [...game.sentences]
          : [{ original: "", scrambled: [""] }],
      wordPairs:
        game.type === "word-association"
          ? [...game.wordPairs]
          : [{ word: "", association: "" }],
      idioms:
        game.type === "idiom-challenge"
          ? [...game.idioms]
          : [{ idiom: "", meaning: "", explanation: "" }],
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (game: any) => {
    setCurrentGame(game);
    setIsDeleteDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      type: "word-guess",
      title: "",
      description: "",
      difficulty: "medium",
      words: [""],
      sentences: [{ original: "", scrambled: [""] }],
      wordPairs: [{ word: "", association: "" }],
      idioms: [{ idiom: "", meaning: "", explanation: "" }],
      active: true,
    });
    setSelectedTab("word-guess");
  };

  // Xử lý thêm/xóa các mục trong form
  const handleAddWord = () => {
    setFormData({
      ...formData,
      words: [...formData.words, ""],
    });
  };

  const handleRemoveWord = (index: number) => {
    const newWords = [...formData.words];
    newWords.splice(index, 1);
    setFormData({
      ...formData,
      words: newWords,
    });
  };

  const handleWordChange = (index: number, value: string) => {
    const newWords = [...formData.words];
    newWords[index] = value;
    setFormData({
      ...formData,
      words: newWords,
    });
  };

  const handleAddSentence = () => {
    setFormData({
      ...formData,
      sentences: [...formData.sentences, { original: "", scrambled: [""] }],
    });
  };

  const handleRemoveSentence = (index: number) => {
    const newSentences = [...formData.sentences];
    newSentences.splice(index, 1);
    setFormData({
      ...formData,
      sentences: newSentences,
    });
  };

  const handleSentenceChange = (
    index: number,
    field: string,
    value: string
  ) => {
    const newSentences = [...formData.sentences];
    if (field === "original") {
      newSentences[index] = {
        ...newSentences[index],
        original: value,
        scrambled: value.split(" "),
      };
    } else {
      newSentences[index] = {
        ...newSentences[index],
        [field]: value,
      };
    }
    setFormData({
      ...formData,
      sentences: newSentences,
    });
  };

  const handleAddWordPair = () => {
    setFormData({
      ...formData,
      wordPairs: [...formData.wordPairs, { word: "", association: "" }],
    });
  };

  const handleRemoveWordPair = (index: number) => {
    const newWordPairs = [...formData.wordPairs];
    newWordPairs.splice(index, 1);
    setFormData({
      ...formData,
      wordPairs: newWordPairs,
    });
  };

  const handleWordPairChange = (
    index: number,
    field: string,
    value: string
  ) => {
    const newWordPairs = [...formData.wordPairs];
    newWordPairs[index] = {
      ...newWordPairs[index],
      [field]: value,
    };
    setFormData({
      ...formData,
      wordPairs: newWordPairs,
    });
  };

  const handleAddIdiom = () => {
    setFormData({
      ...formData,
      idioms: [...formData.idioms, { idiom: "", meaning: "", explanation: "" }],
    });
  };

  const handleRemoveIdiom = (index: number) => {
    const newIdioms = [...formData.idioms];
    newIdioms.splice(index, 1);
    setFormData({
      ...formData,
      idioms: newIdioms,
    });
  };

  const handleIdiomChange = (index: number, field: string, value: string) => {
    const newIdioms = [...formData.idioms];
    newIdioms[index] = {
      ...newIdioms[index],
      [field]: value,
    };
    setFormData({
      ...formData,
      idioms: newIdioms,
    });
  };

  // Handler for import success
  const handleImportSuccess = () => {
    refetchGames();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Quản lý dữ liệu trò chơi</h2>
        <div className="flex gap-2">
          <Button
            className="flex items-center gap-2 bg-game-primary hover:bg-game-primary/90"
            onClick={() => setIsImportDialogOpen(true)}
          >
            <FileUp size={16} />
            Import dữ liệu
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2 bg-game-primary hover:bg-game-primary/90">
                <PlusCircle size={16} />
                Thêm trò chơi mới
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Thêm trò chơi mới</DialogTitle>
                <DialogDescription>
                  Điền thông tin chi tiết cho trò chơi mới
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
                <Tabs
                  value={selectedTab}
                  onValueChange={(value) => {
                    setSelectedTab(value);
                    setFormData({ ...formData, type: value });
                  }}
                >
                  <TabsList className="grid grid-cols-4 mb-4">
                    <TabsTrigger value="word-guess">Đoán từ</TabsTrigger>
                    <TabsTrigger value="sentence-scramble">Xếp câu</TabsTrigger>
                    <TabsTrigger value="word-association">
                      Liên kết từ
                    </TabsTrigger>
                    <TabsTrigger value="idiom-challenge">Thành ngữ</TabsTrigger>
                  </TabsList>

                  <div className="mb-6 border-b pb-6">
                    <div className="grid grid-cols-4 items-center gap-4 mb-4">
                      <Label htmlFor="title" className="text-right">
                        Tiêu đề
                      </Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4 mb-4">
                      <Label htmlFor="description" className="text-right">
                        Mô tả
                      </Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4 mb-4">
                      <Label htmlFor="difficulty" className="text-right">
                        Độ khó
                      </Label>
                      <select
                        id="difficulty"
                        value={formData.difficulty}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            difficulty: e.target.value,
                          })
                        }
                        className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="easy">Dễ</option>
                        <option value="medium">Trung bình</option>
                        <option value="hard">Khó</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="active" className="text-right">
                        Trạng thái
                      </Label>
                      <select
                        id="active"
                        value={formData.active ? "true" : "false"}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            active: e.target.value === "true",
                          })
                        }
                        className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="true">Hoạt động</option>
                        <option value="false">Không hoạt động</option>
                      </select>
                    </div>
                  </div>

                  <TabsContent value="word-guess">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium">Danh sách từ</h3>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleAddWord}
                        >
                          Thêm từ
                        </Button>
                      </div>

                      {formData.words.map((word, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Input
                            value={word}
                            onChange={(e) =>
                              handleWordChange(index, e.target.value)
                            }
                            placeholder={`Từ ${index + 1}`}
                            className="flex-1"
                          />
                          {formData.words.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveWord(index)}
                            >
                              <Minus size={16} />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="sentence-scramble">
                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium">Danh sách câu</h3>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleAddSentence}
                        >
                          Thêm câu
                        </Button>
                      </div>

                      {formData.sentences.map((sentence, index) => (
                        <div key={index} className="border p-4 rounded-md">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium">Câu {index + 1}</h4>
                            {formData.sentences.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveSentence(index)}
                              >
                                <Minus size={16} />
                              </Button>
                            )}
                          </div>
                          <div className="grid gap-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label
                                htmlFor={`sentence-${index}`}
                                className="text-right"
                              >
                                Câu gốc
                              </Label>
                              <Input
                                id={`sentence-${index}`}
                                value={sentence.original}
                                onChange={(e) =>
                                  handleSentenceChange(
                                    index,
                                    "original",
                                    e.target.value
                                  )
                                }
                                className="col-span-3"
                                placeholder="Nhập câu hoàn chỉnh"
                              />
                            </div>
                            <div className="grid grid-cols-4 items-start gap-4">
                              <Label className="text-right pt-2">
                                Từ đã tách
                              </Label>
                              <div className="col-span-3 flex flex-wrap gap-2">
                                {sentence.scrambled.map((word, wordIndex) => (
                                  <Badge key={wordIndex} variant="secondary">
                                    {word}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="word-association">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium">Cặp từ liên kết</h3>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleAddWordPair}
                        >
                          Thêm cặp từ
                        </Button>
                      </div>

                      {formData.wordPairs.map((pair, index) => (
                        <div key={index} className="border p-4 rounded-md">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium">Cặp từ {index + 1}</h4>
                            {formData.wordPairs.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveWordPair(index)}
                              >
                                <Minus size={16} />
                              </Button>
                            )}
                          </div>
                          <div className="grid gap-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label
                                htmlFor={`word-${index}`}
                                className="text-right"
                              >
                                Từ gợi ý
                              </Label>
                              <Input
                                id={`word-${index}`}
                                value={pair.word}
                                onChange={(e) =>
                                  handleWordPairChange(
                                    index,
                                    "word",
                                    e.target.value
                                  )
                                }
                                className="col-span-3"
                                placeholder="Từ gợi ý"
                              />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label
                                htmlFor={`association-${index}`}
                                className="text-right"
                              >
                                Từ liên kết
                              </Label>
                              <Input
                                id={`association-${index}`}
                                value={pair.association}
                                onChange={(e) =>
                                  handleWordPairChange(
                                    index,
                                    "association",
                                    e.target.value
                                  )
                                }
                                className="col-span-3"
                                placeholder="Từ liên kết"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="idiom-challenge">
                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium">Thành ngữ</h3>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleAddIdiom}
                        >
                          Thêm thành ngữ
                        </Button>
                      </div>

                      {formData.idioms.map((idiom, index) => (
                        <div key={index} className="border p-4 rounded-md">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium">
                              Thành ngữ {index + 1}
                            </h4>
                            {formData.idioms.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveIdiom(index)}
                              >
                                <Minus size={16} />
                              </Button>
                            )}
                          </div>
                          <div className="grid gap-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label
                                htmlFor={`idiom-${index}`}
                                className="text-right"
                              >
                                Thành ngữ
                              </Label>
                              <Input
                                id={`idiom-${index}`}
                                value={idiom.idiom}
                                onChange={(e) =>
                                  handleIdiomChange(
                                    index,
                                    "idiom",
                                    e.target.value
                                  )
                                }
                                className="col-span-3"
                                placeholder="Nhập thành ngữ"
                              />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label
                                htmlFor={`meaning-${index}`}
                                className="text-right"
                              >
                                Ý nghĩa
                              </Label>
                              <Input
                                id={`meaning-${index}`}
                                value={idiom.meaning}
                                onChange={(e) =>
                                  handleIdiomChange(
                                    index,
                                    "meaning",
                                    e.target.value
                                  )
                                }
                                className="col-span-3"
                                placeholder="Ý nghĩa của thành ngữ"
                              />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label
                                htmlFor={`explanation-${index}`}
                                className="text-right"
                              >
                                Giải thích
                              </Label>
                              <Textarea
                                id={`explanation-${index}`}
                                value={idiom.explanation}
                                onChange={(e) =>
                                  handleIdiomChange(
                                    index,
                                    "explanation",
                                    e.target.value
                                  )
                                }
                                className="col-span-3"
                                placeholder="Giải thích chi tiết"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Hủy
                </Button>
                <Button
                  onClick={handleAddGame}
                  className="bg-game-primary hover:bg-game-primary/90"
                >
                  Thêm trò chơi
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm trò chơi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Chọn loại trò chơi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trò chơi</SelectItem>
                <SelectItem value="word-guess">Đoán từ</SelectItem>
                <SelectItem value="sentence-scramble">Xếp câu</SelectItem>
                <SelectItem value="word-association">Liên kết từ</SelectItem>
                <SelectItem value="idiom-challenge">Thành ngữ</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tiêu đề</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead>Mô tả</TableHead>
                <TableHead>Độ khó</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingGames ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    <div className="flex justify-center">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Đang tải dữ liệu...
                    </p>
                  </TableCell>
                </TableRow>
              ) : filteredGames.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    <p className="text-muted-foreground">
                      Không tìm thấy trò chơi phù hợp
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredGames.map((game) => (
                  <TableRow key={game.id}>
                    <TableCell className="font-medium">{game.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {game.type === "word-guess" && "Đoán từ"}
                        {game.type === "sentence-scramble" && "Xếp câu"}
                        {game.type === "word-association" && "Liên kết từ"}
                        {game.type === "idiom-challenge" && "Thành ngữ"}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {game.description}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          game.difficulty === "easy"
                            ? "default"
                            : game.difficulty === "medium"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {game.difficulty === "easy" && "Dễ"}
                        {game.difficulty === "medium" && "Trung bình"}
                        {game.difficulty === "hard" && "Khó"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={game.active ? "default" : "secondary"}>
                        {game.active ? "Hoạt động" : "Không hoạt động"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openEditDialog(game)}
                        >
                          <Pencil size={16} />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openDeleteDialog(game)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa trò chơi</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin cho trò chơi
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
            <Tabs
              value={selectedTab}
              onValueChange={(value) => {
                setSelectedTab(value);
                setFormData({ ...formData, type: value });
              }}
            >
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="word-guess">Đoán từ</TabsTrigger>
                <TabsTrigger value="sentence-scramble">Xếp câu</TabsTrigger>
                <TabsTrigger value="word-association">Liên kết từ</TabsTrigger>
                <TabsTrigger value="idiom-challenge">Thành ngữ</TabsTrigger>
              </TabsList>

              <div className="mb-6 border-b pb-6">
                <div className="grid grid-cols-4 items-center gap-4 mb-4">
                  <Label htmlFor="edit-title" className="text-right">
                    Tiêu đề
                  </Label>
                  <Input
                    id="edit-title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4 mb-4">
                  <Label htmlFor="edit-description" className="text-right">
                    Mô tả
                  </Label>
                  <Textarea
                    id="edit-description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4 mb-4">
                  <Label htmlFor="edit-difficulty" className="text-right">
                    Độ khó
                  </Label>
                  <select
                    id="edit-difficulty"
                    value={formData.difficulty}
                    onChange={(e) =>
                      setFormData({ ...formData, difficulty: e.target.value })
                    }
                    className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="easy">Dễ</option>
                    <option value="medium">Trung bình</option>
                    <option value="hard">Khó</option>
                  </select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-active" className="text-right">
                    Trạng thái
                  </Label>
                  <select
                    id="edit-active"
                    value={formData.active ? "true" : "false"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        active: e.target.value === "true",
                      })
                    }
                    className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="true">Hoạt động</option>
                    <option value="false">Không hoạt động</option>
                  </select>
                </div>
              </div>

              {/* Nội dung tương tự như trong dialog thêm mới */}
              <TabsContent value="word-guess">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Danh sách từ</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddWord}
                    >
                      Thêm từ
                    </Button>
                  </div>

                  {formData.words.map((word, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={word}
                        onChange={(e) =>
                          handleWordChange(index, e.target.value)
                        }
                        placeholder={`Từ ${index + 1}`}
                        className="flex-1"
                      />
                      {formData.words.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveWord(index)}
                        >
                          <Minus size={16} />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="sentence-scramble">
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Danh sách câu</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddSentence}
                    >
                      Thêm câu
                    </Button>
                  </div>

                  {formData.sentences.map((sentence, index) => (
                    <div key={index} className="border p-4 rounded-md">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">Câu {index + 1}</h4>
                        {formData.sentences.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveSentence(index)}
                          >
                            <Minus size={16} />
                          </Button>
                        )}
                      </div>
                      <div className="grid gap-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label
                            htmlFor={`edit-sentence-${index}`}
                            className="text-right"
                          >
                            Câu gốc
                          </Label>
                          <Input
                            id={`edit-sentence-${index}`}
                            value={sentence.original}
                            onChange={(e) =>
                              handleSentenceChange(
                                index,
                                "original",
                                e.target.value
                              )
                            }
                            className="col-span-3"
                            placeholder="Nhập câu hoàn chỉnh"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-start gap-4">
                          <Label className="text-right pt-2">Từ đã tách</Label>
                          <div className="col-span-3 flex flex-wrap gap-2">
                            {sentence.scrambled.map((word, wordIndex) => (
                              <Badge key={wordIndex} variant="secondary">
                                {word}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="word-association">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Cặp từ liên kết</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddWordPair}
                    >
                      Thêm cặp từ
                    </Button>
                  </div>

                  {formData.wordPairs.map((pair, index) => (
                    <div key={index} className="border p-4 rounded-md">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">Cặp từ {index + 1}</h4>
                        {formData.wordPairs.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveWordPair(index)}
                          >
                            <Minus size={16} />
                          </Button>
                        )}
                      </div>
                      <div className="grid gap-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label
                            htmlFor={`edit-word-${index}`}
                            className="text-right"
                          >
                            Từ gợi ý
                          </Label>
                          <Input
                            id={`edit-word-${index}`}
                            value={pair.word}
                            onChange={(e) =>
                              handleWordPairChange(
                                index,
                                "word",
                                e.target.value
                              )
                            }
                            className="col-span-3"
                            placeholder="Từ gợi ý"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label
                            htmlFor={`edit-association-${index}`}
                            className="text-right"
                          >
                            Từ liên kết
                          </Label>
                          <Input
                            id={`edit-association-${index}`}
                            value={pair.association}
                            onChange={(e) =>
                              handleWordPairChange(
                                index,
                                "association",
                                e.target.value
                              )
                            }
                            className="col-span-3"
                            placeholder="Từ liên kết"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="idiom-challenge">
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Thành ngữ</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddIdiom}
                    >
                      Thêm thành ngữ
                    </Button>
                  </div>

                  {formData.idioms.map((idiom, index) => (
                    <div key={index} className="border p-4 rounded-md">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">Thành ngữ {index + 1}</h4>
                        {formData.idioms.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveIdiom(index)}
                          >
                            <Minus size={16} />
                          </Button>
                        )}
                      </div>
                      <div className="grid gap-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label
                            htmlFor={`edit-idiom-${index}`}
                            className="text-right"
                          >
                            Thành ngữ
                          </Label>
                          <Input
                            id={`edit-idiom-${index}`}
                            value={idiom.idiom}
                            onChange={(e) =>
                              handleIdiomChange(index, "idiom", e.target.value)
                            }
                            className="col-span-3"
                            placeholder="Nhập thành ngữ"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label
                            htmlFor={`edit-meaning-${index}`}
                            className="text-right"
                          >
                            Ý nghĩa
                          </Label>
                          <Input
                            id={`edit-meaning-${index}`}
                            value={idiom.meaning}
                            onChange={(e) =>
                              handleIdiomChange(
                                index,
                                "meaning",
                                e.target.value
                              )
                            }
                            className="col-span-3"
                            placeholder="Ý nghĩa của thành ngữ"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label
                            htmlFor={`edit-explanation-${index}`}
                            className="text-right"
                          >
                            Giải thích
                          </Label>
                          <Textarea
                            id={`edit-explanation-${index}`}
                            value={idiom.explanation}
                            onChange={(e) =>
                              handleIdiomChange(
                                index,
                                "explanation",
                                e.target.value
                              )
                            }
                            className="col-span-3"
                            placeholder="Giải thích chi tiết"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button
              onClick={handleEditGame}
              className="bg-game-primary hover:bg-game-primary/90"
            >
              Lưu thay đổi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa trò chơi "{currentGame?.title}"? Hành
              động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleDeleteGame}>
              Xóa trò chơi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <ImportGameDialog
        isOpen={isImportDialogOpen}
        setIsOpen={setIsImportDialogOpen}
        onImportSuccess={handleImportSuccess}
      />
    </div>
  );
}

// Fake data for development (will be replaced by API data)
const MOCK_GAMES = [
  {
    id: 1,
    type: "word-guess",
    title: "Đoán từ hàng ngày",
    description: "Đoán từ tiếng Anh trong 6 lần thử",
    difficulty: "medium",
    words: ["apple", "beach", "cloud", "dream", "earth"],
    active: true,
  },
  {
    id: 2,
    type: "sentence-scramble",
    title: "Xếp câu hàng ngày",
    description: "Sắp xếp các từ để tạo thành câu hoàn chỉnh",
    difficulty: "easy",
    sentences: [
      {
        original: "I go to school every day",
        scrambled: ["I", "go", "to", "school", "every", "day"],
      },
      {
        original: "She likes to read books",
        scrambled: ["She", "likes", "to", "read", "books"],
      },
    ],
    active: true,
  },
  {
    id: 3,
    type: "word-association",
    title: "Liên kết từ",
    description: "Tìm từ liên quan đến từ gợi ý",
    difficulty: "hard",
    wordPairs: [
      { word: "hot", association: "cold" },
      { word: "day", association: "night" },
      { word: "black", association: "white" },
    ],
    active: false,
  },
  {
    id: 4,
    type: "idiom-challenge",
    title: "Thử thách thành ngữ",
    description: "Đoán nghĩa của thành ngữ tiếng Anh",
    difficulty: "hard",
    idioms: [
      {
        idiom: "Break a leg",
        meaning: "Good luck",
        explanation:
          "Used to wish someone good luck, especially before a performance or presentation",
      },
      {
        idiom: "Piece of cake",
        meaning: "Very easy",
        explanation: "Something that is very easy to do",
      },
    ],
    active: true,
  },
];
