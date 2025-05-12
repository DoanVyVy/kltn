export type EventType =
	| "learned_vocabulary"
	| "learned_grammar"
	| "exp_gained"
	| "level_up";

export interface IEvent {
	eventType: EventType;
	payload: Record<string, any>;
	timestamp: Date;
	createdBy?: string;
}

export type EventHandler = (e: IEvent) => void;

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

	public async trigger(event: IEvent) {
		const handlers = this.handlers[event.eventType as K];
		if (handlers) {
			handlers.forEach((handler) => handler(event));
		}
	}
}

const eventHandlers = new HandlerRegistry<EventType>();
export default eventHandlers;
