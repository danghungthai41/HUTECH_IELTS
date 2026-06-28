import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { writingTests } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { WritingEditor } from "@/components/writing/WritingEditor";

async function getTest(id: string) {
  // Mock data for demo
  const mockTests: Record<string, {
    id: string; title: string; task: "task1" | "task2"; prompt: string;
    imageUrl: string | null; timeMinutes: number; difficulty: "easy" | "medium" | "hard";
  }> = {
    "1": {
      id: "1",
      title: "Describe a Bar Chart - City Population",
      task: "task1",
      prompt:
        "The chart below shows the population of three cities (London, Paris, and Berlin) from 2000 to 2020. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\n[Bar Chart: London grew from 7.5M to 9.1M, Paris 10.2M to 11.5M, Berlin 3.4M to 3.7M]",
      imageUrl: null,
      timeMinutes: 20,
      difficulty: "medium",
    },
    "2": {
      id: "2",
      title: "Technology and Society",
      task: "task2",
      prompt:
        "Some people believe that technology has made our lives more complicated. Others feel that it has made our lives easier and more convenient. Discuss both views and give your own opinion.",
      imageUrl: null,
      timeMinutes: 40,
      difficulty: "hard",
    },
    "3": {
      id: "3",
      title: "Line Graph - Global Temperature",
      task: "task1",
      prompt:
        "The graph below shows changes in global average temperatures between 1960 and 2020. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\n[Line Graph: Temperature rose from 13.9°C in 1960 to 14.9°C in 2020, with a sharp increase after 1990]",
      imageUrl: null,
      timeMinutes: 20,
      difficulty: "easy",
    },
  };

  if (mockTests[id]) return mockTests[id];

  try {
    const [test] = await db.select().from(writingTests).where(eq(writingTests.id, id));
    return test || null;
  } catch {
    return null;
  }
}

export default async function WritingTestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const test = await getTest(id);
  if (!test) notFound();
  return <WritingEditor test={test} />;
}
