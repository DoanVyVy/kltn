"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import LottieAnimation from "@/components/lottie-animation";

// Dữ liệu animation tối thiểu
const loginAnimationData = {
  v: "5.7.1",
  fr: 30,
  ip: 0,
  op: 90,
  w: 500,
  h: 500,
  nm: "Login Animation",
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
            {
              ty: "tr",
              p: { a: 0, k: [0, 0] },
              a: { a: 0, k: [0, 0] },
              s: { a: 0, k: [100, 100] },
              r: { a: 0, k: 0 },
              o: { a: 0, k: 100 },
            },
          ],
          nm: "Ellipse 1",
        },
      ],
    },
  ],
};

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Tự động điền thông tin từ URL
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const emailParam = searchParams.get("email");
    const passwordParam = searchParams.get("password");

    if (emailParam) setEmail(decodeURIComponent(emailParam));
    if (passwordParam) setPassword(decodeURIComponent(passwordParam));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!email || !password) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Vui lòng nhập đầy đủ email và mật khẩu",
        duration: 5000,
      });
      setIsLoading(false);
      return;
    }

    try {
      console.log("Đang gửi request đăng nhập với email:", email);

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      const data = await response.json();
      console.log("Phản hồi từ server:", {
        status: response.status,
        ok: response.ok,
        data: data,
      });

      if (!response.ok) {
        const errorMessage = data.error || "Có lỗi xảy ra khi đăng nhập";
        console.error("Lỗi đăng nhập:", errorMessage);

        toast({
          variant: "destructive",
          title: "Đăng nhập thất bại",
          description: errorMessage,
          duration: 5000,
        });
        setIsLoading(false);
        return;
      }

      console.log("Đăng nhập thành công, chuyển hướng đến dashboard");

      toast({
        title: "Đăng nhập thành công",
        description: "Chào mừng bạn quay trở lại!",
        duration: 3000,
      });

      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 100);
    } catch (error) {
      console.error("Lỗi không mong muốn:", error);

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
            Chào mừng đến <span className="game-gradient-text">LinguaPlay</span>
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Học tiếng Anh thông qua các trò chơi tương tác thú vị
          </p>
        </div>

        <div className="mt-8 hidden md:block">
          <LottieAnimation
            animationData={loginAnimationData}
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
          <h2 className="text-2xl font-bold">Đăng nhập vào tài khoản</h2>
          <p className="mt-2 text-sm text-gray-600">
            Và tiếp tục hành trình học ngôn ngữ của bạn
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
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
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Mật khẩu</Label>
              <Link
                href="/forgot-password"
                className="text-sm text-game-primary hover:underline"
              >
                Quên mật khẩu?
              </Link>
            </div>
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

          <Button
            type="submit"
            disabled={isLoading}
            className="game-button h-12 w-full"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <>
                Đăng nhập <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Chưa có tài khoản?{" "}
            <Link
              href="/signup"
              className="font-medium text-game-primary hover:underline"
            >
              Đăng ký
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
