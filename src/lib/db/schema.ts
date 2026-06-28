import {
  mysqlTable,
  varchar,
  text,
  timestamp,
  int,
  json,
  boolean,
  mysqlEnum,
} from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

// Users table (Replacing Profiles)
export const users = mysqlTable("users", {
  id: varchar("id", { length: 36 }).primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  fullName: varchar("full_name", { length: 255 }),
  avatarUrl: text("avatar_url"),
  role: varchar("role", { length: 20 }).notNull().default("user"), // 'user' | 'admin'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// For backward compatibility / easy import:
export const profiles = users;

// ─── WRITING ─────────────────────────────────────────────────────────────────
export const writingTests = mysqlTable("writing_tests", {
  id: varchar("id", { length: 36 }).primaryKey(),
  title: text("title").notNull(),
  task: mysqlEnum("task", ["task1", "task2"]).notNull(),
  prompt: text("prompt").notNull(),
  imageUrl: text("image_url"), // for task1 charts/graphs
  timeMinutes: int("time_minutes").notNull().default(40),
  difficulty: mysqlEnum("difficulty", ["easy", "medium", "hard"]).notNull().default("medium"),
  isPublished: boolean("is_published").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const writingSubmissions = mysqlTable("writing_submissions", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
  testId: varchar("test_id", { length: 36 }).notNull().references(() => writingTests.id),
  essay: text("essay").notNull(),
  wordCount: int("word_count").notNull().default(0),
  // AI scores (0-9 band)
  taskAchievement: varchar("task_achievement", { length: 10 }),
  coherenceCohesion: varchar("coherence_cohesion", { length: 10 }),
  lexicalResource: varchar("lexical_resource", { length: 10 }),
  grammaticalRange: varchar("grammatical_range", { length: 10 }),
  overallBand: varchar("overall_band", { length: 10 }),
  feedback: text("feedback"),
  improvedEssay: text("improved_essay"),
  timeTaken: int("time_taken"), // seconds
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── SPEAKING ─────────────────────────────────────────────────────────────────
export const speakingTests = mysqlTable("speaking_tests", {
  id: varchar("id", { length: 36 }).primaryKey(),
  title: text("title").notNull(),
  part: mysqlEnum("part", ["part1", "part2", "part3"]).notNull(),
  questions: json("questions").notNull().$type<string[]>(),
  cueCard: text("cue_card"), // for part2
  preparationTime: int("preparation_time").default(60), // seconds, part2
  speakingTime: int("speaking_time").notNull().default(120),
  difficulty: mysqlEnum("difficulty", ["easy", "medium", "hard"]).notNull().default("medium"),
  isPublished: boolean("is_published").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const speakingSubmissions = mysqlTable("speaking_submissions", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
  testId: varchar("test_id", { length: 36 }).notNull().references(() => speakingTests.id),
  transcripts: json("transcripts").notNull().$type<string[]>(),
  audioUrls: json("audio_urls").$type<string[]>(),
  // AI scores
  fluencyCoherence: varchar("fluency_coherence", { length: 10 }),
  lexicalResource: varchar("lexical_resource", { length: 10 }),
  grammaticalRange: varchar("grammatical_range", { length: 10 }),
  pronunciation: varchar("pronunciation", { length: 10 }),
  overallBand: varchar("overall_band", { length: 10 }),
  feedback: text("feedback"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── READING ─────────────────────────────────────────────────────────────────
export const readingPassages = mysqlTable("reading_passages", {
  id: varchar("id", { length: 36 }).primaryKey(),
  title: text("title").notNull(),
  passage: text("passage").notNull(),
  difficulty: mysqlEnum("difficulty", ["easy", "medium", "hard"]).notNull().default("medium"),
  timeMinutes: int("time_minutes").notNull().default(20),
  isPublished: boolean("is_published").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const readingQuestions = mysqlTable("reading_questions", {
  id: varchar("id", { length: 36 }).primaryKey(),
  passageId: varchar("passage_id", { length: 36 }).notNull().references(() => readingPassages.id),
  type: mysqlEnum("type", ["multiple_choice", "multiple_answers", "short_answer", "true_false_not_given", "matching", "fill_blank"]).notNull(),
  question: text("question").notNull(),
  options: json("options").$type<string[]>(), // for MC / MA / matching
  correctAnswer: json("correct_answer").notNull(), // string or string[]
  explanation: text("explanation"),
  orderIndex: int("order_index").notNull().default(0),
});

export const readingSubmissions = mysqlTable("reading_submissions", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
  passageId: varchar("passage_id", { length: 36 }).notNull().references(() => readingPassages.id),
  answers: json("answers").notNull().$type<Record<string, string | string[]>>(),
  score: int("score").notNull().default(0),
  totalQuestions: int("total_questions").notNull(),
  timeTaken: int("time_taken"),
  feedback: text("feedback"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── LISTENING ────────────────────────────────────────────────────────────────
export const listeningTests = mysqlTable("listening_tests", {
  id: varchar("id", { length: 36 }).primaryKey(),
  title: text("title").notNull(),
  audioUrl: text("audio_url").notNull(),
  transcript: text("transcript").notNull(),
  difficulty: mysqlEnum("difficulty", ["easy", "medium", "hard"]).notNull().default("medium"),
  timeMinutes: int("time_minutes").notNull().default(30),
  isPublished: boolean("is_published").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const listeningQuestions = mysqlTable("listening_questions", {
  id: varchar("id", { length: 36 }).primaryKey(),
  testId: varchar("test_id", { length: 36 }).notNull().references(() => listeningTests.id),
  type: mysqlEnum("type", ["multiple_choice", "multiple_answers", "short_answer", "true_false_not_given", "matching", "fill_blank"]).notNull(),
  question: text("question").notNull(),
  options: json("options").$type<string[]>(),
  correctAnswer: json("correct_answer").notNull(),
  orderIndex: int("order_index").notNull().default(0),
});

export const listeningSubmissions = mysqlTable("listening_submissions", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
  testId: varchar("test_id", { length: 36 }).notNull().references(() => listeningTests.id),
  answers: json("answers").notNull().$type<Record<string, string | string[]>>(),
  score: int("score").notNull().default(0),
  totalQuestions: int("total_questions").notNull(),
  timeTaken: int("time_taken"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── RELATIONS ────────────────────────────────────────────────────────────────
export const usersRelations = relations(users, ({ many }) => ({
  writingSubmissions: many(writingSubmissions),
  speakingSubmissions: many(speakingSubmissions),
  readingSubmissions: many(readingSubmissions),
  listeningSubmissions: many(listeningSubmissions),
}));

export const profilesRelations = usersRelations;

export const readingPassagesRelations = relations(readingPassages, ({ many }) => ({
  questions: many(readingQuestions),
  submissions: many(readingSubmissions),
}));

export const listeningTestsRelations = relations(listeningTests, ({ many }) => ({
  questions: many(listeningQuestions),
  submissions: many(listeningSubmissions),
}));
