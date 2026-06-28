// ── Provider configuration ───────────────────────────────────────────────────
// Despite the historical "fireworks" naming, the provider is configured purely
// from env. It works with any OpenAI-compatible Chat Completions endpoint
// (Fireworks, OpenAI, Google Gemini's OpenAI-compat API, etc.).

const AI_API_KEY = process.env.FIREWORKS_API_KEY ?? "";
const AI_BASE_URL = (
  process.env.FIREWORKS_BASE_URL ?? "https://api.fireworks.ai/inference/v1"
).replace(/\/$/, "");

export const aiModel =
  process.env.AI_MODEL ?? "accounts/fireworks/models/llama-v3p1-70b-instruct";

// Gemini 2.5 models spend a large, hidden "thinking" budget that is billed
// against max_tokens and can swallow the entire response, leaving the visible
// answer truncated (finish_reason: "length"). Disabling reasoning keeps the
// full answer within budget. Only sent to models that understand the flag.
const SUPPORTS_REASONING_EFFORT = /gemini|gpt-5|o[134]/i.test(aiModel);

interface GenOptions {
  maxTokens?: number;
  temperature?: number;
  json?: boolean;
}

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

function buildBody(messages: ChatMessage[], opts: GenOptions, stream: boolean) {
  return {
    model: aiModel,
    messages,
    max_tokens: opts.maxTokens ?? 1500,
    temperature: opts.temperature ?? 0.3,
    stream,
    ...(SUPPORTS_REASONING_EFFORT ? { reasoning_effort: "none" } : {}),
    ...(opts.json ? { response_format: { type: "json_object" } } : {}),
  };
}

async function chatCompletion(
  messages: ChatMessage[],
  opts: GenOptions = {}
): Promise<string> {
  if (!AI_API_KEY) {
    throw new Error("AI API key is not configured (FIREWORKS_API_KEY).");
  }
  const res = await fetch(`${AI_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${AI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(buildBody(messages, opts, false)),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    if (res.status === 429) {
      throw new Error(
        "AI rate limit/quota exceeded (429). The configured model's free-tier " +
          "quota is used up — wait a minute or use a key with higher limits."
      );
    }
    throw new Error(`AI request failed (${res.status}): ${detail.slice(0, 300)}`);
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== "string") {
    throw new Error("AI response did not contain any text content.");
  }
  return content.trim();
}

/** Stream a chat completion as a plain-text byte stream (for the chat UI). */
export async function streamChatText(
  messages: ChatMessage[],
  opts: GenOptions = {}
): Promise<ReadableStream<Uint8Array>> {
  if (!AI_API_KEY) {
    throw new Error("AI API key is not configured (FIREWORKS_API_KEY).");
  }
  const res = await fetch(`${AI_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${AI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(buildBody(messages, opts, true)),
  });

  if (!res.ok || !res.body) {
    const detail = await res.text().catch(() => "");
    throw new Error(`AI request failed (${res.status}): ${detail.slice(0, 300)}`);
  }

  // Transform the OpenAI-style SSE stream into raw text deltas.
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";

  return res.body.pipeThrough(
    new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        buffer += decoder.decode(chunk, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) continue;
          const payload = trimmed.slice(5).trim();
          if (payload === "[DONE]") return;
          try {
            const delta = JSON.parse(payload)?.choices?.[0]?.delta?.content;
            if (delta) controller.enqueue(encoder.encode(delta));
          } catch {
            // ignore keep-alive / non-JSON lines
          }
        }
      },
    })
  );
}

// ── Generation helpers ───────────────────────────────────────────────────────

/** Generate plain text from the configured model. */
export async function generateAIText(
  prompt: string,
  opts: { maxTokens?: number; temperature?: number } = {}
): Promise<string> {
  return chatCompletion([{ role: "user", content: prompt }], opts);
}

/**
 * Parse JSON returned by an LLM, tolerating the most common mistakes:
 * markdown fences, surrounding prose, trailing commas, and missing commas
 * between adjacent objects/arrays.
 */
export function parseLooseJson<T = unknown>(raw: string): T {
  const cleaned = raw
    .replace(/^\s*```(?:json)?/i, "")
    .replace(/```\s*$/i, "")
    .trim();
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) {
    throw new Error("Invalid AI response format: no JSON object found");
  }
  const candidate = match[0];
  const attempts = [
    candidate,
    candidate
      .replace(/}\s*{/g, "},{") // missing comma between objects in an array
      .replace(/]\s*\[/g, "],[") // missing comma between arrays
      .replace(/,(\s*[}\]])/g, "$1"), // trailing comma before } or ]
  ];
  let lastErr: unknown;
  for (const a of attempts) {
    try {
      return JSON.parse(a) as T;
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr;
}

/**
 * Generate a JSON object from the model. Uses JSON response mode where the
 * provider supports it, then parses defensively. Throws if no valid JSON can
 * be recovered.
 */
export async function generateAIJson<T = unknown>(
  prompt: string,
  opts: { maxTokens?: number; temperature?: number } = {}
): Promise<T> {
  const raw = await chatCompletion([{ role: "user", content: prompt }], {
    ...opts,
    json: true,
  });
  return parseLooseJson<T>(raw);
}

// ── Prompt templates ─────────────────────────────────────────────────────────

export const WRITING_SCORE_PROMPT = (
  task: "task1" | "task2",
  prompt: string,
  essay: string
) => `You are an expert IELTS examiner. Score the following IELTS Writing ${task === "task1" ? "Task 1" : "Task 2"} essay on the official IELTS band scale (0-9) for each criterion.

## Exam Prompt
${prompt}

## Student Essay
${essay}

Return a JSON object with this exact structure:
{
  "taskAchievement": "6.5",
  "coherenceCohesion": "7.0",
  "lexicalResource": "6.5",
  "grammaticalRange": "7.0",
  "overallBand": "6.5",
  "feedback": "Detailed paragraph-by-paragraph feedback explaining strengths and areas for improvement...",
  "improvedEssay": "A band 8+ version of the essay addressing all the identified weaknesses..."
}

Only return valid JSON.`;

export const SPEAKING_SCORE_PROMPT = (
  part: string,
  questions: string[],
  transcripts: string[]
) => `You are an expert IELTS examiner. Score the following IELTS Speaking ${part} responses.

## Questions & Responses
${questions.map((q, i) => `Q: ${q}\nA: ${transcripts[i] ?? "(no response)"}`).join("\n\n")}

Return a JSON object:
{
  "fluencyCoherence": "6.5",
  "lexicalResource": "7.0",
  "grammaticalRange": "6.5",
  "pronunciation": "7.0",
  "overallBand": "7.0",
  "feedback": "Detailed feedback on each criterion with specific examples from the responses..."
}

Only return valid JSON.`;

export const READING_EXPLAIN_PROMPT = (
  passage: string,
  question: string,
  correctAnswer: string,
  studentAnswer: string
) => `You are an expert IELTS tutor. The student answered a Reading question incorrectly.

Passage excerpt:
${passage.substring(0, 500)}...

Question: ${question}
Correct answer: ${correctAnswer}
Student's answer: ${studentAnswer}

Explain in 2-3 sentences why the correct answer is right and why the student's answer is wrong. Be specific about the relevant part of the passage.`;

export const WRITING_GRAMMAR_PROMPT = (essay: string) => `You are an expert English teacher. Analyze the following essay and check for grammatical, spelling, and punctuation errors.

## Essay
${essay}

Identify all grammatical errors. For each error, provide:
1. The incorrect text snippet (original).
2. The correct text snippet (correction).
3. A short, clear explanation in Vietnamese of why it is wrong and how to fix it.

Also, provide the fully corrected essay.

Return a JSON object with this exact structure:
{
  "errors": [
    {
      "original": "incorrect text",
      "correction": "corrected text",
      "explanation": "Giải thích lỗi sai bằng tiếng Việt..."
    }
  ],
  "correctedEssay": "The entire essay with all errors fixed"
}

Only return valid JSON.`;

export const READING_HINT_PROMPT = (
  passage: string,
  question: string
) => `You are an expert IELTS tutor. A student is working on an IELTS Reading question and needs a helpful hint.
Do NOT give the correct answer directly. Instead, point them to where they can find the answer in the passage (e.g. quote a small surrounding phrase or describe which paragraph/section it is in) and give a helpful tip on what keywords to look for.

## Passage Excerpt
${passage.substring(0, 4000)}

## Question
${question}

Write a short hint in Vietnamese (1-2 sentences max).`;

export const WRITING_IDEAS_PROMPT = (
  task: "task1" | "task2",
  prompt: string
) => `You are an expert IELTS Writing tutor. Suggest an outline and useful academic vocabulary for the following IELTS Writing prompt.

## Prompt
${prompt}

Provide:
1. A structured essay outline (dàn ý chi tiết) showing Introduction, Body Paragraphs, and Conclusion.
2. A list of 5-8 useful high-band academic vocabulary words or collocations related to the topic, with their Vietnamese meanings and examples.

Return a JSON object with this exact structure:
{
  "outline": "Markdown formatted string containing the structured outline in Vietnamese...",
  "vocabulary": [
    { "word": "academic word/collocation", "meaning": "Nghĩa tiếng Việt", "example": "English example sentence" }
  ]
}

Only return valid JSON.`;

export const SPEAKING_SAMPLE_PROMPT = (
  question: string
) => `You are an expert IELTS Speaking tutor. Provide a Band 8.0+ sample response and a list of useful vocabulary for the following IELTS Speaking question.

## Question
${question}

Provide:
1. A natural, high-band model answer (bài nói mẫu).
2. A list of 3-5 advanced vocabulary words, idioms, or collocations from the model answer with their Vietnamese meanings.

Return a JSON object with this exact structure:
{
  "sampleAnswer": "Band 8.0+ sample answer text...",
  "vocabulary": [
    { "word": "advanced phrase", "meaning": "Nghĩa tiếng Việt", "example": "Example usage" }
  ]
}

Only return valid JSON.`;


