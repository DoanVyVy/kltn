import { NextRequest, NextResponse } from "next/server";

// Define the route handler for POST requests
export async function POST(request: NextRequest) {
  try {
    // Parse the JSON body from the request
    const requestData = await request.json();

    // Get API key from environment variables
    const apiKey =
      process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    // Only use mock response if the API key is missing
    const useMockResponse = !apiKey;

    if (!apiKey) {
      console.error("Gemini API key is missing");
      // Continue with mock data
    } else {
      console.log("Gemini credentials loaded, key length:", apiKey.length);
    }

    // Construct the API URL with the key
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;

    if (useMockResponse) {
      console.log("Using mock Gemini response because API key is missing");

      // Extract the text to evaluate from the request payload
      const promptText = requestData.contents[0].parts[0].text;
      const textToEvaluateMatch = promptText.match(/following text: "([^"]+)"/);
      const transcribedTextMatch = promptText.match(
        /person said is: "([^"]+)"/
      );

      const textToEvaluate = textToEvaluateMatch
        ? textToEvaluateMatch[1]
        : "Unknown text";
      const transcribedText = transcribedTextMatch
        ? transcribedTextMatch[1]
        : textToEvaluate;

      // Construct a mock response similar to what Gemini API would return
      const mockResponse = {
        candidates: [
          {
            content: {
              parts: [
                {
                  text: JSON.stringify({
                    overall: 85,
                    details: {
                      accuracy: 82,
                      fluency: 88,
                      prosody: 78,
                      textMatch: 90,
                    },
                    feedback: [
                      "Your pronunciation was generally clear and understandable.",
                      "Work on maintaining consistent intonation patterns throughout sentences.",
                      "Pay attention to the stress on multi-syllable words.",
                    ],
                    wordAnalysis: [
                      {
                        word: textToEvaluate.split(/\s+/)[0],
                        correctlyPronounced: true,
                        feedback: "Well pronounced with correct stress.",
                      },
                    ],
                    transcribedText: transcribedText,
                    originalText: textToEvaluate,
                  }),
                },
              ],
              role: "model",
            },
            finishReason: "STOP",
            index: 0,
            safetyRatings: [],
          },
        ],
        promptFeedback: {
          safetyRatings: [],
        },
      };

      return NextResponse.json(mockResponse);
    }

    console.log("Sending request to Gemini API");

    // Forward the request to the Gemini API
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    });

    // Check if response is successful
    if (!response.ok) {
      console.error(
        `Gemini API error: ${response.status} ${response.statusText}`
      );
      const errorText = await response.text();
      console.error("Error details:", errorText);

      // Extract the text to evaluate from the request payload for fallback
      const promptText = requestData.contents[0].parts[0].text;
      const textToEvaluateMatch = promptText.match(/following text: "([^"]+)"/);
      const transcribedTextMatch = promptText.match(
        /person said is: "([^"]+)"/
      );

      const textToEvaluate = textToEvaluateMatch
        ? textToEvaluateMatch[1]
        : "Unknown text";
      const transcribedText = transcribedTextMatch
        ? transcribedTextMatch[1]
        : "";

      // Return a mock response when API fails
      return NextResponse.json({
        candidates: [
          {
            content: {
              parts: [
                {
                  text: JSON.stringify({
                    overall: 75,
                    details: {
                      accuracy: 70,
                      fluency: 75,
                      prosody: 68,
                      textMatch: 85,
                    },
                    feedback: [
                      "API call failed, this is fallback feedback.",
                      "Try to speak more clearly and at a consistent pace.",
                      "Pay attention to word endings and consonant sounds.",
                    ],
                    wordAnalysis: [
                      {
                        word: textToEvaluate.split(/\s+/)[0],
                        correctlyPronounced: true,
                        feedback: "Generally pronounced correctly.",
                      },
                    ],
                    transcribedText: transcribedText || textToEvaluate,
                    originalText: textToEvaluate,
                  }),
                },
              ],
              role: "model",
            },
            finishReason: "STOP",
            index: 0,
          },
        ],
      });
    }

    // Parse and return the response data
    const responseData = await response.json();
    console.log("Gemini API request successful");

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error in Gemini proxy:", error);

    return NextResponse.json(
      { error: "Failed to process request", details: error.message },
      { status: 500 }
    );
  }
}
