"use server";
import { db } from "@/database";
import "./learningHandler";
import "./expHandler";
import eventHandlers, { IEvent } from "@/lib/event";
import { getUserId } from "@/lib/server-auth";
// server actions to handle events
export async function dispatchAppEvent(event: IEvent) {
	const userId = await getUserId();
	await db.eventStore.create({
		data: {
			eventType: event.eventType,
			createdAt: event.timestamp,
			eventData: event.payload,
			userId: userId!,
		},
	});
	event.createdBy = userId!;
	eventHandlers.trigger(event);
}
