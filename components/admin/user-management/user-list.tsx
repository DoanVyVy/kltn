"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, UserPlus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Pagination } from "@/components/pagination";
import { trpc } from "@/trpc/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import AdminDataTable, { ColumnDef } from "@/components/admin/AdminDataTable";

interface UserListProps {
  onSelectUser: (userId: string) => void;
  selectedUserId: string | null;
}

export default function UserList({
  onSelectUser,
  selectedUserId,
}: UserListProps) {
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string>("");
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    fullName: "",
    role: "user",
  });

  const itemsPerPage = 10;

  // Fetch users with pagination and filtering
  const {
    data: usersData,
    isLoading,
    refetch,
  } = trpc.user.getAllUsers.useQuery(
    {
      page: currentPage,
      limit: itemsPerPage,
      search: searchTerm !== "" ? searchTerm : undefined,
      role: roleFilter !== "all" ? roleFilter : undefined,
      status: statusFilter !== "all" ? statusFilter : undefined,
    },
    {
      refetchOnWindowFocus: false,
    }
  );

  const { mutate: createUser } = trpc.user.createUser.useMutation({
    onSuccess: () => {
      toast({
        title: "Thêm người dùng thành công",
        description: `Đã thêm người dùng ${formData.username} vào hệ thống`,
      });
      resetForm();
      setIsAddDialogOpen(false);
      refetch(); // Làm mới danh sách người dùng
    },
    onError: (error) => {
      toast({
        title: "Lỗi khi thêm người dùng",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const { mutate: deleteUser } = trpc.user.deleteUser.useMutation({
    onSuccess: () => {
      toast({
        title: "Xóa người dùng thành công",
        description: "Người dùng đã được xóa khỏi hệ thống",
      });
      setIsDeleteDialogOpen(false);
      if (selectedUserId === userToDelete) {
        onSelectUser("");
      }
      refetch(); // Làm mới danh sách người dùng
    },
    onError: (error) => {
      toast({
        title: "Lỗi khi xóa người dùng",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAddUser = () => {
    createUser({
      username: formData.username,
      email: formData.email,
      password: formData.password,
      fullName: formData.fullName,
      role: formData.role,
    });
  };

  const handleDeleteUser = () => {
    if (userToDelete) {
      deleteUser({ userId: userToDelete });
    }
  };

  const openDeleteDialog = (userId: string) => {
    setUserToDelete(userId);
    setIsDeleteDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      username: "",
      email: "",
      password: "",
      fullName: "",
      role: "user",
    });
  };

  // Định dạng ngày tháng
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const columns: ColumnDef[] = [
    {
      header: "Người dùng",
      cell: (row) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={row.avatarUrl || ""} alt={row.username} />
            <AvatarFallback className="bg-gray-100 text-gray-600">
              {row.username?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{row.fullName || row.username}</div>
            <div className="text-xs text-muted-foreground">@{row.username}</div>
          </div>
        </div>
      ),
    },
    {
      header: "Email",
      accessorKey: "email",
    },
    {
      header: "Vai trò",
      cell: (row) => (
        <Badge
          variant={
            row.role === "admin"
              ? "default"
              : row.role === "moderator"
              ? "secondary"
              : "outline"
          }
        >
          {row.role === "admin"
            ? "Quản trị viên"
            : row.role === "moderator"
            ? "Người kiểm duyệt"
            : "Người dùng"}
        </Badge>
      ),
    },
    {
      header: "Hoạt động cuối",
      cell: (row) => formatDate(row.lastActiveDate),
    },
  ];

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle>Danh sách người dùng</CardTitle>
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            className="flex items-center gap-2 bg-game-primary hover:bg-game-primary/90"
          >
            <UserPlus size={16} />
            Thêm người dùng
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm người dùng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-4">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Vai trò" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả vai trò</SelectItem>
                  <SelectItem value="user">Người dùng</SelectItem>
                  <SelectItem value="moderator">Người kiểm duyệt</SelectItem>
                  <SelectItem value="admin">Quản trị viên</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="active">Hoạt động</SelectItem>
                  <SelectItem value="inactive">Không hoạt động</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <AdminDataTable
            columns={columns}
            data={usersData?.items || []}
            isLoading={isLoading}
            onEdit={(user) => onSelectUser(user.userId)}
            onDelete={(user) => openDeleteDialog(user.userId)}
            keyField="userId"
            emptyMessage="Không có người dùng nào"
          />

          {usersData && (
            <Pagination
              currentPage={currentPage}
              totalPages={usersData.totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </CardContent>
      </Card>

      {/* Dialog thêm người dùng mới */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thêm người dùng mới</DialogTitle>
            <DialogDescription>
              Điền thông tin chi tiết cho người dùng mới
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">
                Tên đăng nhập
              </Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="fullName" className="text-right">
                Họ tên
              </Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                Mật khẩu
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Vai trò
              </Label>
              <Select
                value={formData.role}
                onValueChange={(value) =>
                  setFormData({ ...formData, role: value })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Chọn vai trò" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Người dùng</SelectItem>
                  <SelectItem value="moderator">Người kiểm duyệt</SelectItem>
                  <SelectItem value="admin">Quản trị viên</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Hủy
            </Button>
            <Button
              onClick={handleAddUser}
              className="bg-game-primary hover:bg-game-primary/90"
            >
              Thêm người dùng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog xác nhận xóa người dùng */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Xác nhận xóa người dùng</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa người dùng này? Hành động này không thể
              hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser}>
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
