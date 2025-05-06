import { useMemo } from "react";
import { GrammarExercise as GrammarExerciseType } from "./grammar-exercise";

interface Grammar {
  contentId: number;
  categoryId: number;
  title: string;
  explanation: string;
  examples?: string;
  notes?: string;
  orderIndex?: number;
}

export function useGrammarPracticeGenerator(grammar: Grammar | null) {
  return useMemo(() => {
    if (!grammar) return [];

    // Extract title and examples for generating exercises
    const { title, explanation, examples = "" } = grammar;

    // Initialize exercises array
    const exercises: GrammarExerciseType[] = [];

    // Determine grammar type for targeted exercises
    const grammarType = getGrammarType(title, explanation);

    // Generate exercises based on grammar type
    switch (grammarType) {
      case "presentSimple":
        addPresentSimpleExercises(exercises, title, explanation, examples);
        break;
      case "pastSimple":
        addPastSimpleExercises(exercises, title, explanation, examples);
        break;
      case "presentContinuous":
        addPresentContinuousExercises(exercises, title, explanation, examples);
        break;
      case "presentPerfect":
        addPresentPerfectExercises(exercises, title, explanation, examples);
        break;
      case "conditional":
        addConditionalExercises(exercises, title, explanation, examples);
        break;
      case "passive":
        addPassiveExercises(exercises, title, explanation, examples);
        break;
      default:
        addGenericExercises(exercises, title, explanation, examples);
    }

    // Return the exercises with unique IDs
    return exercises.map((exercise, index) => ({
      ...exercise,
      id: index + 1,
    }));
  }, [grammar]);
}

// Helper function to determine grammar type
function getGrammarType(title: string, explanation: string): string {
  title = title.toLowerCase();
  explanation = explanation.toLowerCase();

  if (
    title.includes("present simple") ||
    explanation.includes("present simple")
  ) {
    return "presentSimple";
  }
  if (title.includes("past simple") || explanation.includes("past simple")) {
    return "pastSimple";
  }
  if (
    title.includes("present continuous") ||
    explanation.includes("present continuous")
  ) {
    return "presentContinuous";
  }
  if (
    title.includes("present perfect") ||
    explanation.includes("present perfect")
  ) {
    return "presentPerfect";
  }
  if (title.includes("conditional") || explanation.includes("conditional")) {
    return "conditional";
  }
  if (title.includes("passive") || explanation.includes("passive voice")) {
    return "passive";
  }

  return "generic";
}

// Function to extract example sentences from the grammar content
function extractExamples(examples: string): string[] {
  if (!examples) return [];
  return examples
    .split("\n")
    .filter((line) => line.trim().length > 0)
    .map((line) => line.trim());
}

// Generate Present Simple exercises
function addPresentSimpleExercises(
  exercises: GrammarExerciseType[],
  title: string,
  explanation: string,
  examples: string
) {
  // Multiple choice exercise
  exercises.push({
    id: 0,
    type: "multipleChoice",
    question: "Chọn câu sử dụng đúng Present Simple:",
    options: [
      "She work in a bank.",
      "She works in a bank.",
      "She is work in a bank.",
      "She are working in a bank.",
    ],
    answer: "She works in a bank.",
    explanation:
      "Đối với ngôi thứ ba số ít (she, he, it), động từ trong Present Simple phải thêm 's'.",
    hint: "Chú ý đến dạng đúng của động từ ở ngôi thứ ba số ít.",
  });

  // Fill in the blanks exercise
  exercises.push({
    id: 0,
    type: "fillBlank",
    question: "John usually (go) _____ to work by bus.",
    answer: ["goes"],
    explanation:
      "Với chủ ngữ ngôi thứ ba số ít 'John', động từ 'go' phải chia thành 'goes' trong thì hiện tại đơn.",
    hint: "Động từ ở ngôi thứ ba số ít thêm 's' hoặc 'es'.",
  });

  // True/False exercise
  exercises.push({
    id: 0,
    type: "trueFalse",
    question:
      "Trong thì hiện tại đơn, câu phủ định với chủ ngữ 'he' sử dụng 'do not'.",
    answer: "false",
    explanation:
      "Câu phủ định với chủ ngữ là ngôi thứ ba số ít (he, she, it) phải sử dụng 'does not' (doesn't) thay vì 'do not'.",
    hint: "Với ngôi thứ 3 số ít sử dụng trợ động từ nào trong câu phủ định?",
  });

  // Reorder exercise
  exercises.push({
    id: 0,
    type: "reorder",
    question: "Sắp xếp các từ để tạo thành câu hỏi thì hiện tại đơn:",
    answer: ["Do", "you", "play", "tennis", "every", "weekend", "?"],
    explanation:
      "Câu hỏi thì hiện tại đơn bắt đầu với trợ động từ 'do/does', sau đó là chủ ngữ, và động từ nguyên thể.",
    hint: "Câu hỏi Yes/No trong thì hiện tại đơn bắt đầu với 'Do' hoặc 'Does'.",
  });
}

// Generate Past Simple exercises
function addPastSimpleExercises(
  exercises: GrammarExerciseType[],
  title: string,
  explanation: string,
  examples: string
) {
  // Multiple choice exercise
  exercises.push({
    id: 0,
    type: "multipleChoice",
    question: "Chọn câu sử dụng đúng Past Simple:",
    options: [
      "She goes to Paris last year.",
      "She went to Paris last year.",
      "She has gone to Paris last year.",
      "She had went to Paris last year.",
    ],
    answer: "She went to Paris last year.",
    explanation:
      "Thì quá khứ đơn sử dụng dạng quá khứ của động từ (V2). Động từ 'go' có dạng quá khứ là 'went'.",
    hint: "Past Simple sử dụng dạng quá khứ của động từ (V2).",
  });

  // Fill in the blank exercise
  exercises.push({
    id: 0,
    type: "fillBlank",
    question: "Yesterday, I (visit) _____ my grandmother.",
    answer: ["visited"],
    explanation:
      "Với thì quá khứ đơn, động từ phải chia ở dạng quá khứ. Động từ 'visit' ở quá khứ thêm -ed thành 'visited'.",
    hint: "Thêm -ed cho hầu hết các động từ thường.",
  });

  // True/False exercise
  exercises.push({
    id: 0,
    type: "trueFalse",
    question:
      "Trong thì quá khứ đơn, tất cả các động từ đều thêm '-ed' để tạo dạng quá khứ.",
    answer: "false",
    explanation:
      "Không phải tất cả động từ đều thêm '-ed'. Có nhiều động từ bất quy tắc có dạng quá khứ riêng không theo quy tắc (ví dụ: go → went, see → saw).",
    hint: "Hãy nhớ về các động từ bất quy tắc trong tiếng Anh.",
  });

  // Reorder exercise
  exercises.push({
    id: 0,
    type: "reorder",
    question: "Sắp xếp các từ để tạo thành câu hỏi thì quá khứ đơn:",
    answer: ["Did", "they", "arrive", "on", "time", "?"],
    explanation:
      "Câu hỏi thì quá khứ đơn bắt đầu với 'Did', sau đó là chủ ngữ và động từ nguyên thể (không chia).",
    hint: "Sử dụng 'Did' + subject + verb (nguyên thể).",
  });
}

// Generate Present Continuous exercises
function addPresentContinuousExercises(
  exercises: GrammarExerciseType[],
  title: string,
  explanation: string,
  examples: string
) {
  // Multiple choice exercise
  exercises.push({
    id: 0,
    type: "multipleChoice",
    question: "Chọn câu sử dụng đúng Present Continuous:",
    options: [
      "They playing basketball now.",
      "They are play basketball now.",
      "They are playing basketball now.",
      "They plays basketball now.",
    ],
    answer: "They are playing basketball now.",
    explanation:
      "Thì hiện tại tiếp diễn được cấu tạo từ be (am/is/are) + V-ing.",
    hint: "Thì hiện tại tiếp diễn cần có trợ động từ 'be' và động từ chính thêm '-ing'.",
  });

  // Fill in the blank exercise
  exercises.push({
    id: 0,
    type: "fillBlank",
    question: "Look! The baby (cry) _____ right now.",
    answer: ["is crying"],
    explanation:
      "Với chủ ngữ 'The baby' (ngôi thứ ba số ít), ta sử dụng 'is' và thêm '-ing' cho động từ: is crying.",
    hint: "Sử dụng 'is' với chủ ngữ ngôi thứ 3 số ít và thêm '-ing' vào động từ chính.",
  });

  // True/False exercise
  exercises.push({
    id: 0,
    type: "trueFalse",
    question:
      "Chúng ta có thể sử dụng thì hiện tại tiếp diễn với tất cả các loại động từ, bao gồm các động từ chỉ trạng thái như 'know', 'like', 'believe'.",
    answer: "false",
    explanation:
      "Không nên sử dụng thì hiện tại tiếp diễn với các động từ chỉ trạng thái (stative verbs) như know, like, believe, understand, v.v.",
    hint: "Hãy nhớ về nhóm động từ chỉ trạng thái (stative verbs).",
  });

  // Reorder exercise
  exercises.push({
    id: 0,
    type: "reorder",
    question: "Sắp xếp các từ để tạo thành câu thì hiện tại tiếp diễn:",
    answer: ["She", "is", "studying", "for", "her", "exam", "now"],
    explanation:
      "Thứ tự chuẩn của câu thì hiện tại tiếp diễn là: Chủ ngữ + be (am/is/are) + V-ing + bổ ngữ.",
    hint: "Để ý vị trí của trợ động từ 'is' và dạng động từ thêm '-ing'.",
  });
}

// Generate Present Perfect exercises
function addPresentPerfectExercises(
  exercises: GrammarExerciseType[],
  title: string,
  explanation: string,
  examples: string
) {
  // Multiple choice exercise
  exercises.push({
    id: 0,
    type: "multipleChoice",
    question: "Chọn câu sử dụng đúng Present Perfect:",
    options: [
      "I lived here for 10 years.",
      "I have lived here for 10 years.",
      "I am living here for 10 years.",
      "I was living here for 10 years.",
    ],
    answer: "I have lived here for 10 years.",
    explanation:
      "Thì hiện tại hoàn thành được dùng cho hành động bắt đầu trong quá khứ và kéo dài đến hiện tại. Câu này sử dụng đúng cấu trúc have/has + past participle.",
    hint: "Present Perfect sử dụng cấu trúc have/has + past participle.",
  });

  // Fill in the blank exercise
  exercises.push({
    id: 0,
    type: "fillBlank",
    question: "She (never / visit) _____ Japan before.",
    answer: ["has never visited"],
    explanation:
      "Với chủ ngữ 'She', ta sử dụng 'has' làm trợ động từ, từ phủ định 'never' đặt giữa 'has' và động từ chính, và động từ 'visit' chia ở dạng quá khứ phân từ 'visited'.",
    hint: "Sử dụng has/have + never + past participle.",
  });

  // True/False exercise
  exercises.push({
    id: 0,
    type: "trueFalse",
    question:
      "Có thể sử dụng Present Perfect với các từ chỉ thời gian cụ thể trong quá khứ như 'yesterday', 'last week'.",
    answer: "false",
    explanation:
      "Không sử dụng Present Perfect với các từ chỉ thời gian cụ thể trong quá khứ. Thay vào đó, ta sử dụng Past Simple.",
    hint: "Present Perfect không kết hợp với các trạng từ chỉ thời gian xác định trong quá khứ.",
  });

  // Reorder exercise
  exercises.push({
    id: 0,
    type: "reorder",
    question: "Sắp xếp các từ để tạo thành câu thì hiện tại hoàn thành:",
    answer: ["They", "have", "already", "finished", "the", "project"],
    explanation:
      "Thứ tự chuẩn của câu thì hiện tại hoàn thành là: Chủ ngữ + have/has + (trạng từ) + past participle + bổ ngữ.",
    hint: "Chú ý vị trí của 'already' trong câu Present Perfect.",
  });
}

// Generate Conditional exercises
function addConditionalExercises(
  exercises: GrammarExerciseType[],
  title: string,
  explanation: string,
  examples: string
) {
  // Multiple choice exercise
  exercises.push({
    id: 0,
    type: "multipleChoice",
    question: "Chọn câu điều kiện loại 2 đúng:",
    options: [
      "If I win the lottery, I will buy a new house.",
      "If I won the lottery, I would buy a new house.",
      "If I had won the lottery, I would have bought a new house.",
      "If I win the lottery, I would buy a new house.",
    ],
    answer: "If I won the lottery, I would buy a new house.",
    explanation:
      "Câu điều kiện loại 2 dùng mệnh đề if + simple past tense và mệnh đề chính + would + V.",
    hint: "Câu điều kiện loại 2 diễn tả điều không có thật ở hiện tại.",
  });

  // Fill in the blank exercise
  exercises.push({
    id: 0,
    type: "fillBlank",
    question: "If it _____ (rain) tomorrow, we will cancel the picnic.",
    answer: ["rains"],
    explanation:
      "Đây là câu điều kiện loại 1 (có thật ở tương lai), sử dụng if + simple present tense, will + V. Vì vậy, động từ 'rain' ở mệnh đề if chia ở thì hiện tại đơn: 'rains'.",
    hint: "Câu điều kiện loại 1 sử dụng thì hiện tại đơn trong mệnh đề 'if'.",
  });

  // True/False exercise
  exercises.push({
    id: 0,
    type: "trueFalse",
    question:
      "Trong câu điều kiện loại 3, chúng ta sử dụng 'would + have + past participle' trong mệnh đề chính.",
    answer: "true",
    explanation:
      "Đúng. Câu điều kiện loại 3 diễn tả điều không xảy ra trong quá khứ, sử dụng if + past perfect và would + have + past participle trong mệnh đề chính.",
    hint: "Câu điều kiện loại 3 nói về một giả định trái với thực tế trong quá khứ.",
  });

  // Reorder exercise
  exercises.push({
    id: 0,
    type: "reorder",
    question: "Sắp xếp các từ để tạo thành câu điều kiện loại 1:",
    answer: [
      "If",
      "it",
      "stops",
      "raining",
      "we",
      "will",
      "go",
      "for",
      "a",
      "walk",
    ],
    explanation:
      "Câu điều kiện loại 1 có cấu trúc: If + S + V (hiện tại đơn), S + will + V.",
    hint: "Câu điều kiện loại 1 sử dụng thì hiện tại đơn sau 'if' và 'will' trong mệnh đề chính.",
  });
}

// Generate Passive Voice exercises
function addPassiveExercises(
  exercises: GrammarExerciseType[],
  title: string,
  explanation: string,
  examples: string
) {
  // Multiple choice exercise
  exercises.push({
    id: 0,
    type: "multipleChoice",
    question:
      "Chọn dạng bị động đúng của câu: 'They build this house in 2010.'",
    options: [
      "This house is built in 2010.",
      "This house was built in 2010.",
      "This house has been built in 2010.",
      "This house had built in 2010.",
    ],
    answer: "This house was built in 2010.",
    explanation:
      "Câu chủ động ở thì quá khứ đơn, nên dạng bị động là 'was/were + past participle'. Với chủ ngữ 'This house' (số ít), ta dùng 'was built'.",
    hint: "Dạng bị động của thì quá khứ đơn là was/were + past participle.",
  });

  // Fill in the blank exercise
  exercises.push({
    id: 0,
    type: "fillBlank",
    question: "The letter _____ (write) by John yesterday.",
    answer: ["was written"],
    explanation:
      "Đây là câu bị động ở thì quá khứ đơn. Động từ 'write' ở dạng quá khứ phân từ là 'written' và ta sử dụng 'was' vì 'The letter' là danh từ số ít.",
    hint: "Dạng bị động: was/were + past participle.",
  });

  // True/False exercise
  exercises.push({
    id: 0,
    type: "trueFalse",
    question:
      "Trong câu bị động, đối tượng chịu tác động của hành động trở thành chủ ngữ của câu.",
    answer: "true",
    explanation:
      "Đúng. Khi chuyển từ câu chủ động sang câu bị động, đối tượng chịu tác động của hành động (object) trong câu chủ động sẽ trở thành chủ ngữ của câu bị động.",
    hint: "Đối tượng trong câu chủ động = chủ ngữ trong câu bị động.",
  });

  // Reorder exercise
  exercises.push({
    id: 0,
    type: "reorder",
    question: "Sắp xếp các từ để tạo thành câu bị động thì hiện tại đơn:",
    answer: ["English", "is", "spoken", "in", "many", "countries"],
    explanation:
      "Câu bị động thì hiện tại đơn có cấu trúc: Subject + is/am/are + past participle + (by + agent).",
    hint: "Dạng bị động thì hiện tại đơn: is/am/are + past participle.",
  });
}

// Generate generic exercises for other grammar types
function addGenericExercises(
  exercises: GrammarExerciseType[],
  title: string,
  explanation: string,
  examples: string
) {
  // Extract examples to create exercises from
  const examplesList = extractExamples(examples);
  const lowercaseTitle = title.toLowerCase();

  // Multiple choice about understanding the grammar concept
  exercises.push({
    id: 0,
    type: "multipleChoice",
    question: `Điểm ngữ pháp "${title}" chủ yếu được sử dụng để:`,
    options: [
      "Diễn tả hành động đang diễn ra",
      "Diễn tả thói quen, sự thật chung",
      "Diễn tả hành động đã xảy ra trong quá khứ",
      "Diễn tả một quy tắc ngữ pháp đặc biệt",
    ],
    answer: "Diễn tả một quy tắc ngữ pháp đặc biệt",
    explanation: `Dựa vào giải thích của điểm ngữ pháp này: "${explanation.substring(
      0,
      100
    )}..."`,
    hint: "Hãy đọc kỹ phần giải thích của điểm ngữ pháp.",
  });

  // Fill in the blanks exercise
  exercises.push({
    id: 0,
    type: "fillBlank",
    question: `Hoàn thành câu theo quy tắc ngữ pháp "${title}": \n\nTheo quy tắc ____, chúng ta cần chú ý đến cấu trúc câu.`,
    answer: [title, title.toLowerCase(), title.toUpperCase()], // Accept various cases
    explanation: `Câu này yêu cầu điền đúng tên của điểm ngữ pháp "${title}" vào chỗ trống.`,
    hint: `Tên của điểm ngữ pháp này có trong tiêu đề.`,
  });

  // True/False exercise based on explanation
  const explanationFragment = explanation.substring(0, 100);
  exercises.push({
    id: 0,
    type: "trueFalse",
    question: `Đúng hay sai: ${explanationFragment}...`,
    answer: "true",
    explanation: `Thông tin này lấy trực tiếp từ phần giải thích của điểm ngữ pháp "${title}".`,
    hint: "Đọc kỹ phần giải thích của điểm ngữ pháp.",
  });

  // Reorder exercise with a simple sentence related to the grammar point
  exercises.push({
    id: 0,
    type: "reorder",
    question: `Sắp xếp các từ để tạo thành câu liên quan đến điểm ngữ pháp "${title}":`,
    answer: ["Học", "ngữ", "pháp", "giúp", "bạn", "giao", "tiếp", "tốt", "hơn"],
    explanation:
      "Câu hoàn chỉnh là: 'Học ngữ pháp giúp bạn giao tiếp tốt hơn'.",
    hint: "Bắt đầu bằng việc xác định chủ ngữ và động từ của câu.",
  });
}
