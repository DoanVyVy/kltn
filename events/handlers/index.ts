"use server";
import { db } from "@/database";
import "./learningHandler";
import eventHandlers, { IEvent } from "@/lib/event";
import { getCurrentUser } from "@/lib/server-auth";
// server actions to handle events
export async function dispatchAppEvent(event: IEvent) {
	await db.eventStore.create({
		data: {
			eventType: event.eventType,
			createdAt: event.timestamp,
			eventData: event.payload,
			userId: await getCurrentUser().then((user) => user?.user.id!),
		},
	});
	eventHandlers.trigger(event);
}
