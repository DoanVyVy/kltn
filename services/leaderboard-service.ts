import { db } from "@/database";
import prisma from "@/lib/prismaClient";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";

dayjs.extend(isoWeek);

type PeriodType = "weekly" | "monthly" | "all_time";

const periodConfig: Record<
	PeriodType,
	() => { name: string; startDate?: Date; endDate?: Date }
> = {
	weekly: () => {
		const now = dayjs();
		return {
			name: `Tuần ${now.isoWeek()} của năm ${now.year()}`,
			startDate: now.startOf("isoWeek").toDate(),
			endDate: now.endOf("isoWeek").toDate(),
		};
	},
	monthly: () => {
		const now = dayjs();
		return {
			name: `Tháng ${now.format("MM")} năm ${now.format("YYYY")}`,
			startDate: now.startOf("month").toDate(),
			endDate: now.endOf("month").toDate(),
		};
	},
	all_time: () => ({
		name: "Tất cả thời gian",
	}),
};

// Tạo hoặc lấy Leaderboard theo period
async function ensureLeaderboard(periodType: PeriodType) {
	const { name, startDate, endDate } = periodConfig[periodType]();

	const existing = await db.leaderboard.findFirst({
		where: {
			periodType,
			...(startDate && endDate ? { startDate, endDate } : {}),
		},
	});

	if (existing) return existing;

	const created = await prisma.leaderboard.create({
		data: {
			name,
			periodType,
			startDate,
			endDate,
		},
	});

	return created;
}

// Tạo entry cho user nếu chưa có
async function ensureUserLeaderboardEntry(
	userId: string,
	leaderboardId: number
): Promise<void> {
	const existing = await db.leaderboardEntry.findFirst({
		where: { userId, leaderboardId },
	});
	if (existing) return;

	await prisma.leaderboardEntry.create({
		data: {
			userId,
			leaderboardId,
			score: 0,
			updatedAt: new Date(),
			rank: 999,
		},
	});
}

export async function userLeaderboardGainExp(
	userId: string,
	exp: number
): Promise<void> {
	const [weekly, monthly, allTime] = await Promise.all([
		ensureLeaderboard("weekly"),
		ensureLeaderboard("monthly"),
		ensureLeaderboard("all_time"),
	]);

	const leaderboardIds = [
		weekly.leaderboardId,
		monthly.leaderboardId,
		allTime.leaderboardId,
	];

	await Promise.all(
		leaderboardIds.map((id) => ensureUserLeaderboardEntry(userId, id))
	);

	await prisma.leaderboardEntry.updateMany({
		where: {
			userId,
			leaderboardId: {
				in: leaderboardIds,
			},
		},
		data: {
			score: {
				increment: exp,
			},
			updatedAt: new Date(),
		},
	});
	void recalculateRank(weekly.leaderboardId);
}
export async function recalculateRank(leaderboardId: number): Promise<void> {
	const entries = await db.leaderboardEntry.findMany({
		where: { leaderboardId },
		orderBy: { score: "desc" },
	});

	let currentRank = 1;
	let prevScore: number | null = null;

	const updates = [];

	for (let i = 0; i < entries.length; i++) {
		const entry = entries[i];
		const isSameScore = entry.score === prevScore;
		const rank = isSameScore ? currentRank : i + 1;

		if (!isSameScore) {
			currentRank = rank;
		}

		updates.push(
			prisma.leaderboardEntry.update({
				where: {
					leaderboardId_userId: {
						leaderboardId,
						userId: entry.userId,
					},
				},
				data: {
					rank,
				},
			})
		);

		prevScore = entry.score;
	}

	if (updates.length > 0) {
		await prisma.$transaction(updates);
	}
}
