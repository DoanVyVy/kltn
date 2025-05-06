import { useMemo } from "react";
import { ErrorIdentificationExercise } from "./grammar-error-identification";

interface Grammar {
  contentId: number;
  categoryId: number;
  title: string;
  explanation: string;
  examples?: string;
  notes?: string;
  orderIndex?: number;
}

export interface EnhancedFillBlankExercise {
  id: string | number;
  type: "fillBlank";
  text: string; // Text with blanks marked as [blank]
  answers: string[]; // Array of correct answers for each blank
  hint?: string;
  explanation: string;
}

export interface EnhancedReorderExercise {
  id: string | number;
  type: "reorder";
  sentence: string; // The complete sentence
  fragments: string[]; // The sentence broken into fragments to reorder
  hint?: string;
  explanation: string;
}

export type GrammarExerciseType =
  | EnhancedFillBlankExercise
  | EnhancedReorderExercise
  | ErrorIdentificationExercise;

export function useEnhancedGrammarGenerator(grammar: Grammar | null) {
  return useMemo(() => {
    if (!grammar) return [] as GrammarExerciseType[];

    const { title, explanation, examples = "" } = grammar;
    const exercises: GrammarExerciseType[] = [];

    // Determine grammar type for targeted exercises
    const grammarType = determineGrammarType(title, explanation);

    // Generate targeted exercises based on grammar type
    switch (grammarType) {
      case "presentSimple":
        addPresentSimpleExercises(exercises, examples);
        break;
      case "pastSimple":
        addPastSimpleExercises(exercises, examples);
        break;
      case "presentContinuous":
        addPresentContinuousExercises(exercises, examples);
        break;
      case "presentPerfect":
        addPresentPerfectExercises(exercises, examples);
        break;
      case "conditional":
        addConditionalExercises(exercises, examples);
        break;
      case "passive":
        addPassiveExercises(exercises, examples);
        break;
      default:
        addGenericExercises(exercises, title, explanation, examples);
    }

    // Return the exercises with unique IDs
    return exercises.map((exercise, index) => ({
      ...exercise,
      id: `${grammarType}-${index + 1}`,
    }));
  }, [grammar]);
}

// Helper function to determine grammar type
function determineGrammarType(title: string, explanation: string): string {
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

// Extract example sentences from the grammar content
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
  examples: string
) {
  // Fill in the blank exercise
  exercises.push({
    id: 1,
    type: "fillBlank",
    text: "John always [blank] to work by bus in the morning.",
    answers: ["goes"],
    explanation:
      "Với chủ ngữ là ngôi thứ ba số ít (John), động từ 'go' phải chia thành 'goes' trong thì hiện tại đơn.",
    hint: "Động từ thường ở thì hiện tại đơn, ngôi thứ ba số ít thêm 's'.",
  });

  // Word ordering exercise
  exercises.push({
    id: 2,
    type: "reorder",
    sentence: "She usually watches TV in the evening.",
    fragments: ["She", "usually", "watches", "TV", "in", "the", "evening", "."],
    explanation:
      "Trật tự từ trong câu khẳng định ở thì hiện tại đơn: Chủ ngữ + trạng từ tần suất + động từ (thêm -s/es với ngôi thứ 3 số ít) + bổ ngữ.",
    hint: "Trạng từ tần suất (usually, always, often...) thường đứng trước động từ thường.",
  });

  // Error identification exercise
  exercises.push({
    id: 3,
    type: "fillBlank",
    text: "My parents [blank] in that house since 2010.",
    answers: ["have lived", "have been living"],
    explanation:
      "Với khoảng thời gian bắt đầu từ quá khứ đến hiện tại (since 2010), ta dùng thì hiện tại hoàn thành 'have lived' hoặc 'have been living'.",
    hint: "Với 'since + thời điểm' ta thường dùng thì hiện tại hoàn thành.",
  });

  // Error identification
  exercises.push({
    id: 4,
    sentence: "She study English at school every day.",
    options: [
      { id: 1, text: "She", isError: false },
      { id: 2, text: "study", isError: true },
      { id: 3, text: "English", isError: false },
      { id: 4, text: "at school", isError: false },
      { id: 5, text: "every day", isError: false },
    ],
    explanation:
      "Với chủ ngữ ngôi thứ ba số ít (She), động từ ở thì hiện tại đơn phải thêm 's': 'She studies'.",
    hint: "Chú ý cách chia động từ với ngôi thứ 3 số ít ở thì hiện tại đơn.",
  });
}

// Generate Past Simple exercises
function addPastSimpleExercises(
  exercises: GrammarExerciseType[],
  examples: string
) {
  // Fill in the blank exercise
  exercises.push({
    id: 1,
    type: "fillBlank",
    text: "They [blank] to the beach last weekend.",
    answers: ["went"],
    explanation:
      "Với thì quá khứ đơn, động từ 'go' chuyển thành dạng quá khứ 'went'.",
    hint: "Sử dụng dạng quá khứ (V2) của động từ.",
  });

  // Word ordering exercise
  exercises.push({
    id: 2,
    type: "reorder",
    sentence: "She didn't finish her homework yesterday.",
    fragments: ["She", "didn't", "finish", "her", "homework", "yesterday", "."],
    explanation:
      "Trật tự từ trong câu phủ định thì quá khứ đơn: Chủ ngữ + didn't + động từ nguyên thể + bổ ngữ.",
    hint: "Trong câu phủ định thì quá khứ đơn, ta dùng 'did not' (didn't) và động từ phải trở về dạng nguyên thể.",
  });

  // Fill in the blank with context
  exercises.push({
    id: 3,
    type: "fillBlank",
    text: "When I [blank] (arrive) at the station, the train [blank] (already / leave).",
    answers: ["arrived", "had already left"],
    explanation:
      "Với hành động xảy ra trước một hành động khác trong quá khứ, ta dùng thì quá khứ hoàn thành 'had already left'. Hành động xảy ra sau thì dùng quá khứ đơn 'arrived'.",
    hint: "Hai hành động xảy ra trong quá khứ, hành động nào xảy ra trước thì dùng quá khứ hoàn thành, hành động xảy ra sau thì dùng quá khứ đơn.",
  });

  // Error identification
  exercises.push({
    id: 4,
    sentence: "I goed to the cinema with my friends last night.",
    options: [
      { id: 1, text: "I", isError: false },
      { id: 2, text: "goed", isError: true },
      { id: 3, text: "to the cinema", isError: false },
      { id: 4, text: "with my friends", isError: false },
      { id: 5, text: "last night", isError: false },
    ],
    explanation:
      "'Go' là động từ bất quy tắc, dạng quá khứ không phải là 'goed' mà là 'went'.",
    hint: "Chú ý động từ bất quy tắc trong tiếng Anh.",
  });
}

// Generate Present Continuous exercises
function addPresentContinuousExercises(
  exercises: GrammarExerciseType[],
  examples: string
) {
  // Fill in the blank exercise
  exercises.push({
    id: 1,
    type: "fillBlank",
    text: "Look! The baby [blank] (sleep) right now.",
    answers: ["is sleeping"],
    explanation:
      "Với thì hiện tại tiếp diễn, ta sử dụng cấu trúc be (am/is/are) + V-ing. Với chủ ngữ 'The baby' (ngôi thứ ba số ít), ta dùng 'is sleeping'.",
    hint: "Thì hiện tại tiếp diễn diễn tả hành động đang xảy ra tại thời điểm nói.",
  });

  // Word ordering exercise
  exercises.push({
    id: 2,
    type: "reorder",
    sentence: "They are studying for their exams now.",
    fragments: ["They", "are", "studying", "for", "their", "exams", "now", "."],
    explanation:
      "Trật tự từ trong câu hiện tại tiếp diễn: Chủ ngữ + be (am/is/are) + V-ing + bổ ngữ.",
    hint: "Để ý vị trí của trợ động từ 'are' và dạng động từ thêm '-ing'.",
  });

  // Fill in the blank with context
  exercises.push({
    id: 3,
    type: "fillBlank",
    text: "I can't talk right now. I [blank] (drive) to work.",
    answers: ["am driving"],
    explanation:
      "Với thì hiện tại tiếp diễn diễn tả hành động đang xảy ra tại thời điểm nói, ta dùng cấu trúc be (am/is/are) + V-ing. Với chủ ngữ 'I', ta dùng 'am driving'.",
    hint: "Để diễn tả hành động đang xảy ra tại thời điểm nói, ta dùng thì hiện tại tiếp diễn.",
  });

  // Error identification
  exercises.push({
    id: 4,
    sentence: "She is play tennis at the moment.",
    options: [
      { id: 1, text: "She", isError: false },
      { id: 2, text: "is", isError: false },
      { id: 3, text: "play", isError: true },
      { id: 4, text: "tennis", isError: false },
      { id: 5, text: "at the moment", isError: false },
    ],
    explanation:
      "Trong thì hiện tại tiếp diễn, sau 'is' phải là động từ thêm '-ing'. Đúng phải là 'is playing'.",
    hint: "Thì hiện tại tiếp diễn có cấu trúc be (am/is/are) + V-ing.",
  });
}

// Generate Present Perfect exercises
function addPresentPerfectExercises(
  exercises: GrammarExerciseType[],
  examples: string
) {
  // Fill in the blank exercise
  exercises.push({
    id: 1,
    type: "fillBlank",
    text: "She [blank] (live) in London for five years.",
    answers: ["has lived", "has been living"],
    explanation:
      "Với thì hiện tại hoàn thành diễn tả hành động bắt đầu trong quá khứ và kéo dài đến hiện tại, ta dùng cấu trúc have/has + past participle. Với chủ ngữ 'She', ta dùng 'has lived' hoặc 'has been living'.",
    hint: "Với thời gian 'for five years', ta thường dùng thì hiện tại hoàn thành.",
  });

  // Word ordering exercise
  exercises.push({
    id: 2,
    type: "reorder",
    sentence: "I have never seen this movie before.",
    fragments: ["I", "have", "never", "seen", "this", "movie", "before", "."],
    explanation:
      "Trật tự từ trong câu hiện tại hoàn thành: Chủ ngữ + have/has + (trạng từ) + past participle + bổ ngữ.",
    hint: "Trạng từ như 'never', 'already', 'just' đứng giữa have/has và past participle.",
  });

  // Fill in the blank with context
  exercises.push({
    id: 3,
    type: "fillBlank",
    text: "I'm tired because I [blank] (not / sleep) well lately.",
    answers: ["haven't slept", "have not slept"],
    explanation:
      "Với thì hiện tại hoàn thành diễn tả trạng thái kéo dài đến hiện tại, ta dùng cấu trúc have/has + not + past participle. Với chủ ngữ 'I', ta dùng 'haven't slept' hoặc 'have not slept'.",
    hint: "Với trạng từ thời gian 'lately', ta thường dùng thì hiện tại hoàn thành.",
  });

  // Error identification
  exercises.push({
    id: 4,
    sentence: "She have lived in Paris since 2015.",
    options: [
      { id: 1, text: "She", isError: false },
      { id: 2, text: "have", isError: true },
      { id: 3, text: "lived", isError: false },
      { id: 4, text: "in Paris", isError: false },
      { id: 5, text: "since 2015", isError: false },
    ],
    explanation:
      "Với chủ ngữ ngôi thứ ba số ít (She), ta phải dùng 'has' thay vì 'have'. Đúng phải là 'She has lived'.",
    hint: "Chú ý cách chia động từ have/has với các ngôi khác nhau trong thì hiện tại hoàn thành.",
  });
}

// Generate Conditional exercises
function addConditionalExercises(
  exercises: GrammarExerciseType[],
  examples: string
) {
  // Fill in the blank exercise
  exercises.push({
    id: 1,
    type: "fillBlank",
    text: "If it [blank] (rain) tomorrow, I will stay at home.",
    answers: ["rains"],
    explanation:
      "Trong câu điều kiện loại 1 (có thể xảy ra ở tương lai), ta dùng thì hiện tại đơn trong mệnh đề if và will + V trong mệnh đề chính: If + S + V (hiện tại đơn), S + will + V.",
    hint: "Loại câu điều kiện nào dùng thì hiện tại đơn trong mệnh đề if và will + V trong mệnh đề chính?",
  });

  // Word ordering exercise
  exercises.push({
    id: 2,
    type: "reorder",
    sentence: "If I won the lottery, I would buy a new house.",
    fragments: [
      "If",
      "I",
      "won",
      "the",
      "lottery",
      ",",
      "I",
      "would",
      "buy",
      "a",
      "new",
      "house",
      ".",
    ],
    explanation:
      "Trật tự từ trong câu điều kiện loại 2: If + S + V-ed (quá khứ đơn), S + would + V.",
    hint: "Câu điều kiện loại 2 diễn tả điều kiện không có thật ở hiện tại.",
  });

  // Fill in the blank with context
  exercises.push({
    id: 3,
    type: "fillBlank",
    text: "If I [blank] (know) the answer, I [blank] (tell) you.",
    answers: ["knew", "would tell"],
    explanation:
      "Trong câu điều kiện loại 2 (không có thật ở hiện tại), ta dùng thì quá khứ đơn trong mệnh đề if và would + V trong mệnh đề chính: If + S + V-ed (quá khứ đơn), S + would + V.",
    hint: "Câu điều kiện loại 2 dùng thì quá khứ đơn trong mệnh đề if và would + V trong mệnh đề chính.",
  });

  // Error identification
  exercises.push({
    id: 4,
    sentence: "If I will have time tomorrow, I will visit you.",
    options: [
      { id: 1, text: "If", isError: false },
      { id: 2, text: "I will have", isError: true },
      { id: 3, text: "time tomorrow", isError: false },
      { id: 4, text: "I will visit", isError: false },
      { id: 5, text: "you", isError: false },
    ],
    explanation:
      "Trong câu điều kiện loại 1, ta không dùng 'will' trong mệnh đề if. Đúng phải là 'If I have time tomorrow, I will visit you.'",
    hint: "Trong câu điều kiện, thường không dùng 'will' trong mệnh đề if.",
  });
}

// Generate Passive Voice exercises
function addPassiveExercises(
  exercises: GrammarExerciseType[],
  examples: string
) {
  // Fill in the blank exercise
  exercises.push({
    id: 1,
    type: "fillBlank",
    text: "The letter [blank] (write) by John yesterday.",
    answers: ["was written"],
    explanation:
      "Với câu bị động ở thì quá khứ đơn, ta dùng cấu trúc was/were + past participle. Với chủ ngữ 'The letter' (số ít), ta dùng 'was written'.",
    hint: "Câu bị động thì quá khứ đơn: was/were + past participle.",
  });

  // Word ordering exercise
  exercises.push({
    id: 2,
    type: "reorder",
    sentence: "English is spoken all over the world.",
    fragments: ["English", "is", "spoken", "all", "over", "the", "world", "."],
    explanation:
      "Trật tự từ trong câu bị động thì hiện tại đơn: Chủ ngữ + is/am/are + past participle + bổ ngữ.",
    hint: "Câu bị động thì hiện tại đơn có cấu trúc: S + is/am/are + V3 (past participle).",
  });

  // Fill in the blank with context
  exercises.push({
    id: 3,
    type: "fillBlank",
    text: "This bridge [blank] (build) in 1990 and [blank] (renovate) last year.",
    answers: ["was built", "was renovated"],
    explanation:
      "Với câu bị động ở thì quá khứ đơn, ta dùng cấu trúc was/were + past participle. Với chủ ngữ 'This bridge' (số ít), ta dùng 'was built' và 'was renovated'.",
    hint: "Câu bị động thì quá khứ đơn: was/were + past participle.",
  });

  // Error identification
  exercises.push({
    id: 4,
    sentence: "The house has been build last year.",
    options: [
      { id: 1, text: "The house", isError: false },
      { id: 2, text: "has been", isError: true },
      { id: 3, text: "build", isError: true },
      { id: 4, text: "last year", isError: true },
      { id: 5, text: ".", isError: false },
    ],
    explanation:
      "Có hai lỗi: 1) Với thời gian cụ thể trong quá khứ (last year), ta không dùng thì hiện tại hoàn thành mà dùng quá khứ đơn. 2) Động từ 'build' phải ở dạng past participle 'built'. Đúng phải là 'The house was built last year.'",
    hint: "Chú ý sự phù hợp giữa thì và trạng từ chỉ thời gian, và dạng đúng của động từ trong câu bị động.",
  });
}

// Generate generic exercises for other grammar types
function addGenericExercises(
  exercises: GrammarExerciseType[],
  title: string,
  explanation: string,
  examples: string
) {
  const examplesList = extractExamples(examples);

  // Add generic exercises based on the title and explanation

  // Fill in the blank exercise
  exercises.push({
    id: 1,
    type: "fillBlank",
    text: `Theo quy tắc ngữ pháp "${title}", câu sau cần điền từ gì?\n\nWe [blank] follow the rules carefully.`,
    answers: ["should", "must", "need to", "have to"],
    explanation: `Câu này yêu cầu điền đúng trợ động từ phù hợp với ngữ pháp "${title}".`,
    hint: `Điểm ngữ pháp "${title}" thường liên quan đến việc biểu thị nghĩa vụ hoặc lời khuyên.`,
  });

  // Word ordering exercise
  if (examplesList.length > 0) {
    const exampleSentence = examplesList[0];
    const words = exampleSentence.replace(/[.,!?;:]/g, "").split(" ");

    exercises.push({
      id: 2,
      type: "reorder",
      sentence: exampleSentence,
      fragments: [...words, "."],
      explanation: `Câu này là một ví dụ minh họa cho quy tắc ngữ pháp "${title}".`,
      hint: `Chú ý trật tự từ phù hợp với quy tắc ngữ pháp đã học.`,
    });
  } else {
    // Default reorder exercise if no examples available
    exercises.push({
      id: 2,
      type: "reorder",
      sentence: "Grammar helps us communicate effectively.",
      fragments: ["Grammar", "helps", "us", "communicate", "effectively", "."],
      explanation: `Câu đơn giản minh họa tầm quan trọng của việc học ngữ pháp.`,
      hint: `Chủ ngữ thường đứng đầu câu, theo sau là động từ.`,
    });
  }

  // Error identification exercise
  exercises.push({
    id: 3,
    sentence: "I have saw this movie twice already.",
    options: [
      { id: 1, text: "I", isError: false },
      { id: 2, text: "have saw", isError: true },
      { id: 3, text: "this movie", isError: false },
      { id: 4, text: "twice", isError: false },
      { id: 5, text: "already", isError: false },
    ],
    explanation:
      "Trong thì hiện tại hoàn thành, sau have/has phải là past participle. Động từ 'see' có dạng past participle là 'seen', không phải 'saw'. Đúng phải là 'have seen'.",
    hint: "Chú ý dạng đúng của động từ sau have/has trong thì hiện tại hoàn thành.",
  });
}
