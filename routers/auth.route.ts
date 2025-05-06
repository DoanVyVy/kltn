import { z } from "zod";
import { baseProcedure, createTRPCRouter } from "./init";
import { createHash } from "crypto";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

// Shared password hashing function (same as in user.route.ts)
function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

export const authRouter = createTRPCRouter({
  login: baseProcedure
    .input(
      z.object({
        email: z.string().email("Email không hợp lệ"),
        password: z.string().min(1, "Mật khẩu không được để trống"),
      })
    )
    .mutation(async ({ ctx: { db }, input }) => {
      const { email, password } = input;

      // Tìm người dùng dựa trên email
      const user = await db.user.findFirst({
        where: { email },
      });

      // Nếu không tìm thấy người dùng hoặc mật khẩu không đúng
      if (!user || hashPassword(password) !== user.passwordHash) {
        throw new Error("Email hoặc mật khẩu không đúng");
      }

      // Tạo session với Supabase
      const supabase = createRouteHandlerClient({ cookies });
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Supabase Auth Error:", error);
        throw new Error("Có lỗi xảy ra khi đăng nhập");
      }

      // Cập nhật thời gian hoạt động cuối của người dùng
      await db.user.update({
        where: { userId: user.userId },
        data: {
          lastActiveDate: new Date(),
          updatedAt: new Date(),
        },
      });

      return {
        success: true,
        user: {
          id: user.userId,
          email: user.email,
          username: user.username,
          fullName: user.fullName,
          role:
            user.currentLevel >= 10
              ? "admin"
              : user.currentLevel >= 5
              ? "moderator"
              : "user",
        },
      };
    }),

  signup: baseProcedure
    .input(
      z.object({
        username: z.string().min(3, "Tên đăng nhập phải có ít nhất 3 ký tự"),
        email: z.string().email("Email không hợp lệ"),
        password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
        fullName: z.string().optional(),
      })
    )
    .mutation(async ({ ctx: { db }, input }) => {
      const { username, email, password, fullName } = input;

      // Kiểm tra username hoặc email đã tồn tại chưa
      const existingUser = await db.user.findFirst({
        where: {
          OR: [{ username }, { email }],
        },
      });

      if (existingUser) {
        if (existingUser.username === username) {
          throw new Error("Tên đăng nhập đã tồn tại");
        }
        if (existingUser.email === email) {
          throw new Error("Email đã tồn tại");
        }
      }

      // Mã hóa mật khẩu
      const passwordHash = hashPassword(password);

      // Tạo người dùng trong database
      const newUser = await db.user.create({
        data: {
          username,
          email,
          passwordHash,
          fullName,
          currentLevel: 1, // Mặc định là user thường
          createdAt: new Date(),
          updatedAt: new Date(),
          lastActiveDate: new Date(),
        },
      });

      // Tạo account trên Supabase Auth
      const supabase = createRouteHandlerClient({ cookies });
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            name: fullName || username,
            role: "user",
            userId: newUser.userId,
          },
        },
      });

      if (error) {
        // Nếu có lỗi khi tạo tài khoản Supabase, xóa người dùng đã tạo trong database
        await db.user.delete({
          where: { userId: newUser.userId },
        });
        console.error("Supabase Auth Error:", error);
        throw new Error("Có lỗi xảy ra khi đăng ký");
      }

      return {
        success: true,
        message: "Đăng ký thành công! Vui lòng đăng nhập.",
        user: {
          id: newUser.userId,
          email: newUser.email,
          username: newUser.username,
        },
      };
    }),

  logout: baseProcedure.mutation(async () => {
    // Thực hiện đăng xuất trên Supabase
    const supabase = createRouteHandlerClient({ cookies });
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout Error:", error);
      throw new Error("Có lỗi xảy ra khi đăng xuất");
    }

    return {
      success: true,
    };
  }),

  // Lấy thông tin người dùng hiện tại
  getCurrentUser: baseProcedure.query(async () => {
    const supabase = createRouteHandlerClient({ cookies });
    const { data, error } = await supabase.auth.getSession();

    if (error || !data.session) {
      return null;
    }

    return {
      user: {
        id: data.session.user.id,
        email: data.session.user.email,
        name:
          data.session.user.user_metadata?.name ||
          data.session.user.email?.split("@")[0],
        role: data.session.user.user_metadata?.role || "user",
      },
    };
  }),
});

export default authRouter;
