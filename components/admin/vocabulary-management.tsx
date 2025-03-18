"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { PlusCircle, Pencil, Trash2, Search, X, Volume2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

// Giả lập dữ liệu từ vựng
const MOCK_VOCABULARY = [
  {
    id: 1,
    word: "facilitate",
    courseId: 1,
    courseName: "A1 - Tiếng Anh cơ bản",
    learned: false,
    phonetic: "/fəˈsɪlɪteɪt/",
    audioUrl: "https://audio.oxforddictionaries.com/en/mp3/facilitate_gb_1.mp3",
    definitions: [
      {
        type: "verb",
        definition: "make (an action or process) easy or easier",
        example: "The new system should facilitate the sharing of information",
        translation: "Hệ thống mới sẽ tạo điều kiện thuận lợi cho việc chia sẻ thông tin",
      },
    ],
  },
  {
    id: 2,
    word: "ambiguous",
    courseId: 2,
    courseName: "A2 - Tiếng Anh sơ cấp",
    learned: true,
    phonetic: "/æmˈbɪɡjuəs/",
    audioUrl: "https://audio.oxforddictionaries.com/en/mp3/ambiguous_gb_1.mp3",
    definitions: [
      {
        type: "adjective",
        definition: "open to more than one interpretation; not having one obvious meaning",
        example: "The question was rather ambiguous",
        translation: "Câu hỏi này khá mơ hồ",
      },
    ],
  },
  {
    id: 3,
    word: "meticulous",
    courseId: 2,
    courseName: "A2 - Tiếng Anh sơ cấp",
    learned: false,
    phonetic: "/məˈtɪkjʊləs/",
    audioUrl: "https://audio.oxforddictionaries.com/en/mp3/meticulous_gb_1.mp3",
    definitions: [
      {
        type: "adjective",
        definition: "showing great attention to detail; very careful and precise",
        example: "He was meticulous about keeping records",
        translation: "Anh ấy rất tỉ mỉ trong việc lưu trữ hồ sơ",
      },
    ],
  },
  {
    id: 4,
    word: "perseverance",
    courseId: 3,
    courseName: "B1 - Tiếng Anh trung cấp",
    learned: false,
    phonetic: "/ˌpɜːsɪˈvɪərəns/",
    audioUrl: "https://audio.oxforddictionaries.com/en/mp3/perseverance_gb_1.mp3",
    definitions: [
      {
        type: "noun",
        definition: "persistence in doing something despite difficulty or delay in achieving success",
        example: "Her perseverance was rewarded",
        translation: "Sự kiên trì của cô ấy đã được đền đáp",
      },
    ],
  },
]

// Giả lập dữ liệu khóa học
const MOCK_COURSES = [
  {
    id: 1,
    level: "A1",
    title: "Tiếng Anh cơ bản",
    description: "Khóa học dành cho người mới bắt đầu",
    wordCount: 120,
    grammarCount: 15,
    status: "active",
  },
  {
    id: 2,
    level: "A2",
    title: "Tiếng Anh sơ cấp",
    description: "Khóa học dành cho người đã có kiến thức cơ bản",
    wordCount: 180,
    grammarCount: 22,
    status: "active",
  },
  {
    id: 3,
    level: "B1",
    title: "Tiếng Anh trung cấp",
    description: "Khóa học dành cho người đã có nền tảng",
    wordCount: 250,
    grammarCount: 30,
    status: "draft",
  },
  {
    id: 4,
    level: "B2",
    title: "Tiếng Anh cao cấp",
    description: "Khóa học nâng cao",
    wordCount: 320,
    grammarCount: 35,
    status: "draft",
  },
]

export default function VocabularyManagement() {
  const [vocabulary, setVocabulary] = useState(MOCK_VOCABULARY)
  const [courses, setCourses] = useState(MOCK_COURSES)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentWord, setCurrentWord] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCourse, setSelectedCourse] = useState<string>("all")
  const [formData, setFormData] = useState({
    word: "",
    courseId: "",
    learned: false,
    phonetic: "",
    audioUrl: "",
    definitions: [
      {
        type: "noun",
        definition: "",
        example: "",
        translation: "",
      },
    ],
  })

  // Lọc từ vựng dựa trên tìm kiếm và khóa học
  const filteredVocabulary = vocabulary.filter((word) => {
    const matchesSearch = word.word.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCourse = selectedCourse === "all" || word.courseId.toString() === selectedCourse
    return matchesSearch && matchesCourse
  })

  const handleAddDefinition = () => {
    setFormData({
      ...formData,
      definitions: [
        ...formData.definitions,
        {
          type: "noun",
          definition: "",
          example: "",
          translation: "",
        },
      ],
    })
  }

  const handleRemoveDefinition = (index: number) => {
    const newDefinitions = [...formData.definitions]
    newDefinitions.splice(index, 1)
    setFormData({
      ...formData,
      definitions: newDefinitions,
    })
  }

  const handleDefinitionChange = (index: number, field: string, value: string) => {
    const newDefinitions = [...formData.definitions]
    newDefinitions[index] = {
      ...newDefinitions[index],
      [field]: value,
    }
    setFormData({
      ...formData,
      definitions: newDefinitions,
    })
  }

  const handleAddWord = () => {
    const newWord = {
      id: vocabulary.length + 1,
      word: formData.word,
      courseId: Number.parseInt(formData.courseId),
      courseName:
        courses.find((c) => c.id === Number.parseInt(formData.courseId))?.level +
        " - " +
        courses.find((c) => c.id === Number.parseInt(formData.courseId))?.title,
      learned: formData.learned,
      phonetic: formData.phonetic,
      audioUrl: formData.audioUrl,
      definitions: formData.definitions,
    }
    setVocabulary([...vocabulary, newWord])
    setIsAddDialogOpen(false)
    resetForm()
  }

  const handleEditWord = () => {
    const updatedVocabulary = vocabulary.map((word) =>
      word.id === currentWord.id
        ? {
            ...word,
            word: formData.word,
            courseId: Number.parseInt(formData.courseId),
            courseName:
              courses.find((c) => c.id === Number.parseInt(formData.courseId))?.level +
              " - " +
              courses.find((c) => c.id === Number.parseInt(formData.courseId))?.title,
            learned: formData.learned,
            phonetic: formData.phonetic,
            audioUrl: formData.audioUrl,
            definitions: formData.definitions,
          }
        : word,
    )
    setVocabulary(updatedVocabulary)
    setIsEditDialogOpen(false)
  }

  const handleDeleteWord = () => {
    const updatedVocabulary = vocabulary.filter((word) => word.id !== currentWord.id)
    setVocabulary(updatedVocabulary)
    setIsDeleteDialogOpen(false)
  }

  const openEditDialog = (word: any) => {
    setCurrentWord(word)
    setFormData({
      word: word.word,
      courseId: word.courseId.toString(),
      learned: word.learned,
      phonetic: word.phonetic,
      audioUrl: word.audioUrl,
      definitions: word.definitions,
    })
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (word: any) => {
    setCurrentWord(word)
    setIsDeleteDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      word: "",
      courseId: "",
      learned: false,
      phonetic: "",
      audioUrl: "",
      definitions: [
        {
          type: "noun",
          definition: "",
          example: "",
          translation: "",
        },
      ],
    })
  }

  const playAudio = (url: string) => {
    if (url) {
      const audio = new Audio(url)
      audio.play()
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Quản lý từ vựng</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 bg-game-primary hover:bg-game-primary/90">
              <PlusCircle size={16} />
              Thêm từ vựng mới
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Thêm từ vựng mới</DialogTitle>
              <DialogDescription>Điền thông tin chi tiết cho từ vựng mới</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="word" className="text-right">
                  Từ vựng
                </Label>
                <Input
                  id="word"
                  value={formData.word}
                  onChange={(e) => setFormData({ ...formData, word: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="course" className="text-right">
                  Khóa học
                </Label>
                <select
                  id="course"
                  value={formData.courseId}
                  onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                  className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Chọn khóa học</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.level} - {course.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phonetic" className="text-right">
                  Phiên âm
                </Label>
                <Input
                  id="phonetic"
                  value={formData.phonetic}
                  onChange={(e) => setFormData({ ...formData, phonetic: e.target.value })}
                  className="col-span-3"
                  placeholder="/ˈfəʊnɛtɪk/"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="audioUrl" className="text-right">
                  URL âm thanh
                </Label>
                <Input
                  id="audioUrl"
                  value={formData.audioUrl}
                  onChange={(e) => setFormData({ ...formData, audioUrl: e.target.value })}
                  className="col-span-3"
                  placeholder="https://example.com/audio.mp3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Đã học</Label>
                <div className="col-span-3">
                  <Checkbox
                    checked={formData.learned}
                    onCheckedChange={(checked) => setFormData({ ...formData, learned: checked as boolean })}
                  />
                </div>
              </div>

              <div className="border-t pt-4 mt-2">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Định nghĩa</h3>
                  <Button type="button" variant="outline" size="sm" onClick={handleAddDefinition}>
                    Thêm định nghĩa
                  </Button>
                </div>

                {formData.definitions.map((definition, index) => (
                  <div key={index} className="border p-4 rounded-md mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium">Định nghĩa {index + 1}</h4>
                      {formData.definitions.length > 1 && (
                        <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveDefinition(index)}>
                          <X size={16} />
                        </Button>
                      )}
                    </div>
                    <div className="grid gap-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor={`type-${index}`} className="text-right">
                          Loại từ
                        </Label>
                        <select
                          id={`type-${index}`}
                          value={definition.type}
                          onChange={(e) => handleDefinitionChange(index, "type", e.target.value)}
                          className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="noun">Danh từ</option>
                          <option value="verb">Động từ</option>
                          <option value="adjective">Tính từ</option>
                          <option value="adverb">Trạng từ</option>
                          <option value="preposition">Giới từ</option>
                          <option value="conjunction">Liên từ</option>
                          <option value="pronoun">Đại từ</option>
                          <option value="interjection">Thán từ</option>
                        </select>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor={`definition-${index}`} className="text-right">
                          Định nghĩa
                        </Label>
                        <Textarea
                          id={`definition-${index}`}
                          value={definition.definition}
                          onChange={(e) => handleDefinitionChange(index, "definition", e.target.value)}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor={`example-${index}`} className="text-right">
                          Ví dụ
                        </Label>
                        <Textarea
                          id={`example-${index}`}
                          value={definition.example}
                          onChange={(e) => handleDefinitionChange(index, "example", e.target.value)}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor={`translation-${index}`} className="text-right">
                          Dịch nghĩa
                        </Label>
                        <Textarea
                          id={`translation-${index}`}
                          value={definition.translation}
                          onChange={(e) => handleDefinitionChange(index, "translation", e.target.value)}
                          className="col-span-3"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Hủy
              </Button>
              <Button onClick={handleAddWord} className="bg-game-primary hover:bg-game-primary/90">
                Thêm từ vựng
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm từ vựng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Chọn khóa học" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả khóa học</SelectItem>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id.toString()}>
                    {course.level} - {course.title}
                  </SelectItem>
                ))}
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
                <TableHead>Từ vựng</TableHead>
                <TableHead>Phiên âm</TableHead>
                <TableHead>Khóa học</TableHead>
                <TableHead>Định nghĩa</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVocabulary.map((word) => (
                <TableRow key={word.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {word.word}
                      {word.audioUrl && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => playAudio(word.audioUrl)}
                        >
                          <Volume2 size={14} />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{word.phonetic}</TableCell>
                  <TableCell>{word.courseName}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {word.definitions[0].definition}
                    {word.definitions.length > 1 && ` (+${word.definitions.length - 1} định nghĩa khác)`}
                  </TableCell>
                  <TableCell>
                    <Badge variant={word.learned ? "default" : "secondary"}>
                      {word.learned ? "Đã học" : "Chưa học"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="icon" onClick={() => openEditDialog(word)}>
                        <Pencil size={16} />
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => openDeleteDialog(word)}>
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa từ vựng</DialogTitle>
            <DialogDescription>Cập nhật thông tin cho từ vựng</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-word" className="text-right">
                Từ vựng
              </Label>
              <Input
                id="edit-word"
                value={formData.word}
                onChange={(e) => setFormData({ ...formData, word: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-course" className="text-right">
                Khóa học
              </Label>
              <select
                id="edit-course"
                value={formData.courseId}
                onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.level} - {course.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-phonetic" className="text-right">
                Phiên âm
              </Label>
              <Input
                id="edit-phonetic"
                value={formData.phonetic}
                onChange={(e) => setFormData({ ...formData, phonetic: e.target.value })}
                className="col-span-3"
                placeholder="/ˈfəʊnɛtɪk/"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-audioUrl" className="text-right">
                URL âm thanh
              </Label>
              <Input
                id="edit-audioUrl"
                value={formData.audioUrl}
                onChange={(e) => setFormData({ ...formData, audioUrl: e.target.value })}
                className="col-span-3"
                placeholder="https://example.com/audio.mp3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Đã học</Label>
              <div className="col-span-3">
                <Checkbox
                  checked={formData.learned}
                  onCheckedChange={(checked) => setFormData({ ...formData, learned: checked as boolean })}
                />
              </div>
            </div>

            <div className="border-t pt-4 mt-2">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Định nghĩa</h3>
                <Button type="button" variant="outline" size="sm" onClick={handleAddDefinition}>
                  Thêm định nghĩa
                </Button>
              </div>

              {formData.definitions.map((definition, index) => (
                <div key={index} className="border p-4 rounded-md mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">Định nghĩa {index + 1}</h4>
                    {formData.definitions.length > 1 && (
                      <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveDefinition(index)}>
                        <X size={16} />
                      </Button>
                    )}
                  </div>
                  <div className="grid gap-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor={`edit-type-${index}`} className="text-right">
                        Loại từ
                      </Label>
                      <select
                        id={`edit-type-${index}`}
                        value={definition.type}
                        onChange={(e) => handleDefinitionChange(index, "type", e.target.value)}
                        className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="noun">Danh từ</option>
                        <option value="verb">Động từ</option>
                        <option value="adjective">Tính từ</option>
                        <option value="adverb">Trạng từ</option>
                        <option value="preposition">Giới từ</option>
                        <option value="conjunction">Liên từ</option>
                        <option value="pronoun">Đại từ</option>
                        <option value="interjection">Thán từ</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor={`edit-definition-${index}`} className="text-right">
                        Định nghĩa
                      </Label>
                      <Textarea
                        id={`edit-definition-${index}`}
                        value={definition.definition}
                        onChange={(e) => handleDefinitionChange(index, "definition", e.target.value)}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor={`edit-example-${index}`} className="text-right">
                        Ví dụ
                      </Label>
                      <Textarea
                        id={`edit-example-${index}`}
                        value={definition.example}
                        onChange={(e) => handleDefinitionChange(index, "example", e.target.value)}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor={`edit-translation-${index}`} className="text-right">
                        Dịch nghĩa
                      </Label>
                      <Textarea
                        id={`edit-translation-${index}`}
                        value={definition.translation}
                        onChange={(e) => handleDefinitionChange(index, "translation", e.target.value)}
                        className="col-span-3"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleEditWord} className="bg-game-primary hover:bg-game-primary/90">
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
              Bạn có chắc chắn muốn xóa từ vựng "{currentWord?.word}"? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleDeleteWord}>
              Xóa từ vựng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

