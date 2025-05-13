import { db } from "@/database";
import eventHandlers from "@/lib/event";
const EXP_PER_DIFFICULTY = 10;
eventHandlers.register(
	"learned_grammar",
	({ payload: { grammarId }, ...rest }) => {
		const grammar = db.grammarContent.findFirst({
			where: {
				contentId: grammarId,
			},
		});
		if (!grammar) {
			return;
		}
		const exp = EXP_PER_DIFFICULTY;
		eventHandlers.trigger({
			...rest,
			eventType: "exp_gained",
			payload: {
				exp: exp,
				cause: "learned_grammar",
			},
		});
	}
);
eventHandlers.register(
	"learned_vocabulary",
	async ({ payload: { wordId }, ...rest }) => {
		console.log("learned_vocabulary", wordId);
		const word = await db.vocabularyWord.findFirst({
			where: {
				wordId: wordId,
			},
		});
		if (!word) {
			return;
		}
		const exp = EXP_PER_DIFFICULTY * word.difficultyLevel;
		eventHandlers.trigger({
			...rest,
			eventType: "exp_gained",
			payload: {
				exp: exp,
				cause: "learned_vocabulary",
			},
		});
	}
);

export {};
