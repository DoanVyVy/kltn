import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const requestData = await request.json();

    const apiKey =
      process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!apiKey) {
      console.error("❌ Gemini API key is missing");
      return NextResponse.json(
        { error: "Missing Gemini API key" },
        { status: 500 }
      );
    }

    console.log("✅ Gemini key loaded, length:", apiKey.length);

    // Sử dụng Gemini Flash (phiên bản 1.5)
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    console.log("➡️ Sending request to Gemini 1.5 Flash API...");

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `❌ Gemini API error: ${response.status} ${response.statusText}`
      );
      console.error("Details:", errorText);

      return NextResponse.json(
        {
          error: "Gemini API call failed",
          status: response.status,
          details: errorText,
        },
        { status: response.status }
      );
    }

    const responseData = await response.json();
    console.log("✅ Gemini 1.5 Flash response received");

    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error("🔥 Error in Gemini proxy:", error);

    return NextResponse.json(
      {
        error: "Unhandled error in Gemini proxy",
        details: error.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
