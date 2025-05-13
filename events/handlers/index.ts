"use server";
import "./learningHandler";
import "./expHandler";
import "./streakHandler";
import eventHandlers, { IEvent } from "@/lib/event";
import { getCurrentUserId } from "@/lib/server-auth";
// server actions to handle events
export async function dispatchAppEvent(event: IEvent) {
	const userId = await getCurrentUserId();

	event.createdBy = userId!;
	void eventHandlers.trigger(event);
}
