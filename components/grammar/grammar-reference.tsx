import { useState } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Save,
  Copy,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { trpc } from "@/trpc/client";
import { useToast } from "@/hooks/use-toast";

interface GrammarReferenceProps {
  grammar: {
    contentId: number;
    categoryId: number;
    title: string;
    explanation: string;
    examples?: string;
    notes?: string;
    orderIndex?: number;
  } | null;
}

export function GrammarReference({ grammar }: GrammarReferenceProps) {
  const [activeTab, setActiveTab] = useState<string>("explanation");
  const { toast } = useToast();
  const utils = trpc.useUtils();
  const { mutate: markGrammarAsLearned } =
    trpc.userProcess.userRegisterCategory.useMutation({
      onSuccess: () => {
        toast({
          title: "Đã lưu vào mục đã học",
          description: "Bạn có thể xem lại trong phần ngữ pháp đã học",
        });
        utils.userProcess.getCategoryProcesses.invalidate();
      },
    });

  // Extract key patterns from the grammar explanation to decide which diagram to show
  const getGrammarPattern = (title: string | undefined): string => {
    if (!title) return "";

    title = title.toLowerCase();

    if (title.includes("present simple")) return "presentSimple";
    if (title.includes("past simple")) return "pastSimple";
    if (title.includes("present continuous")) return "presentContinuous";
    if (title.includes("past continuous")) return "pastContinuous";
    if (title.includes("future")) return "future";
    if (title.includes("present perfect")) return "presentPerfect";
    if (title.includes("past perfect")) return "pastPerfect";
    if (title.includes("conditional")) return "conditional";
    if (title.includes("passive")) return "passive";
    if (title.includes("reported speech")) return "reportedSpeech";
    if (title.includes("question")) return "questions";

    return "generic";
  };

  // Render the appropriate diagram for the grammar point
  const renderGrammarDiagram = () => {
    const pattern = getGrammarPattern(grammar?.title);

    switch (pattern) {
      case "presentSimple":
        return (
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <h3 className="mb-4 text-center text-lg font-semibold text-game-accent">
              Present Simple Structure
            </h3>
            <div className="mb-6 overflow-hidden rounded-lg border">
              <table className="w-full border-collapse">
                <thead className="bg-blue-50">
                  <tr>
                    <th className="border border-gray-200 p-2 text-left">
                      Subject
                    </th>
                    <th className="border border-gray-200 p-2 text-left">
                      Auxiliary
                    </th>
                    <th className="border border-gray-200 p-2 text-left">
                      Verb
                    </th>
                    <th className="border border-gray-200 p-2 text-left">
                      Rest
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-green-50">
                    <td className="border border-gray-200 p-2">
                      I / You / We / They
                    </td>
                    <td className="border border-gray-200 p-2">-</td>
                    <td className="border border-gray-200 p-2 font-medium">
                      verb (base form)
                    </td>
                    <td className="border border-gray-200 p-2">...</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 p-2">
                      He / She / It
                    </td>
                    <td className="border border-gray-200 p-2">-</td>
                    <td className="border border-gray-200 p-2 font-medium">
                      verb + s
                    </td>
                    <td className="border border-gray-200 p-2">...</td>
                  </tr>
                  <tr className="bg-red-50">
                    <td className="border border-gray-200 p-2">
                      I / You / We / They
                    </td>
                    <td className="border border-gray-200 p-2 font-medium text-red-700">
                      do not
                    </td>
                    <td className="border border-gray-200 p-2">
                      verb (base form)
                    </td>
                    <td className="border border-gray-200 p-2">...</td>
                  </tr>
                  <tr className="bg-red-50">
                    <td className="border border-gray-200 p-2">
                      He / She / It
                    </td>
                    <td className="border border-gray-200 p-2 font-medium text-red-700">
                      does not
                    </td>
                    <td className="border border-gray-200 p-2">
                      verb (base form)
                    </td>
                    <td className="border border-gray-200 p-2">...</td>
                  </tr>
                  <tr className="bg-amber-50">
                    <td className="border border-gray-200 p-2 font-medium text-amber-700">
                      Do
                    </td>
                    <td className="border border-gray-200 p-2">
                      I / you / we / they
                    </td>
                    <td className="border border-gray-200 p-2">
                      verb (base form)
                    </td>
                    <td className="border border-gray-200 p-2">...?</td>
                  </tr>
                  <tr className="bg-amber-50">
                    <td className="border border-gray-200 p-2 font-medium text-amber-700">
                      Does
                    </td>
                    <td className="border border-gray-200 p-2">
                      he / she / it
                    </td>
                    <td className="border border-gray-200 p-2">
                      verb (base form)
                    </td>
                    <td className="border border-gray-200 p-2">...?</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="mt-4 space-y-2">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Usage:</span> Thói quen, sự thật
                chung, sự kiện lặp đi lặp lại
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Time expressions:</span> always,
                usually, often, sometimes, rarely, never, every day, once a week
              </p>
            </div>
          </div>
        );

      case "pastSimple":
        return (
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <h3 className="mb-4 text-center text-lg font-semibold text-game-accent">
              Past Simple Structure
            </h3>
            <div className="mb-6 overflow-hidden rounded-lg border">
              <table className="w-full border-collapse">
                <thead className="bg-blue-50">
                  <tr>
                    <th className="border border-gray-200 p-2 text-left">
                      Subject
                    </th>
                    <th className="border border-gray-200 p-2 text-left">
                      Verb
                    </th>
                    <th className="border border-gray-200 p-2 text-left">
                      Rest
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-green-50">
                    <td className="border border-gray-200 p-2">
                      I / You / He / She / It / We / They
                    </td>
                    <td className="border border-gray-200 p-2 font-medium">
                      verb + ed <br />
                      (or irregular form)
                    </td>
                    <td className="border border-gray-200 p-2">...</td>
                  </tr>
                  <tr className="bg-red-50">
                    <td className="border border-gray-200 p-2">
                      I / You / He / She / It / We / They
                    </td>
                    <td className="border border-gray-200 p-2">
                      <span className="font-medium text-red-700">
                        did not (didn't)
                      </span>{" "}
                      + verb (base form)
                    </td>
                    <td className="border border-gray-200 p-2">...</td>
                  </tr>
                  <tr className="bg-amber-50">
                    <td className="border border-gray-200 p-2">
                      <span className="font-medium text-amber-700">Did</span> +
                      I / you / he / she / it / we / they
                    </td>
                    <td className="border border-gray-200 p-2">
                      verb (base form)
                    </td>
                    <td className="border border-gray-200 p-2">...?</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="mt-4 space-y-2">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Usage:</span> Hành động đã hoàn
                thành trong quá khứ, tại một thời điểm cụ thể
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Time expressions:</span>{" "}
                yesterday, last week, in 2020, ago, when I was young
              </p>
            </div>
          </div>
        );

      case "presentContinuous":
        return (
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <h3 className="mb-4 text-center text-lg font-semibold text-game-accent">
              Present Continuous Structure
            </h3>
            <div className="mb-6 overflow-hidden rounded-lg border">
              <table className="w-full border-collapse">
                <thead className="bg-blue-50">
                  <tr>
                    <th className="border border-gray-200 p-2 text-left">
                      Subject
                    </th>
                    <th className="border border-gray-200 p-2 text-left">
                      Auxiliary
                    </th>
                    <th className="border border-gray-200 p-2 text-left">
                      Verb
                    </th>
                    <th className="border border-gray-200 p-2 text-left">
                      Rest
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-green-50">
                    <td className="border border-gray-200 p-2">I</td>
                    <td className="border border-gray-200 p-2 font-medium text-green-700">
                      am
                    </td>
                    <td className="border border-gray-200 p-2 font-medium">
                      verb + ing
                    </td>
                    <td className="border border-gray-200 p-2">...</td>
                  </tr>
                  <tr className="bg-green-50">
                    <td className="border border-gray-200 p-2">
                      You / We / They
                    </td>
                    <td className="border border-gray-200 p-2 font-medium text-green-700">
                      are
                    </td>
                    <td className="border border-gray-200 p-2 font-medium">
                      verb + ing
                    </td>
                    <td className="border border-gray-200 p-2">...</td>
                  </tr>
                  <tr className="bg-green-50">
                    <td className="border border-gray-200 p-2">
                      He / She / It
                    </td>
                    <td className="border border-gray-200 p-2 font-medium text-green-700">
                      is
                    </td>
                    <td className="border border-gray-200 p-2 font-medium">
                      verb + ing
                    </td>
                    <td className="border border-gray-200 p-2">...</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="mt-4 space-y-2">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Usage:</span> Hành động đang diễn
                ra tại thời điểm nói, hành động tạm thời, sự thay đổi
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Time expressions:</span> now, at
                the moment, today, these days, currently, look!, listen!
              </p>
            </div>
          </div>
        );

      case "pastContinuous":
        return (
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <h3 className="mb-4 text-center text-lg font-semibold text-game-accent">
              Past Continuous Structure
            </h3>
            <div className="mb-6 overflow-hidden rounded-lg border">
              <table className="w-full border-collapse">
                <thead className="bg-blue-50">
                  <tr>
                    <th className="border border-gray-200 p-2 text-left">
                      Subject
                    </th>
                    <th className="border border-gray-200 p-2 text-left">
                      Auxiliary
                    </th>
                    <th className="border border-gray-200 p-2 text-left">
                      Verb
                    </th>
                    <th className="border border-gray-200 p-2 text-left">
                      Rest
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-green-50">
                    <td className="border border-gray-200 p-2">
                      I / He / She / It
                    </td>
                    <td className="border border-gray-200 p-2 font-medium text-green-700">
                      was
                    </td>
                    <td className="border border-gray-200 p-2 font-medium">
                      verb + ing
                    </td>
                    <td className="border border-gray-200 p-2">...</td>
                  </tr>
                  <tr className="bg-green-50">
                    <td className="border border-gray-200 p-2">
                      You / We / They
                    </td>
                    <td className="border border-gray-200 p-2 font-medium text-green-700">
                      were
                    </td>
                    <td className="border border-gray-200 p-2 font-medium">
                      verb + ing
                    </td>
                    <td className="border border-gray-200 p-2">...</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="mt-4 space-y-2">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Usage:</span> Hành động đang diễn
                ra tại một thời điểm trong quá khứ, hành động đang diễn ra thì
                hành động khác xảy ra
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Time expressions:</span> at 6pm
                yesterday, when you called, while, as, at that time
              </p>
            </div>
          </div>
        );

      case "future":
        return (
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <h3 className="mb-4 text-center text-lg font-semibold text-game-accent">
              Future Tense Structures
            </h3>
            <div className="mb-6 space-y-4">
              <div className="overflow-hidden rounded-lg border">
                <div className="bg-blue-100 p-2 font-medium text-blue-800">
                  Will (Simple Future)
                </div>
                <table className="w-full border-collapse">
                  <thead className="bg-blue-50">
                    <tr>
                      <th className="border border-gray-200 p-2 text-left">
                        Subject
                      </th>
                      <th className="border border-gray-200 p-2 text-left">
                        Auxiliary
                      </th>
                      <th className="border border-gray-200 p-2 text-left">
                        Verb
                      </th>
                      <th className="border border-gray-200 p-2 text-left">
                        Rest
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-200 p-2">
                        I / You / He / She / It / We / They
                      </td>
                      <td className="border border-gray-200 p-2 font-medium text-blue-700">
                        will
                      </td>
                      <td className="border border-gray-200 p-2">
                        verb (base form)
                      </td>
                      <td className="border border-gray-200 p-2">...</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="overflow-hidden rounded-lg border">
                <div className="bg-purple-100 p-2 font-medium text-purple-800">
                  Be going to
                </div>
                <table className="w-full border-collapse">
                  <thead className="bg-blue-50">
                    <tr>
                      <th className="border border-gray-200 p-2 text-left">
                        Subject
                      </th>
                      <th className="border border-gray-200 p-2 text-left">
                        Form of "be"
                      </th>
                      <th className="border border-gray-200 p-2 text-left">
                        Fixed phrase
                      </th>
                      <th className="border border-gray-200 p-2 text-left">
                        Verb
                      </th>
                      <th className="border border-gray-200 p-2 text-left">
                        Rest
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-200 p-2">I</td>
                      <td className="border border-gray-200 p-2 font-medium text-purple-700">
                        am
                      </td>
                      <td className="border border-gray-200 p-2 font-medium text-purple-700">
                        going to
                      </td>
                      <td className="border border-gray-200 p-2">
                        verb (base form)
                      </td>
                      <td className="border border-gray-200 p-2">...</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-200 p-2">
                        You / We / They
                      </td>
                      <td className="border border-gray-200 p-2 font-medium text-purple-700">
                        are
                      </td>
                      <td className="border border-gray-200 p-2 font-medium text-purple-700">
                        going to
                      </td>
                      <td className="border border-gray-200 p-2">
                        verb (base form)
                      </td>
                      <td className="border border-gray-200 p-2">...</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-200 p-2">
                        He / She / It
                      </td>
                      <td className="border border-gray-200 p-2 font-medium text-purple-700">
                        is
                      </td>
                      <td className="border border-gray-200 p-2 font-medium text-purple-700">
                        going to
                      </td>
                      <td className="border border-gray-200 p-2">
                        verb (base form)
                      </td>
                      <td className="border border-gray-200 p-2">...</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Will - Usage:</span> Quyết định
                tức thời, dự đoán, lời hứa, đề nghị, sự tình nguyện
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Be going to - Usage:</span> Kế
                hoạch đã định trước, dự đoán dựa trên bằng chứng hiện tại
              </p>
            </div>
          </div>
        );

      case "presentPerfect":
        return (
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <h3 className="mb-4 text-center text-lg font-semibold text-game-accent">
              Present Perfect Structure
            </h3>
            <div className="mb-6 overflow-hidden rounded-lg border">
              <table className="w-full border-collapse">
                <thead className="bg-blue-50">
                  <tr>
                    <th className="border border-gray-200 p-2 text-left">
                      Subject
                    </th>
                    <th className="border border-gray-200 p-2 text-left">
                      Auxiliary
                    </th>
                    <th className="border border-gray-200 p-2 text-left">
                      Past Participle
                    </th>
                    <th className="border border-gray-200 p-2 text-left">
                      Rest
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-green-50">
                    <td className="border border-gray-200 p-2">
                      I / You / We / They
                    </td>
                    <td className="border border-gray-200 p-2 font-medium text-green-700">
                      have
                    </td>
                    <td className="border border-gray-200 p-2 font-medium">
                      verb (past participle)
                    </td>
                    <td className="border border-gray-200 p-2">...</td>
                  </tr>
                  <tr className="bg-green-50">
                    <td className="border border-gray-200 p-2">
                      He / She / It
                    </td>
                    <td className="border border-gray-200 p-2 font-medium text-green-700">
                      has
                    </td>
                    <td className="border border-gray-200 p-2 font-medium">
                      verb (past participle)
                    </td>
                    <td className="border border-gray-200 p-2">...</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="mt-4 space-y-2">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Usage:</span> Hành động đã xảy ra
                trong quá khứ nhưng có liên quan đến hiện tại, kinh nghiệm trong
                đời, hành động bắt đầu trong quá khứ và vẫn tiếp diễn đến hiện
                tại
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Time expressions:</span> since,
                for, ever, never, just, already, yet, recently, so far
              </p>
            </div>
          </div>
        );

      // Add more grammar patterns here
      default:
        return (
          <div className="rounded-lg bg-white p-4 text-center shadow-sm">
            <p className="text-gray-500">
              Không có sơ đồ trực quan cho điểm ngữ pháp này.
            </p>
          </div>
        );
    }
  };

  if (!grammar) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center text-gray-500">
        <BookOpen className="mx-auto mb-4 h-12 w-12 text-gray-300" />
        <p>Chọn một điểm ngữ pháp để xem thông tin chi tiết</p>
      </div>
    );
  }

  const handleSaveToLearned = () => {
    if (grammar) {
      markGrammarAsLearned({ categoryId: grammar.categoryId });
    }
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Đã sao chép",
      description: "Nội dung đã được sao chép vào bộ nhớ tạm",
    });
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-start justify-between bg-gradient-to-r from-blue-50 to-blue-100 pb-4">
        <div>
          <Badge variant="outline" className="mb-2 bg-blue-100 text-blue-800">
            Ngữ pháp
          </Badge>
          <CardTitle className="text-xl text-game-accent">
            {grammar.title}
          </CardTitle>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="h-8 gap-1"
            onClick={() => handleCopyToClipboard(grammar.explanation)}
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8 gap-1 bg-blue-50 text-blue-600 hover:bg-blue-100"
            onClick={handleSaveToLearned}
          >
            <Save className="h-3.5 w-3.5" />
            <span>Lưu</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full justify-start rounded-none border-b bg-white p-0">
            <TabsTrigger
              value="explanation"
              className="flex-1 data-[state=active]:bg-white data-[state=active]:shadow-none"
            >
              Giải thích
            </TabsTrigger>
            <TabsTrigger
              value="diagram"
              className="flex-1 data-[state=active]:bg-white data-[state=active]:shadow-none"
            >
              Sơ đồ
            </TabsTrigger>
            <TabsTrigger
              value="examples"
              className="flex-1 data-[state=active]:bg-white data-[state=active]:shadow-none"
            >
              Ví dụ
            </TabsTrigger>
            {grammar.notes && (
              <TabsTrigger
                value="notes"
                className="flex-1 data-[state=active]:bg-white data-[state=active]:shadow-none"
              >
                Ghi chú
              </TabsTrigger>
            )}
          </TabsList>
          <TabsContent value="explanation" className="m-0 border-0 p-0">
            <ScrollArea className="h-[350px] p-6">
              <div className="space-y-4">
                <p className="whitespace-pre-line text-gray-700">
                  {grammar.explanation}
                </p>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="common-mistakes">
                    <AccordionTrigger className="text-sm font-medium text-amber-700">
                      Lỗi thường gặp
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-gray-600">
                      {getGrammarPattern(grammar.title) === "presentSimple" && (
                        <ul className="list-disc space-y-2 pl-5">
                          <li>
                            Quên thêm "s" cho động từ ở ngôi thứ ba số ít (he,
                            she, it)
                          </li>
                          <li>
                            Sử dụng sai trợ động từ "do/does" trong câu hỏi và
                            phủ định
                          </li>
                          <li>
                            Sử dụng Present Simple thay vì Present Continuous
                            cho hành động đang diễn ra
                          </li>
                        </ul>
                      )}
                      {getGrammarPattern(grammar.title) === "pastSimple" && (
                        <ul className="list-disc space-y-2 pl-5">
                          <li>Quên biến đổi động từ sang dạng quá khứ</li>
                          <li>Sử dụng sai động từ bất quy tắc</li>
                          <li>Sử dụng "did" và động từ quá khứ cùng lúc</li>
                        </ul>
                      )}
                      {getGrammarPattern(grammar.title) ===
                        "presentContinuous" && (
                        <ul className="list-disc space-y-2 pl-5">
                          <li>Quên sử dụng động từ "be" (am/is/are)</li>
                          <li>Quên thêm "-ing" vào động từ chính</li>
                          <li>
                            Sử dụng với các động từ tĩnh (stative verbs) như
                            like, love, know
                          </li>
                        </ul>
                      )}
                      {getGrammarPattern(grammar.title) ===
                        "presentPerfect" && (
                        <ul className="list-disc space-y-2 pl-5">
                          <li>Dùng sai quá khứ phân từ (past participle)</li>
                          <li>Nhầm lẫn giữa "since" và "for"</li>
                          <li>
                            Sử dụng Present Perfect với thời gian cụ thể trong
                            quá khứ
                          </li>
                        </ul>
                      )}
                      {![
                        "presentSimple",
                        "pastSimple",
                        "presentContinuous",
                        "presentPerfect",
                      ].includes(getGrammarPattern(grammar.title)) && (
                        <ul className="list-disc space-y-2 pl-5">
                          <li>Nhầm lẫn cấu trúc ngữ pháp với các thì khác</li>
                          <li>Sử dụng sai trạng từ chỉ thời gian</li>
                          <li>
                            Áp dụng ngữ pháp không đúng ngữ cảnh giao tiếp
                          </li>
                        </ul>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="tips">
                    <AccordionTrigger className="text-sm font-medium text-green-700">
                      Mẹo học hiệu quả
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-gray-600">
                      <ul className="list-disc space-y-2 pl-5">
                        <li>
                          Ghi nhớ cấu trúc câu bằng cách làm nhiều bài tập
                        </li>
                        <li>
                          Tập nói hoặc viết câu sử dụng điểm ngữ pháp này hàng
                          ngày
                        </li>
                        <li>
                          Đọc và nghe nhiều để hiểu cách sử dụng ngữ pháp trong
                          ngữ cảnh thực tế
                        </li>
                        <li>Tạo flashcards để ôn tập các ví dụ và quy tắc</li>
                        <li>Tìm một đối tác học tập và thực hành cùng nhau</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </ScrollArea>
          </TabsContent>
          <TabsContent value="diagram" className="m-0 border-0 p-0">
            <ScrollArea className="h-[350px] p-6">
              {renderGrammarDiagram()}
            </ScrollArea>
          </TabsContent>
          <TabsContent value="examples" className="m-0 border-0 p-0">
            <ScrollArea className="h-[350px] p-6">
              {grammar.examples ? (
                <div className="space-y-4">
                  <div className="rounded-lg border bg-blue-50/30 p-4">
                    <h3 className="mb-3 font-medium text-blue-700">Ví dụ:</h3>
                    {grammar.examples.split("\n").map(
                      (example, idx) =>
                        example.trim() && (
                          <div
                            key={idx}
                            className="mb-2 rounded-md bg-white p-2 shadow-sm"
                          >
                            <p>{example}</p>
                          </div>
                        )
                    )}
                  </div>
                  <div className="rounded-lg bg-amber-50 p-4">
                    <h3 className="mb-2 font-medium text-amber-700">
                      Thực hành:
                    </h3>
                    <p className="text-sm text-gray-600">
                      Hãy tự tạo 3 câu ví dụ sử dụng điểm ngữ pháp này. Điều này
                      sẽ giúp bạn ghi nhớ và vận dụng tốt hơn.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center text-gray-500">
                  <p>Không có ví dụ cho điểm ngữ pháp này</p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>
          {grammar.notes && (
            <TabsContent value="notes" className="m-0 border-0 p-0">
              <ScrollArea className="h-[350px] p-6">
                <div className="rounded-lg bg-yellow-50 p-4">
                  <p className="whitespace-pre-line text-gray-700">
                    {grammar.notes}
                  </p>
                </div>
              </ScrollArea>
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
}
