import { NextRequest, NextResponse } from "next/server";

// Define the route handler for POST requests
export async function POST(request: NextRequest) {
  try {
    // Parse the JSON body from the request
    const requestData = await request.json();

    // Get API key from environment variables
    const apiKey =
      process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!apiKey) {
      console.error("Gemini API key is missing");
      return NextResponse.json(
        { error: "API key is missing" },
        { status: 500 }
      );
    }

    // Construct the API URL with the key
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;

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

      return NextResponse.json(
        { error: `API request failed: ${response.status}`, details: errorText },
        { status: response.status }
      );
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
