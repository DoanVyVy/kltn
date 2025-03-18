"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, GraduationCap, GamepadIcon, Users, LayoutDashboard } from "lucide-react"
import CourseManagement from "@/components/admin/course-management"
import VocabularyManagement from "@/components/admin/vocabulary-management"
import GrammarManagement from "@/components/admin/grammar-management"
import GameDataManagement from "@/components/admin/game-data-management"
import UserManagement from "@/components/admin/user-management"
import AdminDashboard from "@/components/admin/admin-dashboard"

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("dashboard")

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-game-primary to-game-secondary bg-clip-text text-transparent">
          Quản lý hệ thống LinguaPlay
        </h1>
      </div>

      <Tabs defaultValue="dashboard" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-6 mb-8">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <LayoutDashboard size={16} />
            Tổng quan
          </TabsTrigger>
          <TabsTrigger value="courses" className="flex items-center gap-2">
            <BookOpen size={16} />
            Khóa học
          </TabsTrigger>
          <TabsTrigger value="vocabulary" className="flex items-center gap-2">
            <GraduationCap size={16} />
            Từ vựng
          </TabsTrigger>
          <TabsTrigger value="grammar" className="flex items-center gap-2">
            <BookOpen size={16} />
            Ngữ pháp
          </TabsTrigger>
          <TabsTrigger value="games" className="flex items-center gap-2">
            <GamepadIcon size={16} />
            Trò chơi
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users size={16} />
            Người dùng
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <AdminDashboard />
        </TabsContent>

        <TabsContent value="courses">
          <CourseManagement />
        </TabsContent>

        <TabsContent value="vocabulary">
          <VocabularyManagement />
        </TabsContent>

        <TabsContent value="grammar">
          <GrammarManagement />
        </TabsContent>

        <TabsContent value="games">
          <GameDataManagement />
        </TabsContent>

        <TabsContent value="users">
          <UserManagement />
        </TabsContent>
      </Tabs>
    </div>
  )
}

