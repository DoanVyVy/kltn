import { db } from "@/database";
import eventHandlers from "@/lib/event";

eventHandlers.register("exp_gained", async (event) => {
	if (!event.createdBy) {
		return;
	}
	const user = await db.user.findFirst({
		where: {
			userId: event.createdBy,
		},
	});
	if (!user) {
		return;
	}
	console.log("exp_gained", event.payload.exp);

	const currentLevel = user.currentLevel;
	const currentExp = user.totalPoints + event.payload.exp;
	const newLevel = await db.level.findFirst({
		where: {
			pointsRequired: {
				lte: currentExp,
			},
		},
		orderBy: {
			pointsRequired: "desc",
		},
	});
	const isLevelUp = currentLevel !== newLevel?.levelNumber;
	if (isLevelUp) {
		eventHandlers.trigger({
			...event,
			eventType: "level_up",
			payload: {
				newLevel: newLevel?.levelNumber,
				cause: "exp_gained",
			},
		});
	}
	await db.user.update({
		where: {
			userId: user.userId,
		},
		data: {
			currentExp: user.totalPoints + event.payload.exp,
			currentLevel: newLevel?.levelNumber,
		},
	});
});

export {};
