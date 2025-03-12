import { Prisma, PrismaClient } from "@prisma/client";
import { GoogleGenerativeAI } from "@google/generative-ai";
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
const prompt = `
Create a vocabulary list based on a given topic. The input is the name of the topic, and the output should be a JSON array containing objects with the following structure:

{

'word': '<word>',

'exampleSentence': '<sentence using the word>',

'difficultyLevel': <number from 1 to 3>

}

'word' is a vocabulary word related to the topic (single word, no spaces or special characters).
'exampleSentence' is a clear, contextually appropriate sentence demonstrating the word's usage.
'difficultyLevel' is an integer from 1 to 3, where 1 is easy, 2 is medium, and 3 is difficult, based on the word's complexity or common usage.
Generate at least 5 words for the given topic. Ensure the words are relevant, varied in difficulty, and the sentences are natural and grammatically correct. The topic provided is:
`;

function parseGeminiResponse(res: string): any {
	return JSON.parse(
		res
			.replace(/```json/g, "")
			.replace(/```/g, "")
			.replace(/"""/g, '\\"')
	);
}

const chat = model.startChat({
	history: [
		{
			role: "user",
			parts: [{ text: prompt }],
		},
	],
});

const prisma = new PrismaClient();

const listTopics = await prisma.vocabularyCollection.findMany({});
function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
for await (const topic of listTopics) {
	const result = await chat.sendMessage(topic.name);
	const words = parseGeminiResponse(result.response.text());
	const datas = await Promise.all(
		words
			.map((word: any) => ({
				categoryId: 1,
				word: word.word,
				definition: word.exampleSentence,
				exampleSentence: word.exampleSentence,
				difficultyLevel: word.difficultyLevel,
			}))
			.map((data: Prisma.VocabularyWordCreateInput) =>
				prisma.vocabularyWord.create({ data })
			)
	);
	await Promise.all(
		datas.map(async (data) => {
			console.log(data.word);
			return await prisma.collectionDetail.create({
				data: {
					collectionId: topic.id,
					wordId: data.wordId,
				},
			});
		})
	);
	await sleep(1000);
}
