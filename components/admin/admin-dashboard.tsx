"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, LineChart, PieChart } from "@/components/admin/charts"
import { Users, BookOpen, TrendingUp, Activity } from "lucide-react"

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalCourses: 0,
    totalVocabulary: 0,
    totalGrammar: 0,
    totalGames: 0,
    completionRate: 0,
    userGrowth: 0,
  })

  useEffect(() => {
    // Giả lập dữ liệu thống kê
    setStats({
      totalUsers: 1250,
      activeUsers: 876,
      totalCourses: 6,
      totalVocabulary: 3200,
      totalGrammar: 145,
      totalGames: 24,
      completionRate: 68,
      userGrowth: 12.5,
    })
  }, [])

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng người dùng</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500 font-medium">+{stats.userGrowth}%</span> so với tháng trước
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Người dùng hoạt động</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((stats.activeUsers / stats.totalUsers) * 100)}% tổng người dùng
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng từ vựng</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalVocabulary.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Trung bình {Math.round(stats.totalVocabulary / stats.totalCourses)} từ/khóa học
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tỷ lệ hoàn thành</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completionRate}%</div>
            <p className="text-xs text-muted-foreground">Tỷ lệ hoàn thành khóa học</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Hoạt động người dùng</CardTitle>
            <CardDescription>Số lượng người dùng hoạt động theo ngày trong 30 ngày qua</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <LineChart />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Phân bố người dùng</CardTitle>
            <CardDescription>Phân bố người dùng theo cấp độ khóa học</CardDescription>
          </CardHeader>
          <CardContent>
            <PieChart />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="daily">
        <div className="flex justify-between items-center">
          <CardTitle>Thống kê chi tiết</CardTitle>
          <TabsList>
            <TabsTrigger value="daily">Hàng ngày</TabsTrigger>
            <TabsTrigger value="weekly">Hàng tuần</TabsTrigger>
            <TabsTrigger value="monthly">Hàng tháng</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="daily" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Hoạt động học tập</CardTitle>
              <CardDescription>Số lượng bài học hoàn thành theo loại</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <BarChart />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="weekly" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Hoạt động học tập</CardTitle>
              <CardDescription>Số lượng bài học hoàn thành theo loại (tuần)</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <BarChart />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="monthly" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Hoạt động học tập</CardTitle>
              <CardDescription>Số lượng bài học hoàn thành theo loại (tháng)</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <BarChart />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

