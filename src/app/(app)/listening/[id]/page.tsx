import { ListeningTest } from "@/components/listening/ListeningTest";
import { db } from "@/lib/db";
import { listeningTests, listeningQuestions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const mockData: Record<string, {
  id: string; title: string; audioUrl: string; transcript: string; timeMinutes: number;
  questions: { id: string; type: string; question: string; options?: string[]; correctAnswer: string }[];
}> = {
  l1: {
    id: "l1",
    title: "Section 1 – Booking a Hotel",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    transcript: `Receptionist: Good afternoon, Sunrise Hotel. How can I help you?
Customer: Hello, I'd like to make a reservation please.
Receptionist: Certainly! What dates are you looking at?
Customer: From the 15th to the 20th of March.
Receptionist: And how many guests?
Customer: Just two adults.
Receptionist: We have a deluxe double room available for £120 per night. Would that suit you?
Customer: Yes, that sounds great. Could I also request a room with a sea view?
Receptionist: Of course. Could I take your name?
Customer: It's Johnson. Sarah Johnson.
Receptionist: And a contact number?
Customer: 07891 234567.
Receptionist: Perfect. Your booking reference is SH2024. Shall I send a confirmation email?
Customer: Yes please, to sarah.johnson@email.com.`,
    timeMinutes: 10,
    questions: [
      { id: "lq1", type: "fill_blank", question: "The customer wants to check in on __________.", correctAnswer: "15th March" },
      { id: "lq2", type: "fill_blank", question: "The number of guests is __________.", correctAnswer: "two adults" },
      { id: "lq3", type: "multiple_choice", question: "How much does the room cost per night?", options: ["A. £100", "B. £110", "C. £120", "D. £150"], correctAnswer: "C" },
      { id: "lq4", type: "fill_blank", question: "The customer's surname is __________.", correctAnswer: "Johnson" },
      { id: "lq5", type: "fill_blank", question: "The booking reference number is __________.", correctAnswer: "SH2024" },
    ],
  },
};

async function getListeningTestData(id: string) {
  try {
    const [test] = await db
      .select()
      .from(listeningTests)
      .where(eq(listeningTests.id, id));
    
    if (test) {
      const questions = await db
        .select()
        .from(listeningQuestions)
        .where(eq(listeningQuestions.testId, test.id));
      
      return {
        id: test.id,
        title: test.title,
        audioUrl: test.audioUrl,
        transcript: test.transcript,
        timeMinutes: test.timeMinutes,
        questions: questions.map((q: any) => ({
          id: q.id,
          type: q.type,
          question: q.question,
          options: q.options || undefined,
          correctAnswer: q.correctAnswer as string,
        })),
      };
    }
  } catch (error) {
    console.error("Fetch listening test details error:", error);
  }
  return mockData[id] || null;
}

export default async function ListeningTestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getListeningTestData(id);
  if (!data) return <div className="p-6">Test not found.</div>;
  return <ListeningTest data={data} />;
}
