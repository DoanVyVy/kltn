"use client";

import { useState } from "react";
import UserList from "./user-list";
import UserDetails from "./user-details";
import { useToast } from "@/hooks/use-toast";
import { trpc } from "@/trpc/client";

export default function UserManagement() {
  const { toast } = useToast();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const handleUserSelected = (userId: string) => {
    setSelectedUserId(userId);
  };

  const handleUserUpdated = () => {
    toast({
      title: "Cập nhật thành công",
      description: "Thông tin người dùng đã được cập nhật",
    });
    // Làm mới dữ liệu sau khi cập nhật
    setSelectedUserId(null);
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Quản lý người dùng</h2>
        <p className="text-muted-foreground">
          Quản lý tất cả người dùng trong hệ thống
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-2/3">
          <UserList
            onSelectUser={handleUserSelected}
            selectedUserId={selectedUserId}
          />
        </div>

        <div className="lg:w-1/3">
          <UserDetails
            userId={selectedUserId}
            onUserUpdated={handleUserUpdated}
          />
        </div>
      </div>
    </div>
  );
}
