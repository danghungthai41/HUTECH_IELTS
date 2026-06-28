import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function countWords(text: string): number {
  return text
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length;
}

export function bandToColor(band: number): string {
  if (band >= 8) return "text-emerald-600";
  if (band >= 7) return "text-green-600";
  if (band >= 6) return "text-yellow-600";
  if (band >= 5) return "text-orange-600";
  return "text-red-600";
}

/**
 * Compares a student's answer against the correct answer (string or string[])
 * case-insensitively and trimmed. An array of correct answers is treated as
 * "any of these is acceptable".
 */
export function isAnswerCorrect(
  studentAnswer: string | undefined,
  correctAnswer: unknown
): boolean {
  const student = (studentAnswer || "").trim().toLowerCase();
  if (!student) return false;
  if (Array.isArray(correctAnswer)) {
    return correctAnswer.some(
      (c) => String(c).trim().toLowerCase() === student
    );
  }
  if (typeof correctAnswer === "string") {
    return correctAnswer.trim().toLowerCase() === student;
  }
  return false;
}

export function bandToLabel(band: number): string {
  if (band >= 9) return "Expert";
  if (band >= 8) return "Very Good";
  if (band >= 7) return "Good";
  if (band >= 6) return "Competent";
  if (band >= 5) return "Modest";
  return "Limited";
}
