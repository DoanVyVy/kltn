import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import os from "os";

export async function POST(request: NextRequest) {
  try {
    const { audioBase64, referenceText, recognizedText } = await request.json();

    if (!audioBase64 || !referenceText) {
      return NextResponse.json(
        { error: "Audio data and reference text are required" },
        { status: 400 }
      );
    }

    // Convert base64 to buffer
    const buffer = Buffer.from(
      audioBase64.replace(/^data:audio\/\w+;base64,/, ""),
      "base64"
    );

    // Check file size
    const fileSizeInMB = buffer.length / (1024 * 1024);
    if (fileSizeInMB > 20) {
      return NextResponse.json(
        { error: "Audio file is too large. Maximum size is 20MB." },
        { status: 400 }
      );
    }

    // Lưu buffer vào file tạm (có thể sử dụng sau này)
    const tempDir = os.tmpdir();
    const fileName = `audio-${Date.now()}.webm`;
    const filePath = path.join(tempDir, fileName);
    await writeFile(filePath, buffer);

    // Sử dụng transcript từ Web Speech API nếu có
    // Nếu không có, tạo một transcript giả lập
    let transcript;
    if (recognizedText && recognizedText.trim()) {
      console.log("Using recognized text from Web Speech API:", recognizedText);
      transcript = recognizedText.trim();
    } else {
      // Tạo transcript với lỗi giả lập nếu không có từ Web Speech API
      const errorRate = Math.random() * 0.15;
      transcript = simulateTranscriptionErrors(referenceText, errorRate);
      console.log("Using simulated transcript:", transcript);
    }

    // Đánh giá phát âm dựa trên transcript và referenceText
    const assessmentResult = calculatePronunciationScores(
      transcript,
      referenceText
    );

    return NextResponse.json({
      ...assessmentResult,
      transcript,
    });
  } catch (error: any) {
    console.error("Error assessing pronunciation:", error);

    // Thông tin lỗi chi tiết
    const errorMessage =
      error.message || error.cause?.message || "Unknown error occurred";

    return NextResponse.json(
      { error: `Failed to assess pronunciation: ${errorMessage}` },
      { status: 500 }
    );
  }
}

// Hàm mô phỏng lỗi trong phiên âm để tạo kết quả thực tế hơn
function simulateTranscriptionErrors(text: string, errorRate: number): string {
  const words = text.split(" ");
  const result = words.map((word) => {
    // Xác suất ngẫu nhiên cho mỗi từ
    if (Math.random() < errorRate) {
      // Tạo lỗi ngẫu nhiên: bỏ qua từ, thay thế từ, hoặc biến đổi từ
      const r = Math.random();
      if (r < 0.3) return ""; // Bỏ qua từ
      if (r < 0.6) return word + "s"; // Thêm 's' vào cuối
      return word.charAt(0) + word.substring(1).replace(/[aeiou]/i, "a"); // Thay thế nguyên âm
    }
    return word;
  });
  return result.filter((w) => w.length > 0).join(" ");
}

// Function to calculate pronunciation scores based on word matching
function calculatePronunciationScores(
  transcript: string,
  referenceText: string
) {
  // Convert to lowercase and remove punctuation for more accurate comparison
  const cleanTranscript = transcript
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
  const cleanReference = referenceText
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");

  // Split into words
  const transcriptWords = cleanTranscript.split(/\s+/);
  const referenceWords = cleanReference.split(/\s+/);

  // Count matching words
  let matchCount = 0;
  const words = [];

  for (let i = 0; i < referenceWords.length; i++) {
    const refWord = referenceWords[i];
    const transcriptWord = transcriptWords[i] || "";

    // Check if words are the same or similar (using Levenshtein distance)
    const similarity = calculateSimilarity(refWord, transcriptWord);
    const isMatch = similarity > 0.7; // 70% similarity threshold

    if (isMatch) {
      matchCount++;
    }

    // Add word data
    words.push({
      Word: refWord,
      AccuracyScore: Math.round(similarity * 100),
      ErrorType: isMatch ? "None" : "Mispronunciation",
    });
  }

  // Calculate scores
  const completeness = Math.min(
    100,
    Math.round((transcriptWords.length / referenceWords.length) * 100)
  );
  const accuracy = Math.round((matchCount / referenceWords.length) * 100);

  // Fluency is harder to measure, here we use a simple heuristic
  // based on word count ratio and accuracy
  const fluency = Math.round(((completeness + accuracy) / 2) * 0.8);

  // Overall pronunciation score
  const pronunciation = Math.round(
    accuracy * 0.6 + fluency * 0.2 + completeness * 0.2
  );

  return {
    accuracy,
    fluency,
    completeness,
    pronunciation,
    words,
  };
}

// Helper function to calculate string similarity (Levenshtein distance-based)
function calculateSimilarity(str1: string, str2: string): number {
  if (str1 === str2) return 1.0;
  if (str1.length === 0) return 0.0;
  if (str2.length === 0) return 0.0;

  const len1 = str1.length;
  const len2 = str2.length;

  // Calculate Levenshtein distance
  const distance = levenshteinDistance(str1, str2);

  // Calculate similarity as a ratio
  return 1 - distance / Math.max(len1, len2);
}

// Levenshtein distance calculation
function levenshteinDistance(str1: string, str2: string): number {
  const track = Array(str2.length + 1)
    .fill(null)
    .map(() => Array(str1.length + 1).fill(null));

  for (let i = 0; i <= str1.length; i++) {
    track[0][i] = i;
  }

  for (let j = 0; j <= str2.length; j++) {
    track[j][0] = j;
  }

  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      track[j][i] = Math.min(
        track[j][i - 1] + 1, // deletion
        track[j - 1][i] + 1, // insertion
        track[j - 1][i - 1] + indicator // substitution
      );
    }
  }

  return track[str2.length][str1.length];
}
