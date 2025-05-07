import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Khởi tạo Gemini API client với model mới nhất
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" }); // Sử dụng model Pro có độ chính xác cao hơn

export async function POST(request: NextRequest) {
  try {
    const { transcript, referenceText, scores, words } = await request.json();

    if (!transcript || !referenceText || !scores) {
      return NextResponse.json(
        { error: "Transcript, reference text, and scores are required" },
        { status: 400 }
      );
    }

    console.log("Generating feedback for:", { transcript, referenceText });

    // Chuẩn bị dữ liệu
    const wordData =
      words?.map((word: any) => ({
        word: word.Word,
        accuracyScore: word.AccuracyScore,
        errorType: word.ErrorType,
      })) || [];

    try {
      // Tạo prompt chi tiết cho Gemini để nhận phản hồi chính xác hơn
      const prompt = `
Bạn là một huấn luyện viên phát âm tiếng Anh chuyên nghiệp. Người dùng đã ghi âm giọng nói của họ để thực hành phát âm.
Web Speech API đã nhận dạng lời nói của họ và chuyển thành văn bản.

So sánh dữ liệu sau:

1. Văn bản tham chiếu (text người dùng đang cố gắng đọc): "${referenceText}"
2. Phiên âm thực tế (text được nhận dạng từ giọng nói): "${transcript}"

Điểm đánh giá phát âm:
- Độ chính xác: ${scores.accuracy}/100
- Độ trôi chảy: ${scores.fluency}/100
- Độ đầy đủ: ${scores.completeness}/100
- Phát âm tổng thể: ${scores.pronunciation}/100

Đánh giá chi tiết từng từ:
${JSON.stringify(wordData, null, 2)}

Hãy cung cấp phản hồi chi tiết về phát âm của người dùng theo cấu trúc sau:

## 1. Đánh giá tổng quan
Đánh giá tổng quan về chất lượng phát âm dựa trên các điểm số và sự khác biệt giữa văn bản tham chiếu và phiên âm.

## 2. Phân tích lỗi
Xác định và giải thích các lỗi phát âm cụ thể, tập trung vào:
- Từ nào bị phát âm sai hoàn toàn
- Từ nào bị bỏ qua
- Lỗi phổ biến trong cách phát âm nguyên âm/phụ âm

## 3. Gợi ý cải thiện
Đưa ra 3-5 gợi ý cụ thể để cải thiện phát âm, tùy chỉnh theo lỗi thực tế của người dùng.

## 4. Bài tập luyện tập
Đề xuất 1-2 bài tập ngắn để giúp người dùng cải thiện phát âm.

## 5. Văn bản tham chiếu với từ phát âm sai được đánh dấu
Tạo một phiên bản của văn bản tham chiếu, trong đó các từ phát âm sai hoặc bị bỏ qua được đánh dấu bằng dấu ** (ví dụ: "This is **really** good").

Định dạng phản hồi bằng Markdown để dễ đọc và thân thiện với người dùng.
`;

      // Gọi Gemini API với prompt chi tiết
      const result = await model.generateContent(prompt);
      const feedback = result.response.text() || "Không thể tạo phản hồi";
      console.log("Feedback generated successfully");

      return NextResponse.json({ feedback });
    } catch (error: any) {
      console.error("Error calling Gemini API:", error);

      // Fallback: Tạo feedback dựa trên thuật toán khi API thất bại
      const lowScoreThreshold = 75;
      const hasLowScore =
        scores.accuracy < lowScoreThreshold ||
        scores.fluency < lowScoreThreshold ||
        scores.completeness < lowScoreThreshold;

      // Tạo danh sách các từ bị phát âm sai và các từ bị bỏ qua
      const mispronounced =
        words
          ?.filter((word) => word.ErrorType !== "None")
          .map((word) => word.Word) || [];

      // Tạo phiên bản đánh dấu của văn bản tham chiếu
      const referenceWords = referenceText.split(" ");
      const markedText = referenceWords
        .map((word) => {
          const matchingWord = words?.find(
            (w) => w.Word.toLowerCase() === word.toLowerCase()
          );
          if (matchingWord && matchingWord.ErrorType !== "None") {
            return `**${word}**`;
          }
          return word;
        })
        .join(" ");

      // Tạo phản hồi cơ bản khi không có API
      let feedback = `
# Đánh giá Phát âm

## 1. Đánh giá tổng quan
${
  hasLowScore
    ? "Bạn cần cải thiện một số khía cạnh trong phát âm của mình. Cố gắng tập trung vào việc phát âm rõ ràng và đầy đủ các từ."
    : "Phát âm của bạn khá tốt, với một số điểm nhỏ cần điều chỉnh để hoàn thiện hơn."
}

## 2. Phân tích lỗi
${
  mispronounced.length > 0
    ? `Các từ có vấn đề về phát âm: ${mispronounced.join(", ")}`
    : "Không phát hiện lỗi phát âm nghiêm trọng."
}

Transcript của bạn: "${transcript}"
Văn bản tham chiếu: "${referenceText}"

## 3. Gợi ý cải thiện
- Thực hành phát âm từng từ riêng lẻ trước khi ghép thành câu
- Chú ý đến nhịp điệu và trọng âm trong câu
- Ghi âm giọng nói của bạn và so sánh với người bản ngữ
- Sử dụng các ứng dụng phát âm để nghe cách phát âm chuẩn

## 4. Bài tập luyện tập
- Đọc to văn bản này 5 lần, mỗi lần tăng tốc độ nhưng vẫn giữ độ rõ ràng
- Ghi âm bản thân khi đọc và nghe lại để tự đánh giá

## 5. Văn bản với từ phát âm sai được đánh dấu
${markedText}

Tiếp tục cố gắng! Việc thực hành đều đặn sẽ giúp cải thiện phát âm của bạn.
`;

      return NextResponse.json({ feedback });
    }
  } catch (error: any) {
    console.error("Error generating feedback:", error);

    const errorMessage =
      error.message || error.cause?.message || "Unknown error occurred";

    return NextResponse.json(
      { error: `Failed to generate feedback: ${errorMessage}` },
      { status: 500 }
    );
  }
}
