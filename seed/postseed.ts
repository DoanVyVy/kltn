import { PrismaClient } from "@prisma/client";
import { GoogleGenerativeAI } from "@google/generative-ai";
import AudioService from "../services/audio-service";

/**
 * Post-seeding script to enhance vocabulary data using Gemini API for phonetics
 * and definitions, and iFlytek for audio generation
 */

// Initialize API clients
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

// Initialize Prisma client
const prisma = new PrismaClient();

// Sleep utility function
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Extract phonetic information using Gemini API
 *
 * @param word - The word to get phonetics for
 * @returns Phonetic information including text pronunciation
 */
async function getPhonetics(word: string): Promise<{ text: string | null }> {
  try {
    const prompt = `
    Please provide the International Phonetic Alphabet (IPA) pronunciation for the English word "${word}".
    Return your response in this exact JSON format without any additional text:
    {"text": "IPA pronunciation"}
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Extract JSON from the response
    const jsonMatch = responseText.match(/\{.*\}/s);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    } else {
      console.warn(`Could not extract phonetics for word: ${word}`);
      return { text: null };
    }
  } catch (error) {
    console.error(`Error getting phonetics for ${word}:`, error);
    return { text: null };
  }
}

/**
 * Main function to enhance vocabulary data
 */
async function enhanceVocabularyData() {
  try {
    console.log("Starting vocabulary data enhancement process...");

    // Get words that need enhancement (missing audio or pronunciation)
    const listWords = await prisma.vocabularyWord.findMany({
      where: {
        OR: [{ audioUrl: null }, { pronunciation: null }],
      },
    });

    console.log(`Found ${listWords.length} words to enhance.`);

    // Process words in small batches to avoid overwhelming APIs
    const batchSize = 5;
    for (let i = 0; i < listWords.length; i += batchSize) {
      const batch = listWords.slice(i, i + batchSize);

      for (const word of batch) {
        console.log(`Enhancing data for word: ${word.word}`);

        try {
          // Get phonetic information using Gemini API
          let pronunciation = word.pronunciation;
          if (!pronunciation) {
            const phoneticData = await getPhonetics(word.word);
            pronunciation = phoneticData.text;
            console.log(
              `Generated pronunciation for ${word.word}: ${pronunciation}`
            );
          }

          // Generate audio using iFlytek TTS service
          let audioUrl = word.audioUrl;
          if (!audioUrl) {
            audioUrl = await AudioService.textToSpeech(word.word);
            console.log(`Generated audio URL for ${word.word}`);
          }

          // Update the word in the database
          await prisma.vocabularyWord.update({
            where: { wordId: word.wordId },
            data: {
              audioUrl: audioUrl,
              pronunciation: pronunciation,
            },
          });

          console.log(`Successfully updated word: ${word.word}`);
        } catch (error) {
          console.error(`Error enhancing word ${word.word}:`, error);
        }

        // Add a delay between word processing
        await sleep(1000);
      }

      // Add a larger delay between batches
      console.log(
        `Completed batch ${
          Math.floor(i / batchSize) + 1
        }, waiting before next batch...`
      );
      await sleep(3000);
    }

    console.log("Vocabulary enhancement process completed successfully!");
  } catch (error) {
    console.error("Error in enhancement process:", error);
  } finally {
    // Close the Prisma client
    await prisma.$disconnect();
  }
}

// Run the script
enhanceVocabularyData()
  .then(() => console.log("Script execution finished."))
  .catch((err) => console.error("Script execution failed:", err));
