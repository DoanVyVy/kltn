import { PrismaClient } from "@prisma/client";
import AudioService from "../services/audio-service";

/**
 * Script to generate audio files for vocabulary words using iFlytek TTS API
 *
 * This script finds all vocabulary words that don't have an audio URL assigned,
 * generates audio for each word using the iFlytek TTS API, and updates the database
 * with the new audio URLs.
 */

// Initialize Prisma client
const prisma = new PrismaClient();

// Sleep utility function
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Main function to process words
async function processVocabularyWords() {
  console.log("Starting audio generation for vocabulary words...");

  try {
    // Get all words without audio URLs
    const listWords = await prisma.vocabularyWord.findMany({
      where: {
        audioUrl: null,
      },
    });

    console.log(`Found ${listWords.length} words without audio.`);

    // Process words in batches to avoid overwhelming the API
    const batchSize = 10;
    for (let i = 0; i < listWords.length; i += batchSize) {
      const batch = listWords.slice(i, i + batchSize);
      console.log(`Processing batch ${Math.floor(i / batchSize) + 1}...`);

      // Generate audio for each word in the batch
      for (const word of batch) {
        try {
          console.log(`Generating audio for: ${word.word}`);

          // Generate audio using the iFlytek TTS service
          const audioUrl = await AudioService.textToSpeech(word.word);

          // Update the word with the new audio URL
          await prisma.vocabularyWord.update({
            where: { wordId: word.wordId },
            data: {
              audioUrl: audioUrl,
            },
          });

          console.log(`Successfully updated word: ${word.word} with audio URL`);

          // Add a small delay between requests
          await sleep(500);
        } catch (e) {
          console.error(`Error updating word: ${word.word}`, e);
        }
      }

      // Add a larger delay between batches
      console.log(
        `Completed batch ${
          Math.floor(i / batchSize) + 1
        }, waiting before next batch...`
      );
      await sleep(3000);
    }

    console.log("Audio generation process completed successfully!");
  } catch (error) {
    console.error("Error in audio generation process:", error);
  } finally {
    // Close the Prisma client when done
    await prisma.$disconnect();
  }
}

// Run the script
processVocabularyWords()
  .then(() => console.log("Script execution finished."))
  .catch((err) => console.error("Script execution failed:", err));
