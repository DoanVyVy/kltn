import eventHandlers from "@/lib/event";

eventHandlers.register("user", (payload) => {
	console.log("User event triggered with payload:", payload);
});

export {};
