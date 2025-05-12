export type EventType = "user" | "system" | "error";

export interface IEvent {
	eventType: EventType;
	payload: Record<string, any>;
	timestamp: Date;
}

export type EventHandler = (payload: Record<string, any>) => void;

class HandlerRegistry<K extends EventType = EventType> {
	private handlers: Record<K, Array<EventHandler>> = {} as Record<
		K,
		Array<EventHandler>
	>;

	public register(eventType: K, handler: EventHandler) {
		if (!this.handlers[eventType]) {
			this.handlers[eventType] = [];
		}
		this.handlers[eventType].push(handler);
	}

	public trigger(event: IEvent) {
		const handlers = this.handlers[event.eventType as K];
		if (handlers) {
			handlers.forEach((handler) =>
				handler(event.payload as Record<string, any>)
			);
		}
	}
}

const eventHandlers = new HandlerRegistry<EventType>();
export default eventHandlers;
