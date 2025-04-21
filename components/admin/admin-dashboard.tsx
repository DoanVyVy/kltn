"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
  });

  useEffect(() => {
    // Giả lập dữ liệu thống kê đơn giản
    setStats({
      totalUsers: 1250,
      activeUsers: 876,
    });
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Dashboard Overview</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="pt-4">
            <CardTitle className="text-sm font-medium">Tổng người dùng</CardTitle>
            <div className="text-2xl font-bold mt-2">{stats.totalUsers.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <CardTitle className="text-sm font-medium">Người dùng hoạt động</CardTitle>
            <div className="text-2xl font-bold mt-2">{stats.activeUsers.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
