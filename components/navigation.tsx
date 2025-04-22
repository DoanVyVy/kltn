"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Crown,
  Home,
  LogOut,
  Menu,
  User,
  X,
  BookText,
  Brain,
  Calendar,
  Sparkles,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/use-auth";

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await logout();
      toast({
        title: "Đăng xuất thành công",
        description: "Hẹn gặp lại bạn!",
        duration: 3000,
      });
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Có lỗi xảy ra khi đăng xuất",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Lấy chữ cái đầu để hiển thị avatar
  const getInitials = () => {
    if (!user) return "A";
    if (user.name) return user.name.charAt(0).toUpperCase();
    if (user.email) return user.email.charAt(0).toUpperCase();
    return "U";
  };

  // Cập nhật các mục điều hướng để thêm trang Daily Games
  const navItems = [
    { href: "/dashboard", label: "Trang chủ", icon: Home },
    { href: "/vocabulary", label: "Từ vựng", icon: BookText },
    { href: "/grammar", label: "Ngữ pháp", icon: Brain },
    { href: "/daily-games", label: "Trò chơi hàng ngày", icon: Calendar },
    { href: "/achievements", label: "Thành tích", icon: Crown },
    { href: "/profile", label: "Hồ sơ", icon: User },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-gradient-to-r from-game-primary/90 to-game-secondary/90 backdrop-blur-md shadow-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            whileHover={{
              rotate: [0, -10, 10, 0],
              transition: { duration: 0.5 },
            }}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-game-primary shadow-md border-2 border-white">
              <span className="text-lg font-bold">LP</span>
            </div>
          </motion.div>
          <motion.span
            className="text-xl font-bold text-white"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            LinguaPlay
            <motion.span
              className="inline-block ml-1"
              animate={{
                rotate: [0, 10, -10, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
              }}
            >
              <Sparkles className="h-4 w-4 text-yellow-200" />
            </motion.span>
          </motion.span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          {navItems.map((item, index) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ y: -3 }}
              >
                <Link
                  href={item.href}
                  className={`relative flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors rounded-full ${
                    isActive
                      ? "text-white bg-white/20"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute inset-0 rounded-full bg-white/20"
                      transition={{ duration: 0.3 }}
                    />
                  )}
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              </motion.div>
            );
          })}
          <div className="ml-4 h-6 border-l border-white/20"></div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            whileHover={{ scale: 1.05 }}
          >
            <Avatar className="h-8 w-8 border-2 border-white">
              <AvatarFallback className="bg-white text-game-primary">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            whileHover={{ scale: 1.05 }}
          >
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-white hover:text-white hover:bg-white/10 rounded-full"
              onClick={handleLogout}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <LogOut className="h-4 w-4" />
                  <span>Đăng xuất</span>
                </>
              )}
            </Button>
          </motion.div>
        </nav>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden text-white rounded-full hover:bg-white/10"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="md:hidden border-t border-white/10 bg-gradient-to-b from-game-primary/95 to-game-secondary/95"
        >
          <nav className="container mx-auto py-3 px-4 flex flex-col space-y-1">
            {navItems.map((item, index) => {
              const isActive =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * index }}
                >
                  <Link
                    href={item.href}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "text-white/80 hover:bg-white/10 hover:text-white"
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                </motion.div>
              );
            })}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="border-t border-white/10 my-2 pt-2"
            >
              <Button
                variant="ghost"
                className="flex w-full items-center gap-2 px-4 py-3 text-white/80 hover:bg-white/10 hover:text-white rounded-xl"
                onClick={handleLogout}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <LogOut className="h-5 w-5" />
                )}
                <span>Đăng xuất</span>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-center gap-2 px-4 py-2 mt-2"
            >
              <Avatar className="h-8 w-8 border-2 border-white">
                <AvatarFallback className="bg-white text-game-primary">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="text-white">
                <p className="text-sm font-medium truncate">{user?.email}</p>
                <p className="text-xs text-white/70">
                  {user?.name || "Học viên"}
                </p>
              </div>
            </motion.div>
          </nav>
        </motion.div>
      )}
    </header>
  );
}
