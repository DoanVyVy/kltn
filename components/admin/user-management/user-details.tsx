"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/trpc/client";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Lock, Save } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface UserDetailsProps {
  userId: string | null;
  onUserUpdated: () => void;
}

export default function UserDetails({
  userId,
  onUserUpdated,
}: UserDetailsProps) {
  const { toast } = useToast();
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] =
    useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    fullName: "",
    role: "user",
  });

  // Lấy thông tin chi tiết người dùng
  const { data: userData, isLoading } = trpc.user.getUserById.useQuery(
    { userId: userId || "" },
    {
      enabled: !!userId,
      refetchOnWindowFocus: false,
    }
  );

  // Lấy dữ liệu thống kê học tập của người dùng
  const { data: userStats } = trpc.user.getUserLearningStats.useQuery(
    { userId: userId || "" },
    {
      enabled: !!userId,
      refetchOnWindowFocus: false,
    }
  );

  // Mutation để cập nhật thông tin người dùng
  const { mutate: updateUser } = trpc.user.updateUser.useMutation({
    onSuccess: () => {
      toast({
        title: "Cập nhật thành công",
        description: "Thông tin người dùng đã được cập nhật",
      });
      onUserUpdated();
    },
    onError: (error) => {
      toast({
        title: "Lỗi khi cập nhật thông tin",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation để reset mật khẩu
  const { mutate: resetPassword } = trpc.user.resetPassword.useMutation({
    onSuccess: () => {
      toast({
        title: "Đặt lại mật khẩu thành công",
        description: "Mật khẩu của người dùng đã được đặt lại",
      });
      setIsResetPasswordDialogOpen(false);
      setNewPassword("");
    },
    onError: (error) => {
      toast({
        title: "Lỗi khi đặt lại mật khẩu",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Cập nhật form khi userData thay đổi
  useEffect(() => {
    if (userData) {
      setFormData({
        username: userData.username || "",
        email: userData.email || "",
        fullName: userData.fullName || "",
        // Do trường role đã được thêm vào trong response từ API
        role: (userData as any).role || "user", // Sử dụng type assertion
      });
    }
  }, [userData]);

  const handleSaveChanges = () => {
    if (!userId) return;

    updateUser({
      userId,
      username: formData.username,
      email: formData.email,
      fullName: formData.fullName,
      role: formData.role,
    });
  };

  const handleResetPassword = () => {
    if (!userId || !newPassword) return;

    resetPassword({
      userId,
      newPassword,
    });
  };

  if (!userId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Chi tiết người dùng</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-10 text-muted-foreground">
          Chọn một người dùng từ danh sách để xem thông tin chi tiết
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Chi tiết người dùng</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-10">Đang tải...</CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Thông tin người dùng</CardTitle>
        </CardHeader>
        <CardContent>
          {userData ? (
            <div className="space-y-6">
              <div className="flex flex-col items-center space-y-2">
                <Avatar className="h-20 w-20">
                  <AvatarImage
                    src={userData.avatarUrl || "/placeholder-user.jpg"}
                  />
                  <AvatarFallback className="text-2xl">
                    {userData.fullName
                      ? userData.fullName.charAt(0)
                      : userData.username.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <h3 className="text-lg font-medium">
                    {userData.fullName || userData.username}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    @{userData.username}
                  </p>
                </div>
              </div>

              {userStats && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="border rounded-lg p-3 text-center">
                    <p className="text-xl font-bold text-game-primary">
                      {userStats.vocabularyCount || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Từ vựng đã học
                    </p>
                  </div>
                  <div className="border rounded-lg p-3 text-center">
                    <p className="text-xl font-bold text-game-secondary">
                      {userStats.grammarCount || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Ngữ pháp đã học
                    </p>
                  </div>
                  <div className="border rounded-lg p-3 text-center">
                    <p className="text-xl font-bold text-game-accent">
                      {userStats.gamesPlayed || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Trò chơi đã chơi
                    </p>
                  </div>
                  <div className="border rounded-lg p-3 text-center">
                    <p className="text-xl font-bold">
                      {userData.streakDays || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Chuỗi ngày học
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Tên đăng nhập</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fullName">Họ tên</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Vai trò</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) =>
                      setFormData({ ...formData, role: value })
                    }
                  >
                    <SelectTrigger id="role">
                      <SelectValue placeholder="Chọn vai trò" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">Người dùng</SelectItem>
                      <SelectItem value="moderator">
                        Người kiểm duyệt
                      </SelectItem>
                      <SelectItem value="admin">Quản trị viên</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="pt-4 space-y-2">
                  <Button
                    onClick={handleSaveChanges}
                    className="w-full bg-game-primary hover:bg-game-primary/90"
                  >
                    <Save className="mr-2 h-4 w-4" /> Lưu thay đổi
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => setIsResetPasswordDialogOpen(true)}
                    className="w-full"
                  >
                    <Lock className="mr-2 h-4 w-4" /> Đặt lại mật khẩu
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              Không tìm thấy thông tin người dùng
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog đặt lại mật khẩu */}
      <Dialog
        open={isResetPasswordDialogOpen}
        onOpenChange={setIsResetPasswordDialogOpen}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Đặt lại mật khẩu</DialogTitle>
            <DialogDescription>
              Nhập mật khẩu mới cho người dùng này.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">Mật khẩu mới</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsResetPasswordDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button
              onClick={handleResetPassword}
              className="bg-game-primary hover:bg-game-primary/90"
            >
              Đặt lại mật khẩu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
