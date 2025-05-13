import { db } from "@/database";
import { subDays } from "date-fns";

export async function reUpdateStreak(userId: string) {
	const events = await db.eventStore.findMany({
		where: {
			userId,
			eventType: {
				in: ["learned_grammar", "learned_vocabulary"],
			},
		},
		select: {
			createdAt: true,
		},
		orderBy: {
			createdAt: "desc",
		},
	});

	const daysSet = new Set(
		events.map((e) => {
			const d = new Date(e.createdAt);
			d.setHours(0, 0, 0, 0);
			return d.getTime();
		})
	);

	let streak = 0;
	let currentDay = new Date();
	currentDay.setHours(0, 0, 0, 0);

	while (daysSet.has(currentDay.getTime())) {
		streak++;
		currentDay = subDays(currentDay, 1);
	}
	await db.user.update({
		where: {
			userId,
		},
		data: {
			streakDays: streak,
		},
	});
	return streak;
}
