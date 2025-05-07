import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

// Define route handler for POST requests
export async function POST(request: NextRequest) {
  try {
    // Create form data from request
    const formData = await request.formData();

    // Get audio data from form data
    const audioData = formData.get("audio");

    if (!audioData) {
      return NextResponse.json(
        { error: "No audio data provided" },
        { status: 400 }
      );
    }

    // Get API credentials from environment variables
    const appId =
      process.env.IFLYTEK_APP_ID || process.env.NEXT_PUBLIC_IFLYTEK_APP_ID;
    const apiKey =
      process.env.IFLYTEK_API_KEY || process.env.NEXT_PUBLIC_IFLYTEK_API_KEY;
    const apiSecret =
      process.env.IFLYTEK_API_SECRET ||
      process.env.NEXT_PUBLIC_IFLYTEK_API_SECRET;

    // Only use mock response if the credentials are missing
    const useMockResponse = !appId || !apiKey || !apiSecret;

    if (useMockResponse) {
      console.log("Using mock iFlytek response (missing credentials)");

      // Return a mock response similar to what iFlytek API would return
      return NextResponse.json({
        code: 0,
        data: {
          result: "Hello, this is a mock transcription.",
          confidence: 0.8,
        },
        message: "Success (mock)",
      });
    }

    console.log("Sending request to iFlytek API with real credentials");

    // Prepare for iFlytek API request
    const timestamp = Math.floor(Date.now() / 1000).toString();

    // Convert audio data to string if it's not already
    const audioString =
      typeof audioData === "string"
        ? audioData
        : Buffer.from(await (audioData as Blob).arrayBuffer()).toString(
            "base64"
          );

    // Calculate signature using HMAC-SHA256
    const signatureOrigin = `${apiKey}${timestamp}${audioString.length}`;
    const signature = crypto
      .createHmac("sha256", apiSecret || "")
      .update(signatureOrigin)
      .digest("hex");

    // Construct the API URL
    const url = "https://api.xfyun.cn/v1/service/v1/iat";

    // Build X-Param
    const xParam = {
      engine_type: "sms16k",
      aue: "raw",
      language: "en_us",
    };

    // Make the request to iFlytek API
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "X-Appid": appId,
        "X-CurTime": timestamp,
        "X-Param": Buffer.from(JSON.stringify(xParam)).toString("base64"),
        "X-CheckSum": signature,
        "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
      },
      body: new URLSearchParams({
        audio: audioString,
      }),
    });

    if (!response.ok) {
      console.error(
        `iFlytek API error: ${response.status} ${response.statusText}`
      );
      const errorText = await response.text();
      console.error("Error details:", errorText);

      // Return a fallback response on API error
      return NextResponse.json({
        code: 0,
        data: {
          result: "Speech recognition unavailable, please try again.",
          confidence: 0,
        },
        message: "iFlytek API error (fallback)",
      });
    }

    // Parse and return the API response
    const data = await response.json();
    console.log("iFlytek API response successful");

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in iFlytek proxy:", error);

    // Return error response
    return NextResponse.json(
      { error: "Failed to process speech", details: error.message },
      { status: 500 }
    );
  }
}
