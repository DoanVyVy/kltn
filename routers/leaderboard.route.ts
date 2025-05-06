import { getCurrentUser } from "@/lib/server-auth";
import { baseProcedure, createTRPCRouter } from "./init";
import { z } from "zod";
import prisma from "@/lib/prismaClient";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

// Khai báo các kiểu dữ liệu
export type LeaderboardPeriod = "weekly" | "monthly" | "allTime";

// Tạo router cho leaderboard
const leaderboardRouter = createTRPCRouter({
  // Lấy bảng xếp hạng
  getLeaderboard: baseProcedure
    .input(
      z.object({
        period: z.enum(["weekly", "monthly", "allTime"]).default("weekly"),
        limit: z.number().default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const { period, limit } = input;

        // Xác định khoảng thời gian
        const now = new Date();
        let startDate: Date;

        if (period === "weekly") {
          // Lấy ngày đầu tuần (thứ 2)
          const dayOfWeek = now.getDay();
          const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
          startDate = new Date(now);
          startDate.setDate(now.getDate() - diff);
          startDate.setHours(0, 0, 0, 0);
        } else if (period === "monthly") {
          // Lấy ngày đầu tháng
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        } else {
          // Toàn bộ thời gian (không giới hạn)
          startDate = new Date(0);
        }

        // Tìm hoặc tạo leaderboard cho khoảng thời gian này
        let leaderboard = await prisma.leaderboard.findFirst({
          where: {
            periodType: period,
            startDate: {
              gte: startDate,
            },
            endDate:
              period === "allTime"
                ? null
                : {
                    gte: now,
                  },
          },
        });

        if (!leaderboard) {
          // Tạo leaderboard mới nếu không tìm thấy
          let endDate: Date | null = null;
          if (period === "weekly") {
            endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 7);
          } else if (period === "monthly") {
            endDate = new Date(startDate);
            endDate.setMonth(startDate.getMonth() + 1);
            endDate.setDate(0); // Ngày cuối tháng
          }

          leaderboard = await prisma.leaderboard.create({
            data: {
              name: `${
                period.charAt(0).toUpperCase() + period.slice(1)
              } Leaderboard`,
              periodType: period,
              startDate,
              endDate,
            },
          });
        }

        // Lấy dữ liệu người dùng cho bảng xếp hạng
        const leaderboardEntries = await prisma.leaderboardEntry.findMany({
          where: {
            leaderboardId: leaderboard.leaderboardId,
          },
          include: {
            user: {
              select: {
                userId: true,
                username: true,
                fullName: true,
                avatarUrl: true,
                currentLevel: true,
                totalPoints: true,
                streakDays: true,
              },
            },
          },
          orderBy: [{ score: "desc" }, { rank: "asc" }],
          take: limit,
        });

        // Nếu không có dữ liệu, tạo dữ liệu mới từ người dùng hiện có
        if (leaderboardEntries.length === 0) {
          // Lấy danh sách người dùng
          const users = await prisma.user.findMany({
            select: {
              userId: true,
              totalPoints: true,
              streakDays: true,
            },
            where: {
              lastActiveDate: {
                gte: startDate,
              },
            },
            orderBy: [{ totalPoints: "desc" }, { streakDays: "desc" }],
            take: limit,
          });

          // Tạo các entries cho leaderboard
          const entries = await Promise.all(
            users.map(async (user, index) => {
              const entry = await prisma.leaderboardEntry.create({
                data: {
                  leaderboardId: leaderboard!.leaderboardId,
                  userId: user.userId,
                  score: user.totalPoints || 0,
                  rank: index + 1,
                },
                include: {
                  user: {
                    select: {
                      userId: true,
                      username: true,
                      fullName: true,
                      avatarUrl: true,
                      currentLevel: true,
                      totalPoints: true,
                      streakDays: true,
                    },
                  },
                },
              });
              return entry;
            })
          );

          return {
            id: leaderboard.leaderboardId,
            name: leaderboard.name,
            period: period,
            entries: entries.map((entry) => ({
              id: entry.entryId,
              userId: entry.user.userId,
              name: entry.user.fullName || entry.user.username,
              avatar_url: entry.user.avatarUrl,
              current_xp: entry.score,
              level: entry.user.currentLevel,
              learning_streak: entry.user.streakDays,
              rank: entry.rank,
            })),
          };
        }

        // Format kết quả trả về
        return {
          id: leaderboard.leaderboardId,
          name: leaderboard.name,
          period: period,
          entries: leaderboardEntries.map((entry) => ({
            id: entry.entryId,
            userId: entry.user.userId,
            name: entry.user.fullName || entry.user.username,
            avatar_url: entry.user.avatarUrl,
            current_xp: entry.score,
            level: entry.user.currentLevel,
            learning_streak: entry.user.streakDays,
            rank: entry.rank,
          })),
        };
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
        return {
          id: 0,
          name: "",
          period: input.period,
          entries: [],
        };
      }
    }),

  // Cập nhật điểm số của người dùng trên bảng xếp hạng
  updateUserScore: baseProcedure
    .input(
      z.object({
        points: z.number().int(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const user = await getCurrentUser();
        if (!user || !user.user || !user.user.id) {
          throw new Error("Unauthorized");
        }

        const userId = user.user.id;
        const { points } = input;

        // Cập nhật điểm số cho tất cả các leaderboard hiện tại mà người dùng tham gia
        const activeLeaderboards = await prisma.leaderboard.findMany({
          where: {
            startDate: {
              lte: new Date(),
            },
            endDate: {
              gte: new Date(),
            },
          },
        });

        await Promise.all(
          activeLeaderboards.map(async (leaderboard) => {
            // Kiểm tra xem người dùng đã có trong leaderboard này chưa
            const existingEntry = await prisma.leaderboardEntry.findFirst({
              where: {
                leaderboardId: leaderboard.leaderboardId,
                userId,
              },
            });

            if (existingEntry) {
              // Cập nhật điểm số nếu đã tồn tại
              return await prisma.leaderboardEntry.update({
                where: { entryId: existingEntry.entryId },
                data: {
                  score: existingEntry.score + points,
                  updatedAt: new Date(),
                },
              });
            } else {
              // Tạo mới nếu chưa tồn tại
              return await prisma.leaderboardEntry.create({
                data: {
                  leaderboardId: leaderboard.leaderboardId,
                  userId,
                  score: points,
                  updatedAt: new Date(),
                },
              });
            }
          })
        );

        // Cập nhật tổng điểm của người dùng
        await prisma.user.update({
          where: { userId },
          data: {
            totalPoints: {
              increment: points,
            },
            updatedAt: new Date(),
          },
        });

        // Cập nhật thứ hạng cho tất cả người dùng trong mỗi leaderboard
        await Promise.all(
          activeLeaderboards.map(async (leaderboard) => {
            const entries = await prisma.leaderboardEntry.findMany({
              where: {
                leaderboardId: leaderboard.leaderboardId,
              },
              orderBy: {
                score: "desc",
              },
            });

            // Cập nhật thứ hạng cho từng người dùng
            await Promise.all(
              entries.map(async (entry, index) => {
                return await prisma.leaderboardEntry.update({
                  where: { entryId: entry.entryId },
                  data: {
                    rank: index + 1,
                  },
                });
              })
            );
          })
        );

        return { success: true };
      } catch (error) {
        console.error("Error updating user score:", error);
        throw new Error("Failed to update score");
      }
    }),

  // Lấy thứ hạng của người dùng hiện tại
  getCurrentUserRank: baseProcedure
    .input(
      z.object({
        period: z.enum(["weekly", "monthly", "allTime"]).default("weekly"),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const user = await getCurrentUser();
        if (!user || !user.user || !user.user.id) {
          return null;
        }

        const userId = user.user.id;
        const { period } = input;

        // Tìm leaderboard cho khoảng thời gian
        const leaderboard = await prisma.leaderboard.findFirst({
          where: {
            periodType: period,
            startDate: {
              lte: new Date(),
            },
            endDate:
              period === "allTime"
                ? null
                : {
                    gte: new Date(),
                  },
          },
        });

        if (!leaderboard) return null;

        // Tìm entry của người dùng
        const userEntry = await prisma.leaderboardEntry.findFirst({
          where: {
            leaderboardId: leaderboard.leaderboardId,
            userId,
          },
          include: {
            user: {
              select: {
                userId: true,
                username: true,
                fullName: true,
                avatarUrl: true,
                currentLevel: true,
                totalPoints: true,
                streakDays: true,
              },
            },
          },
        });

        if (!userEntry) return null;

        return {
          id: userEntry.entryId,
          userId: userEntry.user.userId,
          name: userEntry.user.fullName || userEntry.user.username,
          avatar_url: userEntry.user.avatarUrl,
          current_xp: userEntry.score,
          level: userEntry.user.currentLevel,
          learning_streak: userEntry.user.streakDays,
          rank: userEntry.rank,
        };
      } catch (error) {
        console.error("Error getting current user rank:", error);
        return null;
      }
    }),
});

export default leaderboardRouter;
