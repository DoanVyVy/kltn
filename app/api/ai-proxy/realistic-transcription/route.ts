import { NextResponse } from "next/server";

/**
 * API handler to generate realistic speech recognition transcriptions
 * Using AI to simulate how real speech recognition would handle spoken audio
 */
export async function POST(req: Request) {
  try {
    const { actualTranscript, referenceText, language } = await req.json();

    if (!actualTranscript) {
      return NextResponse.json(
        { error: "Missing actual transcript" },
        { status: 400 }
      );
    }

    // Use Gemini API through Google AI SDK for Node.js
    try {
      const geminiPrompt = `
# Speech Recognition Simulation Task

## Input:
- Actual transcript from speech recognition system: "${actualTranscript}"
- Reference text that user was trying to say: "${referenceText}"
- Language: ${language === "vi" ? "Vietnamese" : "English"}

## Task:
Create a realistic speech recognition transcript that simulates how a real speech recognition system would transcribe the person's speech. Include common speech recognition issues:

1. Natural speech disfluencies like "um", "uh", "ờ", "ừm" (Vietnamese)
2. Occasional word omissions
3. Slight mishearing of some words
4. Some words running together
5. Hesitations and restarts
6. Punctuation issues

## Instructions:
- Base primarily on the actual transcript but make it more realistic
- For people learning pronunciation, the transcript might contain mispronunciations
- Don't simply use the reference text - work from the actual transcript
- Include some realistic errors that speech recognition systems make
- Don't use quotation marks in your response
- Respond ONLY with the realistic transcript - no explanations

## Output (just the realistic transcript):
`;

      // Call the AI service
      const response = await fetch(
        process.env.GEMINI_API_URL ||
          "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${
              process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || ""
            }`,
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: geminiPrompt,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 800,
              topP: 0.9,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`AI service responded with status: ${response.status}`);
      }

      const data = await response.json();
      let realisticTranscript = "";

      // Extract text from Gemini API response
      if (data.candidates && data.candidates[0]?.content?.parts) {
        realisticTranscript = data.candidates[0].content.parts[0]?.text || "";

        // Clean up response (remove markdown formatting if present)
        realisticTranscript = realisticTranscript
          .replace(/```[\s\S]*?```/g, "") // Remove code blocks
          .replace(/\*\*/g, "") // Remove bold markdown
          .replace(/\*/g, "") // Remove italic markdown
          .trim();
      }

      console.log("Generated realistic transcription:", realisticTranscript);

      // If AI failed to generate something useful, use a fallback
      if (!realisticTranscript || realisticTranscript.length < 3) {
        // Create simple realistic simulation
        realisticTranscript = simulateRealisticTranscription(
          actualTranscript,
          language
        );
      }

      return NextResponse.json({
        realisticTranscript,
        source: "gemini_ai",
      });
    } catch (aiError) {
      console.error("AI service error:", aiError);

      // Fallback to simple simulation
      const realisticTranscript = simulateRealisticTranscription(
        actualTranscript,
        language
      );

      return NextResponse.json({
        realisticTranscript,
        source: "fallback_simulation",
      });
    }
  } catch (error) {
    console.error("Error in realistic transcription API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Simple fallback function to simulate realistic transcription when AI is unavailable
 */
function simulateRealisticTranscription(
  actualTranscript: string,
  language: string
): string {
  const hesitations =
    language === "vi"
      ? [
          "ờ ",
          "ừm ",
          "à ",
          "ơ kìa ",
          "để xem ",
          "vâng ",
          "thật ra là ",
          "ý tôi là ",
        ]
      : ["um ", "uh ", "er ", "hmm ", "like ", "you know ", "well ", "I mean "];

  // Add random hesitations
  let result = actualTranscript;
  const words = result.split(" ");

  // If few words, add a hesitation at the start
  if (words.length < 5 && Math.random() < 0.7) {
    result =
      hesitations[Math.floor(Math.random() * hesitations.length)] + result;
  }

  // Add hesitations at random points for longer text
  if (words.length >= 5) {
    const positions = [1, Math.floor(words.length / 2)].filter(
      () => Math.random() < 0.5
    );

    positions.forEach((pos) => {
      if (pos < words.length) {
        words.splice(
          pos,
          0,
          hesitations[Math.floor(Math.random() * hesitations.length)].trim()
        );
      }
    });

    result = words.join(" ");
  }

  // Randomly remove 1-2 words for longer texts
  if (words.length > 7 && Math.random() < 0.3) {
    const removeCount = Math.random() < 0.7 ? 1 : 2;
    for (let i = 0; i < removeCount; i++) {
      const removePos = Math.floor(Math.random() * words.length);
      if (words.length > removePos) {
        words.splice(removePos, 1);
      }
    }
    result = words.join(" ");
  }

  // Lower probability of adding punctuation
  result = result
    .replace(/\s+/g, " ")
    .replace(/\.\s/g, " ")
    .replace(/\,\s/g, " ");

  // Add a period at the end with low probability
  if (Math.random() < 0.3) {
    result = result + ".";
  }

  return result.trim();
}
