import { PrismaClient } from "@prisma/client";
import { ChatSession, GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Seed script for generating vocabulary words using Google Gemini API
 *
 * This script connects to the Gemini API and generates vocabulary words
 * for different categories in the database.
 */

// Initialize Google Gemini API client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-pro" }); // Using gemini-pro for more stable results

// Prompt template for generating vocabulary
const prompt = `
Create a vocabulary list based on a given topic. The input is the name of the topic, and the output should be a JSON array containing objects with the following structure:

{
  "word": "<word>",
  "exampleSentence": "<sentence using the word>",
  "difficultyLevel": <number from 1 to 3>,
  "samePronunciations": ["<word1>", "<word2>", ...],
  "definition": "<definition>",
  "partOfSpeech": "<partOfSpeech>"
}

Requirements:
- 'word' is an English vocabulary word related to the topic (single word only)
- 'exampleSentence' is a clear, contextually appropriate sentence demonstrating the word's usage
- 'difficultyLevel' is an integer from 1 to 3, where 1 is easy, 2 is medium, and 3 is difficult
- 'samePronunciations' is an array of words with similar pronunciation but different meanings/spellings (at least 5 words)
- 'definition' is a clear, concise definition of the word
- 'partOfSpeech' is the grammatical category of the word (noun, verb, adjective, etc.)

Generate exactly 5 words for the given topic. Ensure the words are relevant, varied in difficulty, with natural and grammatically correct sentences.

Format your response as a valid JSON array without any explanatory text outside the array.
`;

/**
 * Parse the Gemini API response to extract JSON data
 *
 * @param res - Raw text response from Gemini API
 * @returns Parsed JSON data
 */
function parseGeminiResponse(res: string): any {
  try {
    // Clean up the response to extract just the JSON content
    const cleanedRes = res
      .replace(/```json\s*/g, "") // Remove JSON code block markers
      .replace(/```\s*/g, "") // Remove generic code block markers
      .replace(/"""/g, '\\"') // Fix escaped quotes
      .trim();

    // Try parsing the cleaned response
    return JSON.parse(cleanedRes);
  } catch (error) {
    console.error("Error parsing Gemini response:", error);
    console.error("Raw response:", res);
    return [];
  }
}

/**
 * Interface for the vocabulary word data from Gemini API
 */
interface GeminiResponse {
  word: string;
  exampleSentence: string;
  difficultyLevel: number;
  samePronunciations: string[];
  definition: string;
  partOfSpeech: string;
}

// Initialize Prisma client
const prisma = new PrismaClient();

/**
 * Sleep utility function
 *
 * @param ms - Milliseconds to sleep
 */
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Main function to generate vocabulary words for all topics
 */
async function generateVocabularyWords() {
  try {
    console.log("Starting vocabulary word generation...");

    // Get all vocabulary categories
    const listTopics = await prisma.category.findMany({
      where: {
        isGrammar: false,
      },
    });

    console.log(`Found ${listTopics.length} vocabulary categories.`);

    // Process each topic
    for (const topic of listTopics) {
      console.log(`Generating words for category: ${topic.categoryName}`);

      // Create a new chat session for each topic
      const chat = model.startChat({
        history: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 2048,
        },
      });

      // Generate multiple batches of words
      const batchCount = 3; // Generate 3 batches (15 words total per category)
      for (let i = 0; i < batchCount; i++) {
        try {
          console.log(
            `Generating batch ${i + 1}/${batchCount} for ${
              topic.categoryName
            }...`
          );

          // Send the topic name to Gemini
          const result = await chat.sendMessage(
            `Generate vocabulary words for the topic: ${topic.categoryName}`
          );
          const responseText = result.response.text();

          // Parse the response
          const words = parseGeminiResponse(responseText);

          if (!Array.isArray(words) || words.length === 0) {
            console.error(
              `Invalid response format for ${topic.categoryName}, batch ${
                i + 1
              }:`,
              responseText
            );
            continue;
          }

          // Map and prepare the data for database insertion
          const datas = words.map((word: GeminiResponse) => ({
            categoryId: topic.categoryId,
            paronymWords: word.samePronunciations || [],
            definition: word.definition,
            word: word.word,
            exampleSentence: word.exampleSentence,
            difficultyLevel: Math.min(
              Math.max(word.difficultyLevel || 1, 1),
              3
            ), // Ensure value is between 1-3
            imageUrl: "https://placewaifu.com/image/400/300",
            partOfSpeech: word.partOfSpeech || "unknown",
          }));

          console.log(
            `Generated ${datas.length} words for ${topic.categoryName} (batch ${
              i + 1
            })`
          );

          // Insert the words into the database
          await prisma.vocabularyWord.createMany({
            data: datas,
            skipDuplicates: true, // Skip any duplicate words
          });

          // Wait to avoid rate limiting
          await sleep(2000);
        } catch (error) {
          console.error(
            `Error in batch ${i + 1} for ${topic.categoryName}:`,
            error
          );
        }
      }

      // Wait between topics to avoid rate limiting
      await sleep(5000);
    }

    console.log("Vocabulary generation completed successfully!");
  } catch (error) {
    console.error("Error in vocabulary generation process:", error);
  } finally {
    // Close the Prisma client
    await prisma.$disconnect();
  }
}

// Run the script
generateVocabularyWords()
  .then(() => console.log("Script execution finished."))
  .catch((err) => console.error("Script execution failed:", err));
