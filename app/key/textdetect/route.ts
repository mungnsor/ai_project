import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const client = new GoogleGenAI({
  apiKey: process.env.GEMINI_KEY!,
});

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }
    const sendPromt = `only ingredients ${prompt}`;
    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: sendPromt }] }],
    });
    const text = response;
    return NextResponse.json({ text: response });
  } catch (error: any) {
    console.error("Gemini error:", error);
    return NextResponse.json(
      { error: "Failed to generate response" },
      { status: 500 }
    );
  }
}
