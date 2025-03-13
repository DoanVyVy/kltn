import { PrismaClient } from "@prisma/client";
import { ChatSession, GoogleGenerativeAI } from "@google/generative-ai";
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
const prompt = `
Create a vocabulary list based on a given topic. The input is the name of the topic, and the output should be a JSON array containing objects with the following structure:

{

'word': '<word>',

'exampleSentence': '<sentence using the word>',

'difficultyLevel': <number from 1 to 3>,

'samePronunciations': ['<word1>', '<word2>', ...] or [],
'definition': '<definition>'
'partOfSpeech': '<partOfSpeech>'

}

'word' is a english vocabulary word related to the topic (single word only)
'exampleSentence' is a clear, contextually appropriate sentence demonstrating the word's usage.
'difficultyLevel' is an integer from 1 to 3, where 1 is easy, 2 is medium, and 3 is difficult, based on the word's complexity or common usage.
'samePronunciations' is an array listing words that have similar or identical pronunciation (homophones,near-homophones or paronym ) but different meanings or spellings, At least 5 words; if none exist or not enough, use a random words.
'definition' is a clear, concise definition of the word.
'partOfSpeech' is the part of speech of the word (noun, verb, adjective, etc.)
Generate at least 5 words for the given topic. Ensure the words are relevant, varied in difficulty, the sentences are natural and grammatically correct, and the 'samePronunciations' field is accurately populated.
`;

function parseGeminiResponse(res: string): any {
	return JSON.parse(
		res
			.replace(/```json/g, "")
			.replace(/```/g, "")
			.replace(/"""/g, '\\"')
	);
}

let chat: ChatSession | undefined;
interface GeminiResponse {
	word: string;
	exampleSentence: string;
	difficultyLevel: number;
	samePronunciations: string[];
	definition: string;
	partOfSpeech: string;
}

const prisma = new PrismaClient();

const listTopics = await prisma.vocabularyCategory.findMany({});
function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

for await (const topic of listTopics) {
	chat = model.startChat({
		history: [
			{
				role: "user",
				parts: [{ text: prompt }],
			},
		],
	});
	for (let i = 0; i < 5; i++) {
		const result = await chat.sendMessage(topic.categoryName);
		const words = parseGeminiResponse(result.response.text());
		const datas = words.map((word: GeminiResponse) => ({
			categoryId: topic.categoryId,
			paronymWords: word.samePronunciations,
			definition: word.definition,
			word: word.word,
			exampleSentence: word.exampleSentence,
			difficultyLevel: word.difficultyLevel,
			imageUrl: "https://placewaifu.com/image/400/300",
			partOfSpeech: word.partOfSpeech || "unknown",
		}));
		console.log(
			"generated ",
			datas.length,
			" words for ",
			topic.categoryName
		);
		await prisma.vocabularyWord.createMany({ data: datas });

		await sleep(1000);
	}
}
await sleep(1000);
