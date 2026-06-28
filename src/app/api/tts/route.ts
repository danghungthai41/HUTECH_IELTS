import { NextResponse } from "next/server";

// Deepgram Text-to-Speech API
export async function POST(req: Request) {
  try {
    const { text, voice = "aura-asteria-en" } = await req.json();

    if (!process.env.DEEPGRAM_API_KEY) {
      return NextResponse.json({ error: "Deepgram API key not configured" }, { status: 503 });
    }

    const response = await fetch(
      `https://api.deepgram.com/v1/speak?model=${voice}`,
      {
        method: "POST",
        headers: {
          Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      }
    );

    if (!response.ok) {
      throw new Error(`Deepgram error: ${response.statusText}`);
    }

    const audioBuffer = await response.arrayBuffer();
    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("TTS error:", error);
    return NextResponse.json({ error: "TTS failed" }, { status: 500 });
  }
}
