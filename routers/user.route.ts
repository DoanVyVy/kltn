import { z } from "zod";
import { baseProcedure, createTRPCRouter } from "./init";
import { paginationRequestSchema } from "@/schema/pagination";
import { createHash } from "crypto";

// Hàm mã hóa mật khẩu thay thế bcrypt
function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

export const userRouter = createTRPCRouter({
  getAllUsers: baseProcedure
    .input(
      paginationRequestSchema.extend({
        search: z.string().optional(),
        role: z.string().optional(),
        status: z.string().optional(),
      })
    )
    .query(async ({ ctx: { db }, input }) => {
      const { page, limit, search, role, status } = input;

      const where: any = {};

      // Tìm kiếm theo tên hoặc email
      if (search) {
        where.OR = [
          {
            username: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            email: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            fullName: {
              contains: search,
              mode: "insensitive",
            },
          },
        ];
      }

      // Lọc theo vai trò dựa vào currentLevel
      if (role) {
        if (role === "admin") {
          where.currentLevel = { gte: 10 };
        } else if (role === "moderator") {
          where.currentLevel = { gte: 5, lt: 10 };
        } else {
          where.currentLevel = { lt: 5 };
        }
      }

      // Lọc theo trạng thái nếu có
      if (status) {
        if (status === "active") {
          where.lastActiveDate = {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Hoạt động trong 30 ngày qua
          };
        } else if (status === "inactive") {
          where.lastActiveDate = {
            lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Không hoạt động trong 30 ngày
          };
        }
      }

      // Đếm tổng số người dùng thỏa mãn điều kiện
      const total = await db.user.count({ where });

      // Lấy danh sách người dùng phân trang
      const users = await db.user.findMany({
        where,
        select: {
          userId: true,
          username: true,
          email: true,
          fullName: true,
          avatarUrl: true,
          currentLevel: true,
          totalPoints: true,
          streakDays: true,
          lastActiveDate: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        skip: (page - 1) * limit,
        take: limit,
      });

      // Thêm trường role dựa vào currentLevel
      const usersWithRole = users.map((user) => ({
        ...user,
        role:
          user.currentLevel >= 10
            ? "admin"
            : user.currentLevel >= 5
            ? "moderator"
            : "user",
      }));

      return {
        items: usersWithRole,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    }),

  getUserById: baseProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx: { db }, input }) => {
      const { userId } = input;

      if (!userId) return null;

      const user = await db.user.findUnique({
        where: {
          userId,
        },
        select: {
          userId: true,
          username: true,
          email: true,
          fullName: true,
          avatarUrl: true,
          currentLevel: true,
          totalPoints: true,
          streakDays: true,
          lastActiveDate: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) return null;

      // Thêm trường role dựa vào currentLevel
      return {
        ...user,
        role:
          user.currentLevel >= 10
            ? "admin"
            : user.currentLevel >= 5
            ? "moderator"
            : "user",
      };
    }),

  getUserLearningStats: baseProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx: { db }, input }) => {
      const { userId } = input;

      if (!userId) return null;

      // Đếm số từ vựng đã học (sửa lại logic, không dùng distinct)
      const vocabAnswers = await db.userFlashCardAnswer.findMany({
        where: {
          userId,
          isCorrect: true,
        },
        select: {
          wordId: true,
        },
      });

      // Lấy số lượng từ vựng duy nhất
      const uniqueWordIds = [...new Set(vocabAnswers.map((a) => a.wordId))];
      const vocabularyCount = uniqueWordIds.length;

      // Đếm số ngữ pháp đã học
      const grammarProgress = await db.userProgress.count({
        where: {
          userId,
          category: {
            isVocabularyCourse: false,
          },
        },
      });

      // Đếm số trò chơi đã chơi
      const gamesPlayed = await db.userActivity.count({
        where: {
          userId,
        },
      });

      return {
        vocabularyCount,
        grammarCount: grammarProgress,
        gamesPlayed,
      };
    }),

  createUser: baseProcedure
    .input(
      z.object({
        username: z.string().min(3, "Tên người dùng phải có ít nhất 3 ký tự"),
        email: z.string().email("Email không hợp lệ"),
        password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
        fullName: z.string().optional(),
        role: z.string().optional(),
      })
    )
    .mutation(async ({ ctx: { db }, input }) => {
      const { username, email, password, fullName, role } = input;

      // Kiểm tra username hoặc email đã tồn tại chưa
      const existingUser = await db.user.findFirst({
        where: {
          OR: [{ username }, { email }],
        },
      });

      if (existingUser) {
        if (existingUser.username === username) {
          throw new Error("Tên người dùng đã tồn tại");
        }
        if (existingUser.email === email) {
          throw new Error("Email đã tồn tại");
        }
      }

      // Mã hóa mật khẩu
      const passwordHash = hashPassword(password);

      // Thiết lập currentLevel dựa vào role
      let currentLevel = 1;
      if (role === "admin") currentLevel = 10;
      else if (role === "moderator") currentLevel = 5;

      // Tạo người dùng mới sử dụng currentLevel thay vì role
      const newUser = await db.user.create({
        data: {
          username,
          email,
          passwordHash,
          fullName,
          currentLevel,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      return {
        userId: newUser.userId,
        username: newUser.username,
        email: newUser.email,
        fullName: newUser.fullName,
        role:
          currentLevel >= 10
            ? "admin"
            : currentLevel >= 5
            ? "moderator"
            : "user",
      };
    }),

  updateUser: baseProcedure
    .input(
      z.object({
        userId: z.string(),
        username: z.string().optional(),
        email: z.string().email().optional(),
        fullName: z.string().optional(),
        role: z.string().optional(),
      })
    )
    .mutation(async ({ ctx: { db }, input }) => {
      const { userId, username, email, fullName, role } = input;

      if (username || email) {
        // Kiểm tra username hoặc email đã tồn tại chưa (ngoại trừ người dùng hiện tại)
        const existingUser = await db.user.findFirst({
          where: {
            OR: [username ? { username } : {}, email ? { email } : {}],
            NOT: {
              userId,
            },
          },
        });

        if (existingUser) {
          if (username && existingUser.username === username) {
            throw new Error("Tên người dùng đã tồn tại");
          }
          if (email && existingUser.email === email) {
            throw new Error("Email đã tồn tại");
          }
        }
      }

      // Thiết lập currentLevel dựa vào role
      let currentLevel;
      if (role) {
        if (role === "admin") currentLevel = 10;
        else if (role === "moderator") currentLevel = 5;
        else currentLevel = 1;
      }

      // Cập nhật thông tin người dùng sử dụng currentLevel
      const updatedUser = await db.user.update({
        where: {
          userId,
        },
        data: {
          ...(username && { username }),
          ...(email && { email }),
          ...(fullName !== undefined && { fullName }),
          ...(currentLevel !== undefined && { currentLevel }),
          updatedAt: new Date(),
        },
      });

      return {
        ...updatedUser,
        role:
          updatedUser.currentLevel >= 10
            ? "admin"
            : updatedUser.currentLevel >= 5
            ? "moderator"
            : "user",
      };
    }),

  resetPassword: baseProcedure
    .input(
      z.object({
        userId: z.string(),
        newPassword: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
      })
    )
    .mutation(async ({ ctx: { db }, input }) => {
      const { userId, newPassword } = input;

      // Mã hóa mật khẩu mới
      const passwordHash = hashPassword(newPassword);

      // Cập nhật mật khẩu
      await db.user.update({
        where: {
          userId,
        },
        data: {
          passwordHash,
          updatedAt: new Date(),
        },
      });

      return { success: true };
    }),

  deleteUser: baseProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx: { db }, input }) => {
      const { userId } = input;

      // Xóa người dùng
      await db.user.delete({
        where: {
          userId,
        },
      });

      return { success: true };
    }),
});

export default userRouter;
