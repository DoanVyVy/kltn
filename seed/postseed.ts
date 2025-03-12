import { PrismaClient } from "@prisma/client";

export type Root = Root2[];

export interface Root2 {
	word: string;
	phonetics: Phonetic[];
	meanings: Meaning[];
	license: License2;
	sourceUrls: string[];
}

export interface Phonetic {
	audio: string;
	sourceUrl?: string;
	license?: License;
	text?: string;
}

export interface License {
	name: string;
	url: string;
}

export interface Meaning {
	partOfSpeech: string;
	definitions: Definition[];
	synonyms: string[];
	antonyms: any[];
}

export interface Definition {
	definition: string;
	synonyms: any[];
	antonyms: any[];
}

export interface License2 {
	name: string;
	url: string;
}

const url = "https://api.dictionaryapi.dev/api/v2/entries/en/";
const prisma = new PrismaClient();

const listWords = await prisma.vocabularyWord.findMany({
	where: {
		audioUrl: null,
	},
});
function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
for await (const word of listWords) {
	const response = await fetch(url + word.word);
	const data = await response.json();
	try {
		const audioUrl = findPhonetics("audio", data);

		await prisma.vocabularyWord.update({
			where: { wordId: word.wordId },
			data: {
				audioUrl: audioUrl,
				pronunciation: findPhonetics("text", data),
			},
		});
	} catch (e) {
		console.error("Error updating word:", word.word, data);
	}
	await sleep(1000);
}

function findPhonetics(key: string, data: Root) {
	let rest = undefined;
	for (let i = 0; i < data[0].phonetics.length; i++) {
		if (data[0].phonetics[i][key]) {
			rest = data[0].phonetics[i][key];
			break;
		}
	}
	return rest;
}
