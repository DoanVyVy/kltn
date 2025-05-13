import { db } from "@/database";
import eventHandlers, { IEvent } from "@/lib/event";
import { reUpdateStreak } from "@/services/streak-service";
const handleActivity = async (event: IEvent) => {
	const isFirstTimeInDay = await db.eventStore.findFirst({
		where: {
			eventType: "streak_incremented",
			createdAt: {
				gte: new Date(new Date().setHours(0, 0, 0, 0)),
			},
			userId: event.createdBy,
		},
	});

	if (isFirstTimeInDay) {
		return;
	}
	eventHandlers.trigger({
		...event,
		eventType: "streak_incremented",
		payload: {
			cause: event.eventType,
		},
	});
	reUpdateStreak(event.createdBy!);
};
// hoạt động này sẽ được gọi khi người dùng học ngữ pháp hoặc từ vựng, làm tăng streak
eventHandlers.register("learned_grammar", async (rest) => {
	return handleActivity(rest);
});
eventHandlers.register("learned_vocabulary", async (rest) => {
	return handleActivity(rest);
});

export {};
