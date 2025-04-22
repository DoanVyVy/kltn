"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen,
  GraduationCap,
  GamepadIcon,
  Users,
  LayoutDashboard,
} from "lucide-react";
import {
  VocabularyManagement,
  GrammarManagement,
  UserManagement,
} from "@/components/admin";
import AdminDashboard from "@/components/admin/admin-dashboard";
import CourseManagement from "@/components/admin/course-management/index";
import GameDataManagement from "@/components/admin/game-data-management";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-game-primary to-game-secondary bg-clip-text text-transparent">
          Quản lý hệ thống LinguaPlay
        </h1>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 gap-2">
          <TabsTrigger value="users" className="gap-2">
            <Users size={16} />
            <span className="hidden md:inline">Người dùng</span>
          </TabsTrigger>
          <TabsTrigger value="courses" className="gap-2">
            <GraduationCap size={16} />
            <span className="hidden md:inline">Khóa học</span>
          </TabsTrigger>
          <TabsTrigger value="vocabulary" className="gap-2">
            <BookOpen size={16} />
            <span className="hidden md:inline">Từ vựng</span>
          </TabsTrigger>
          <TabsTrigger value="grammar" className="gap-2">
            <BookOpen size={16} />
            <span className="hidden md:inline">Ngữ pháp</span>
          </TabsTrigger>
          <TabsTrigger value="games" className="gap-2">
            <GamepadIcon size={16} />
            <span className="hidden md:inline">Trò chơi</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <UserManagement />
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
      </Tabs>
    </div>
  );
}
