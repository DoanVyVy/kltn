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
import { PlusCircle, Pencil, Trash2, Search } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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
  {
    id: 5,
    level: "C1",
    title: "Tiếng Anh thành thạo",
    description: "Khóa học dành cho người muốn đạt trình độ gần như người bản xứ",
    wordCount: 400,
    grammarCount: 40,
    status: "draft",
  },
  {
    id: 6,
    level: "C2",
    title: "Tiếng Anh chuyên sâu",
    description: "Khóa học dành cho người muốn đạt trình độ như người bản xứ",
    wordCount: 450,
    grammarCount: 45,
    status: "draft",
  },
]

export default function CourseManagement() {
  const [courses, setCourses] = useState(MOCK_COURSES)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentCourse, setCurrentCourse] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [formData, setFormData] = useState({
    level: "",
    title: "",
    description: "",
    status: "draft",
  })

  // Lọc khóa học dựa trên tìm kiếm và trạng thái
  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.level.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || course.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleAddCourse = () => {
    const newCourse = {
      id: courses.length + 1,
      ...formData,
      wordCount: 0,
      grammarCount: 0,
    }
    setCourses([...courses, newCourse])
    setIsAddDialogOpen(false)
    setFormData({ level: "", title: "", description: "", status: "draft" })
  }

  const handleEditCourse = () => {
    const updatedCourses = courses.map((course) =>
      course.id === currentCourse.id ? { ...course, ...formData } : course,
    )
    setCourses(updatedCourses)
    setIsEditDialogOpen(false)
  }

  const handleDeleteCourse = () => {
    const updatedCourses = courses.filter((course) => course.id !== currentCourse.id)
    setCourses(updatedCourses)
    setIsDeleteDialogOpen(false)
  }

  const openEditDialog = (course: any) => {
    setCurrentCourse(course)
    setFormData({
      level: course.level,
      title: course.title,
      description: course.description,
      status: course.status,
    })
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (course: any) => {
    setCurrentCourse(course)
    setIsDeleteDialogOpen(true)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Quản lý khóa học</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 bg-game-primary hover:bg-game-primary/90">
              <PlusCircle size={16} />
              Thêm khóa học mới
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Thêm khóa học mới</DialogTitle>
              <DialogDescription>Điền thông tin chi tiết cho khóa học mới</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="level" className="text-right">
                  Cấp độ
                </Label>
                <Input
                  id="level"
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  className="col-span-3"
                  placeholder="A1, A2, B1, B2, C1, C2"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Tiêu đề
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="col-span-3"
                />
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
                <Label htmlFor="status" className="text-right">
                  Trạng thái
                </Label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="draft">Bản nháp</option>
                  <option value="active">Hoạt động</option>
                  <option value="archived">Lưu trữ</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Hủy
              </Button>
              <Button onClick={handleAddCourse} className="bg-game-primary hover:bg-game-primary/90">
                Thêm khóa học
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
                placeholder="Tìm kiếm khóa học..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="active">Hoạt động</SelectItem>
                <SelectItem value="draft">Bản nháp</SelectItem>
                <SelectItem value="archived">Lưu trữ</SelectItem>
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
                <TableHead>Cấp độ</TableHead>
                <TableHead>Tiêu đề</TableHead>
                <TableHead>Mô tả</TableHead>
                <TableHead>Số từ vựng</TableHead>
                <TableHead>Số điểm ngữ pháp</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCourses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell className="font-medium">{course.level}</TableCell>
                  <TableCell>{course.title}</TableCell>
                  <TableCell className="max-w-xs truncate">{course.description}</TableCell>
                  <TableCell>{course.wordCount}</TableCell>
                  <TableCell>{course.grammarCount}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        course.status === "active" ? "default" : course.status === "draft" ? "secondary" : "outline"
                      }
                    >
                      {course.status === "active" ? "Hoạt động" : course.status === "draft" ? "Bản nháp" : "Lưu trữ"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="icon" onClick={() => openEditDialog(course)}>
                        <Pencil size={16} />
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => openDeleteDialog(course)}>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa khóa học</DialogTitle>
            <DialogDescription>Cập nhật thông tin cho khóa học</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-level" className="text-right">
                Cấp độ
              </Label>
              <Input
                id="edit-level"
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                className="col-span-3"
              />
            </div>
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
              <Label htmlFor="edit-status" className="text-right">
                Trạng thái
              </Label>
              <select
                id="edit-status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="draft">Bản nháp</option>
                <option value="active">Hoạt động</option>
                <option value="archived">Lưu trữ</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleEditCourse} className="bg-game-primary hover:bg-game-primary/90">
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
              Bạn có chắc chắn muốn xóa khóa học "{currentCourse?.title}"? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleDeleteCourse}>
              Xóa khóa học
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

