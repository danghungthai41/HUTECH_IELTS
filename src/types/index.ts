export type Skill = "writing" | "speaking" | "reading" | "listening";
export type Difficulty = "easy" | "medium" | "hard";
export type WritingTask = "task1" | "task2";
export type SpeakingPart = "part1" | "part2" | "part3";
export type QuestionType =
  | "multiple_choice"
  | "multiple_answers"
  | "short_answer"
  | "true_false_not_given"
  | "matching"
  | "fill_blank";

export interface WritingScoreResult {
  taskAchievement: string;
  coherenceCohesion: string;
  lexicalResource: string;
  grammaticalRange: string;
  overallBand: string;
  feedback: string;
  improvedEssay: string;
}

export interface SpeakingScoreResult {
  fluencyCoherence: string;
  lexicalResource: string;
  grammaticalRange: string;
  pronunciation: string;
  overallBand: string;
  feedback: string;
}

export interface Profile {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  role: string;
  createdAt: Date;
}
