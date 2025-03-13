import { exec } from "child_process";
import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
function randomVoice(): string {
	const voices = [
		"el-GR-AthinaNeural",
		"el-GR-NestorasNeural",
		"en-AU-NatashaNeural",
		"en-AU-WilliamNeural",
		"en-CA-ClaraNeural",
		"en-CA-LiamNeural",
		"en-GB-LibbyNeural",
		"en-GB-MaisieNeural",
		"en-GB-RyanNeural",
		"en-GB-SoniaNeural",
		"en-GB-ThomasNeural",
		"en-HK-SamNeural",
		"en-HK-YanNeural",
		"en-IE-ConnorNeural",
		"en-IE-EmilyNeural",
		"en-IN-NeerjaExpressiveNeural",
		"en-IN-NeerjaNeural",
		"en-IN-PrabhatNeural",
		"en-KE-AsiliaNeural",
		"en-KE-ChilembaNeural",
		"en-NG-AbeoNeural",
		"en-NG-EzinneNeural",
		"en-NZ-MitchellNeural",
		"en-NZ-MollyNeural",
		"en-PH-JamesNeural",
		"en-PH-RosaNeural",
		"en-SG-LunaNeural",
		"en-SG-WayneNeural",
		"en-TZ-ElimuNeural",
		"en-TZ-ImaniNeural",
		"en-US-AnaNeural",
		"en-US-AndrewMultilingualNeural",
		"en-US-AndrewNeural",
		"en-US-AriaNeural",
		"en-US-AvaMultilingualNeural",
		"en-US-AvaNeural",
		"en-US-BrianMultilingualNeural",
		"en-US-BrianNeural",
		"en-US-ChristopherNeural",
		"en-US-EmmaMultilingualNeural",
		"en-US-EmmaNeural",
		"en-US-EricNeural",
		"en-US-GuyNeural",
		"en-US-JennyNeural",
		"en-US-MichelleNeural",
		"en-US-RogerNeural",
		"en-US-SteffanNeural",
		"en-ZA-LeahNeural",
		"en-ZA-LukeNeural",
	];

	return voices[Math.floor(Math.random() * voices.length)];
}

async function textToSpeech(
	text: string,
	filePath: string,
	voice: string = "en-US-AvaMultilingualNeural"
): Promise<void> {
	return new Promise((resolve, reject) => {
		const command = `C:/Users/BaoBao/AppData/Roaming/Python/Python312/Scripts/edge-tts.exe --voice "${voice}" --text "${text}" --write-media "${filePath}"`;

		exec(command, (error, stdout, stderr) => {
			if (error) {
				console.error("Lỗi khi chạy edge-tts:", stderr);
				reject(error);
				return;
			}
			console.log("Tạo file thành công:", filePath);
			resolve();
		});
	});
}

// textToSpeech("Text to Speech!", "output.mp3", randomVoice())
// 	.then(() => console.log("Hoàn thành!"))
// 	.catch((err) => console.error("Có lỗi xảy ra:", err));
const prisma = new PrismaClient();

const listWords = await prisma.vocabularyWord.findMany({
	where: {
		audioUrl: null,
	},
});

function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
	region: "auto",
	endpoint:
		"https://c6f952415d166f10dba466d2755d4432.r2.cloudflarestorage.com",
	credentials: {
		accessKeyId: "0825f746929c757893995908a5a2e4f7",
		secretAccessKey:
			"38a8f554b20bde8f0d9d13abfd498dfca6fd77ed99e8c893c6f4465a510b4bf2",
	},
});

async function uploadFile(filePath: string, key: string) {
	const fileStream = fs.createReadStream(filePath);
	await s3.send(
		new PutObjectCommand({
			Bucket: "resources",
			Key: key,
			Body: fileStream,
			ContentType: "audio/mpeg",
			ContentLength: fs.statSync(filePath).size,
		})
	);
}

for await (const word of listWords) {
	const id = uuidv4();
	const filePath = `./audio/${id}.mp3`;
	try {
		await textToSpeech(word.word, filePath, randomVoice());

		const key = `audio/${id}.mp3`;
		await uploadFile(filePath, key);
		await prisma.vocabularyWord.update({
			where: { wordId: word.wordId },
			data: {
				audioUrl: "https://r2.huuhoang.id.vn/" + key,
			},
		});
		console.log("Uploaded word:", word.word, key);
	} catch (e) {
		console.error("Error updating word:", word.word);
	}
	await sleep(1000);
}
