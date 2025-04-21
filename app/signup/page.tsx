"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import LottieAnimation from "@/components/lottie-animation";

// Dữ liệu animation tối thiểu - có thể thay đổi theo ý muốn
const registerAnimationData = {
  v: "5.7.1",
  fr: 30,
  ip: 0,
  op: 90,
  w: 500,
  h: 500,
  nm: "Register Animation",
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: "Circle",
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [250, 250, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] },
      },
      ao: 0,
      shapes: [
        {
          ty: "gr",
          it: [
            {
              d: 1,
              ty: "el",
              s: { a: 0, k: [100, 100] },
              p: { a: 0, k: [0, 0] },
              nm: "Ellipse Path 1",
            },
            {
              ty: "fl",
              c: { a: 0, k: [0.388, 0.388, 0.976, 1] },
              o: { a: 0, k: 100 },
              r: 1,
              nm: "Fill 1",
            },
          ],
          nm: "Ellipse 1",
        },
      ],
    },
  ],
};

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Kiểm tra các trường bắt buộc
    if (!email || !password || !username || !confirmPassword) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin bắt buộc",
        duration: 5000,
      });
      setIsLoading(false);
      return;
    }

    // Kiểm tra độ dài username
    if (username.length < 3) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Tên đăng nhập phải có ít nhất 3 ký tự",
        duration: 5000,
      });
      setIsLoading(false);
      return;
    }

    // Kiểm tra mật khẩu xác nhận
    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Mật khẩu xác nhận không khớp",
        duration: 5000,
      });
      setIsLoading(false);
      return;
    }

    // Kiểm tra độ dài mật khẩu
    if (password.length < 6) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Mật khẩu phải có ít nhất 6 ký tự",
        duration: 5000,
      });
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          username,
          fullName: fullName || null,
        }),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          variant: "destructive",
          title: "Đăng ký thất bại",
          description: data.error || "Có lỗi xảy ra khi đăng ký",
          duration: 5000,
        });
        setIsLoading(false);
        return;
      }

      toast({
        title: "Đăng ký thành công",
        description: data.message || "Chào mừng bạn đến với LinguaPlay!",
        duration: 5000,
      });

      // Chuyển hướng đến trang đăng nhập với thông tin đăng nhập
      setTimeout(() => {
        router.push(
          `/login?email=${encodeURIComponent(
            email
          )}&password=${encodeURIComponent(password)}`
        );
        router.refresh();
      }, 2000);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Lỗi hệ thống",
        description: "Có lỗi xảy ra, vui lòng thử lại sau",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-game-background to-white p-4 md:flex-row">
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 w-full max-w-md md:mb-0 md:w-1/2"
      >
        <div className="text-center md:text-left">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            Tham gia <span className="game-gradient-text">LinguaPlay</span>
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Bắt đầu hành trình học tiếng Anh thú vị của bạn
          </p>
        </div>

        <div className="mt-8 hidden md:block">
          <LottieAnimation
            animationData={registerAnimationData}
            className="h-64 w-full"
          />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl md:w-1/2"
      >
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold">Tạo tài khoản mới</h2>
          <p className="mt-2 text-sm text-gray-600">
            Điền thông tin của bạn để bắt đầu
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">
              Tên đăng nhập <span className="text-red-500">*</span>
            </Label>
            <Input
              id="username"
              type="text"
              placeholder="johndoe123"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="h-12"
            />
            <p className="text-xs text-gray-500">
              Tên đăng nhập phải có ít nhất 3 ký tự
            </p>
          </div>

              <div className="space-y-2">
            <Label htmlFor="email">
              Email <span className="text-red-500">*</span>
            </Label>
                <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
            <Label htmlFor="fullName">Họ và tên</Label>
                <Input
              id="fullName"
              type="text"
              placeholder="Nguyễn Văn A"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
            <Label htmlFor="password">
              Mật khẩu <span className="text-red-500">*</span>
            </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
            <Label htmlFor="confirmPassword">
              Xác nhận mật khẩu <span className="text-red-500">*</span>
            </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="h-12"
                />
              </div>

            <Button
              type="submit"
              disabled={isLoading}
            className="game-button h-12 w-full"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <>
                Đăng ký <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Đã có tài khoản?{" "}
            <Link
              href="/login"
              className="font-medium text-game-primary hover:underline"
            >
              Đăng nhập
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
