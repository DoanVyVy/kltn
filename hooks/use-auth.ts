"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { trpc } from "@/trpc/client";

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const supabase = createClientComponentClient();

  // Sử dụng tRPC mutation để đăng xuất
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      setUser(null);
      router.push("/dashboard");
    },
    onError: (error) => {
      console.error("Lỗi khi đăng xuất qua tRPC:", error.message);
    },
  });

  useEffect(() => {
    const getUser = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error) {
          console.error("Lỗi khi lấy thông tin người dùng:", error.message);
          setUser(null);
          return;
        }

        if (user) {
          console.log("Thông tin user từ Supabase:", {
            id: user.id,
            email: user.email,
            aud: user.aud,
            role: user.role,
          });

          // Đảm bảo user có id
          if (!user.id) {
            console.error("User không có ID hợp lệ:", user);
          }
        }

        setUser(user);
      } catch (error: any) {
        console.error("Lỗi trong getUser:", error.message);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const updatedUser = session?.user ?? null;

      // Log để debug
      if (updatedUser) {
        console.log("Auth state changed - User:", {
          id: updatedUser.id,
          email: updatedUser.email,
        });
      } else {
        console.log("Auth state changed - No user");
      }

      setUser(updatedUser);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  const logout = async () => {
    try {
      // Sử dụng mutation logout từ tRPC thay vì gọi trực tiếp Supabase
      logoutMutation.mutate();
    } catch (error: any) {
      console.error("Lỗi khi đăng xuất:", error.message);
    }
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.role === "ADMIN",
    logout,
  };
}
