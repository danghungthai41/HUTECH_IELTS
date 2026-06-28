import { SpeakingTest } from "@/components/speaking/SpeakingTest";
import { db } from "@/lib/db";
import { speakingTests } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const mockTests: Record<string, {
  id: string; title: string; part: "part1" | "part2" | "part3";
  questions: string[]; cueCard?: string;
  preparationTime?: number; speakingTime: number;
}> = {
  s1: {
    id: "s1",
    title: "Part 1 – Hometown & Daily Life",
    part: "part1",
    questions: [
      "Where are you from? Can you describe your hometown?",
      "What do you currently do? Are you working or studying?",
      "Do you enjoy living in your city or town? Why?",
      "What do you usually do in your free time?",
    ],
    speakingTime: 300,
  },
  s2: {
    id: "s2",
    title: "Part 2 – Describe a memorable journey",
    part: "part2",
    questions: ["Describe a memorable journey you have had."],
    cueCard:
      "You should say:\n• Where you went\n• Who you went with\n• What you did there\n• And explain why it was so memorable.",
    preparationTime: 60,
    speakingTime: 120,
  },
  s3: {
    id: "s3",
    title: "Part 3 – Technology & Society",
    part: "part3",
    questions: [
      "How has technology changed the way people communicate with each other?",
      "Do you think social media has a positive or negative effect on society? Why?",
      "What do you think the future of technology looks like in the next 20 years?",
    ],
    speakingTime: 360,
  },
};

async function getTest(id: string) {
  try {
    const [dbTest] = await db
      .select()
      .from(speakingTests)
      .where(eq(speakingTests.id, id));
    if (dbTest) {
      return {
        id: dbTest.id,
        title: dbTest.title,
        part: dbTest.part,
        questions: dbTest.questions,
        cueCard: dbTest.cueCard || undefined,
        preparationTime: dbTest.preparationTime || undefined,
        speakingTime: dbTest.speakingTime,
      };
    }
  } catch (error) {
    console.error("Fetch speaking test error:", error);
  }
  return mockTests[id] || null;
}

export default async function SpeakingTestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const test = await getTest(id);
  if (!test) return <div className="p-6">Test not found.</div>;
  return <SpeakingTest test={test} />;
}
