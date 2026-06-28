import { ReadingTest } from "@/components/reading/ReadingTest";
import { db } from "@/lib/db";
import { readingPassages, readingQuestions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const mockData: Record<string, {
  id: string; title: string; passage: string; timeMinutes: number;
  questions: {
    id: string; type: string; question: string;
    options?: string[]; correctAnswer: string | string[];
  }[];
}> = {
  r1: {
    id: "r1",
    title: "The History of the Internet",
    passage: `The Internet, as we know it today, is the result of decades of innovation, research, and international collaboration. Its origins can be traced back to the 1960s, when the United States Department of Defense funded a project called ARPANET (Advanced Research Projects Agency Network). ARPANET was designed to allow multiple computers to communicate over a single network, primarily to ensure that communication could continue even in the event of a nuclear strike.

In the early days, the network connected only a handful of universities and research institutions. The first message ever sent over ARPANET was transmitted on October 29, 1969, from UCLA to Stanford Research Institute. The message was supposed to be "LOGIN," but the system crashed after the first two letters, so only "LO" was received.

Throughout the 1970s, ARPANET grew steadily. One of the most significant developments of this era was the creation of the TCP/IP protocol in 1974 by Vint Cerf and Bob Kahn. This protocol defined how data packets should be transmitted and reassembled across networks, providing the technical foundation for the modern Internet.

The 1980s saw the Internet expand beyond military and academic use. In 1984, the Domain Name System (DNS) was introduced, making it easier to navigate the growing network by translating numerical IP addresses into human-readable domain names. By the end of the decade, the network had thousands of connected computers.

The World Wide Web, often confused with the Internet itself, was invented by British scientist Tim Berners-Lee in 1989 while working at CERN, the European particle physics laboratory. The Web provided a user-friendly interface for accessing information stored on servers connected to the Internet. The first website went live in 1991.

The commercialization of the Internet in the 1990s transformed it from a niche academic tool into a global phenomenon. The development of graphical web browsers like Mosaic (1993) and Netscape Navigator (1994) made the Web accessible to everyday users. By 1995, millions of people worldwide had Internet access, and the dot-com boom was underway.

Today, the Internet connects over five billion people and continues to evolve. Emerging technologies such as 5G networks, the Internet of Things (IoT), and artificial intelligence are shaping the next generation of the Internet, promising even greater connectivity and new applications that were once the realm of science fiction.`,
    timeMinutes: 20,
    questions: [
      {
        id: "q1",
        type: "multiple_choice",
        question: "What was the primary purpose of ARPANET when it was created?",
        options: [
          "A. To enable commercial communication between businesses",
          "B. To ensure communication could survive a nuclear strike",
          "C. To connect universities for academic research only",
          "D. To provide entertainment to military personnel",
        ],
        correctAnswer: "B",
      },
      {
        id: "q2",
        type: "true_false_not_given",
        question: "The first message successfully transmitted over ARPANET was the word 'LOGIN'.",
        options: ["TRUE", "FALSE", "NOT GIVEN"],
        correctAnswer: "FALSE",
      },
      {
        id: "q3",
        type: "true_false_not_given",
        question: "Vint Cerf and Bob Kahn developed the TCP/IP protocol in the 1970s.",
        options: ["TRUE", "FALSE", "NOT GIVEN"],
        correctAnswer: "TRUE",
      },
      {
        id: "q4",
        type: "short_answer",
        question: "What technology was introduced in 1984 to help users navigate the Internet more easily?",
        correctAnswer: "DNS",
      },
      {
        id: "q5",
        type: "multiple_choice",
        question: "Where was Tim Berners-Lee working when he invented the World Wide Web?",
        options: [
          "A. UCLA",
          "B. MIT",
          "C. CERN",
          "D. Stanford Research Institute",
        ],
        correctAnswer: "C",
      },
      {
        id: "q6",
        type: "true_false_not_given",
        question: "The World Wide Web and the Internet are the same thing.",
        options: ["TRUE", "FALSE", "NOT GIVEN"],
        correctAnswer: "FALSE",
      },
      {
        id: "q7",
        type: "short_answer",
        question: "In what year did the first website go live?",
        correctAnswer: "1991",
      },
    ],
  },
};

async function getPassageData(id: string) {
  try {
    const [passage] = await db
      .select()
      .from(readingPassages)
      .where(eq(readingPassages.id, id));
    
    if (passage) {
      const questions = await db
        .select()
        .from(readingQuestions)
        .where(eq(readingQuestions.passageId, passage.id));
      
      return {
        id: passage.id,
        title: passage.title,
        passage: passage.passage,
        timeMinutes: passage.timeMinutes,
        questions: questions.map((q: any) => ({
          id: q.id,
          type: q.type,
          question: q.question,
          options: q.options || undefined,
          correctAnswer: q.correctAnswer as string | string[],
        })),
      };
    }
  } catch (error) {
    console.error("Fetch reading passage details error:", error);
  }
  return mockData[id] || null;
}

export default async function ReadingTestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getPassageData(id);
  if (!data) return <div className="p-6">Test not found.</div>;
  return <ReadingTest data={data} />;
}
