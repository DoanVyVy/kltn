"use server";

import eventHandlers, { IEvent } from "@/lib/event";
import "./learningHandler";
// server actions to handle events
export async function dispatch(event: IEvent) {
	eventHandlers.trigger(event);
}
