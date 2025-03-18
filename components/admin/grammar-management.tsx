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
import { PlusCircle, Pencil, Trash2, Search, Minus } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Giả lập dữ liệu ngữ pháp
const MOCK_GRAMMAR = [
  {
    id: 1,
    title: "Present Simple",
    courseId: 1,
    courseName: "A1 - Tiếng Anh cơ bản",
    description:
      "Thì hiện tại đơn dùng để diễn tả thói quen, sự thật hiển nhiên hoặc hành động lặp đi lặp lại trong hiện tại.",
    structure: "S + V(s/es) + O",
    examples: [
      { english: "I go to school every day.", vietnamese: "Tôi đi học mỗi ngày." },
      { english: "She works in a bank.", vietnamese: "Cô ấy làm việc trong một ngân hàng." },
    ],
    notes: "Thêm 's' hoặc 'es' vào động từ khi chủ ngữ là ngôi thứ 3 số ít (he, she, it).",
  },
  {
    id: 2,
    title: "Past Simple",
    courseId: 1,
    courseName: "A1 - Tiếng Anh cơ bản",
    description: "Thì quá khứ đơn dùng để diễn tả hành động đã xảy ra và kết thúc trong quá khứ.",
    structure: "S + V(ed) + O",
    examples: [
      { english: "I visited my grandmother last week.", vietnamese: "Tôi đã thăm bà tôi tuần trước." },
      { english: "They played football yesterday.", vietnamese: "Họ đã chơi bóng đá hôm qua." },
    ],
    notes: "Động từ thường thêm 'ed', nhưng có nhiều động từ bất quy tắc.",
  },
  {
    id: 3,
    title: "Present Continuous",
    courseId: 2,
    courseName: "A2 - Tiếng Anh sơ cấp",
    description:
      "Thì hiện tại tiếp diễn dùng để diễn tả hành động đang diễn ra tại thời điểm nói hoặc gần với thời điểm nói.",
    structure: "S + am/is/are + V-ing + O",
    examples: [
      { english: "I am studying English now.", vietnamese: "Tôi đang học tiếng Anh bây giờ." },
      { english: "They are playing tennis at the moment.", vietnamese: "Họ đang chơi tennis lúc này." },
    ],
    notes: "Sử dụng 'am' với I, 'is' với he/she/it, và 'are' với you/we/they.",
  },
  {
    id: 4,
    title: "Present Perfect",
    courseId: 3,
    courseName: "B1 - Tiếng Anh trung cấp",
    description:
      "Thì hiện tại hoàn thành dùng để diễn tả hành động đã xảy ra trong quá khứ nhưng có liên quan đến hiện tại.",
    structure: "S + have/has + V3 + O",
    examples: [
      { english: "I have lived in Hanoi for 5 years.", vietnamese: "Tôi đã sống ở Hà Nội được 5 năm." },
      { english: "She has visited Paris twice.", vietnamese: "Cô ấy đã đến Paris hai lần." },
    ],
    notes: "Sử dụng 'has' với he/she/it và 'have' với I/you/we/they.",
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

export default function GrammarManagement() {
  const [grammar, setGrammar] = useState(MOCK_GRAMMAR)
  const [courses, setCourses] = useState(MOCK_COURSES)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentGrammar, setCurrentGrammar] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCourse, setSelectedCourse] = useState<string>("all")
  const [formData, setFormData] = useState({
    title: "",
    courseId: "",
    description: "",
    structure: "",
    examples: [{ english: "", vietnamese: "" }],
    notes: "",
  })

  // Lọc ngữ pháp dựa trên tìm kiếm và khóa học
  const filteredGrammar = grammar.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCourse = selectedCourse === "all" || item.courseId.toString() === selectedCourse
    return matchesSearch && matchesCourse
  })

  const handleAddExample = () => {
    setFormData({
      ...formData,
      examples: [...formData.examples, { english: "", vietnamese: "" }],
    })
  }

  const handleRemoveExample = (index: number) => {
    const newExamples = [...formData.examples]
    newExamples.splice(index, 1)
    setFormData({
      ...formData,
      examples: newExamples,
    })
  }

  const handleExampleChange = (index: number, field: string, value: string) => {
    const newExamples = [...formData.examples]
    newExamples[index] = {
      ...newExamples[index],
      [field]: value,
    }
    setFormData({
      ...formData,
      examples: newExamples,
    })
  }

  const handleAddGrammar = () => {
    const newGrammar = {
      id: grammar.length + 1,
      title: formData.title,
      courseId: Number.parseInt(formData.courseId),
      courseName:
        courses.find((c) => c.id === Number.parseInt(formData.courseId))?.level +
        " - " +
        courses.find((c) => c.id === Number.parseInt(formData.courseId))?.title,
      description: formData.description,
      structure: formData.structure,
      examples: formData.examples,
      notes: formData.notes,
    }
    setGrammar([...grammar, newGrammar])
    setIsAddDialogOpen(false)
    resetForm()
  }

  const handleEditGrammar = () => {
    const updatedGrammar = grammar.map((item) =>
      item.id === currentGrammar.id
        ? {
            ...item,
            title: formData.title,
            courseId: Number.parseInt(formData.courseId),
            courseName:
              courses.find((c) => c.id === Number.parseInt(formData.courseId))?.level +
              " - " +
              courses.find((c) => c.id === Number.parseInt(formData.courseId))?.title,
            description: formData.description,
            structure: formData.structure,
            examples: formData.examples,
            notes: formData.notes,
          }
        : item,
    )
    setGrammar(updatedGrammar)
    setIsEditDialogOpen(false)
  }

  const handleDeleteGrammar = () => {
    const updatedGrammar = grammar.filter((item) => item.id !== currentGrammar.id)
    setGrammar(updatedGrammar)
    setIsDeleteDialogOpen(false)
  }

  const openEditDialog = (item: any) => {
    setCurrentGrammar(item)
    setFormData({
      title: item.title,
      courseId: item.courseId.toString(),
      description: item.description,
      structure: item.structure,
      examples: item.examples,
      notes: item.notes,
    })
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (item: any) => {
    setCurrentGrammar(item)
    setIsDeleteDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      title: "",
      courseId: "",
      description: "",
      structure: "",
      examples: [{ english: "", vietnamese: "" }],
      notes: "",
    })
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Quản lý ngữ pháp</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 bg-game-primary hover:bg-game-primary/90">
              <PlusCircle size={16} />
              Thêm ngữ pháp mới
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Thêm ngữ pháp mới</DialogTitle>
              <DialogDescription>Điền thông tin chi tiết cho ngữ pháp mới</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Tiêu đề
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="col-span-3"
                  placeholder="Ví dụ: Present Simple"
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
                <Label htmlFor="description" className="text-right">
                  Mô tả
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="structure" className="text-right">
                  Cấu trúc
                </Label>
                <Input
                  id="structure"
                  value={formData.structure}
                  onChange={(e) => setFormData({ ...formData, structure: e.target.value })}
                  className="col-span-3"
                  placeholder="Ví dụ: S + V(s/es) + O"
                />
              </div>

              <div className="border-t pt-4 mt-2">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Ví dụ</h3>
                  <Button type="button" variant="outline" size="sm" onClick={handleAddExample}>
                    Thêm ví dụ
                  </Button>
                </div>

                {formData.examples.map((example, index) => (
                  <div key={index} className="border p-4 rounded-md mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium">Ví dụ {index + 1}</h4>
                      {formData.examples.length > 1 && (
                        <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveExample(index)}>
                          <Minus size={16} />
                        </Button>
                      )}
                    </div>
                    <div className="grid gap-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor={`english-${index}`} className="text-right">
                          Tiếng Anh
                        </Label>
                        <Input
                          id={`english-${index}`}
                          value={example.english}
                          onChange={(e) => handleExampleChange(index, "english", e.target.value)}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor={`vietnamese-${index}`} className="text-right">
                          Tiếng Việt
                        </Label>
                        <Input
                          id={`vietnamese-${index}`}
                          value={example.vietnamese}
                          onChange={(e) => handleExampleChange(index, "vietnamese", e.target.value)}
                          className="col-span-3"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="notes" className="text-right">
                  Ghi chú
                </Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Hủy
              </Button>
              <Button onClick={handleAddGrammar} className="bg-game-primary hover:bg-game-primary/90">
                Thêm ngữ pháp
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
                placeholder="Tìm kiếm ngữ pháp..."
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
                <TableHead>Tiêu đề</TableHead>
                <TableHead>Khóa học</TableHead>
                <TableHead>Mô tả</TableHead>
                <TableHead>Cấu trúc</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGrammar.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.title}</TableCell>
                  <TableCell>{item.courseName}</TableCell>
                  <TableCell className="max-w-xs truncate">{item.description}</TableCell>
                  <TableCell>{item.structure}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="icon" onClick={() => openEditDialog(item)}>
                        <Pencil size={16} />
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => openDeleteDialog(item)}>
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
            <DialogTitle>Chỉnh sửa ngữ pháp</DialogTitle>
            <DialogDescription>Cập nhật thông tin cho ngữ pháp</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-title" className="text-right">
                Tiêu đề
              </Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
              <Label htmlFor="edit-description" className="text-right">
                Mô tả
              </Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-structure" className="text-right">
                Cấu trúc
              </Label>
              <Input
                id="edit-structure"
                value={formData.structure}
                onChange={(e) => setFormData({ ...formData, structure: e.target.value })}
                className="col-span-3"
              />
            </div>

            <div className="border-t pt-4 mt-2">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Ví dụ</h3>
                <Button type="button" variant="outline" size="sm" onClick={handleAddExample}>
                  Thêm ví dụ
                </Button>
              </div>

              {formData.examples.map((example, index) => (
                <div key={index} className="border p-4 rounded-md mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">Ví dụ {index + 1}</h4>
                    {formData.examples.length > 1 && (
                      <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveExample(index)}>
                        <Minus size={16} />
                      </Button>
                    )}
                  </div>
                  <div className="grid gap-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor={`edit-english-${index}`} className="text-right">
                        Tiếng Anh
                      </Label>
                      <Input
                        id={`edit-english-${index}`}
                        value={example.english}
                        onChange={(e) => handleExampleChange(index, "english", e.target.value)}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor={`edit-vietnamese-${index}`} className="text-right">
                        Tiếng Việt
                      </Label>
                      <Input
                        id={`edit-vietnamese-${index}`}
                        value={example.vietnamese}
                        onChange={(e) => handleExampleChange(index, "vietnamese", e.target.value)}
                        className="col-span-3"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-notes" className="text-right">
                Ghi chú
              </Label>
              <Textarea
                id="edit-notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleEditGrammar} className="bg-game-primary hover:bg-game-primary/90">
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
              Bạn có chắc chắn muốn xóa ngữ pháp "{currentGrammar?.title}"? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleDeleteGrammar}>
              Xóa ngữ pháp
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

