import { GoogleGenAI } from "@google/genai";
import { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const geminiApi = new GoogleGenAI({
  apiKey: process.env.GEMINI_KEY!,
});
export const POST = async (req: NextRequest) => {
  try {
    const { chat } = await req.json();
    if (!chat) {
      return NextResponse.json({ err: "No chat message." }, { status: 400 });
    }
    const contents = [
      {
        role: "user",
        parts: [{ text: chat }],
      },
    ];
    const res = await geminiApi.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
    });

    let responseText = "";
    if (res.text) {
      responseText = res.text;
    } else if (res.candidates && res.candidates[0]?.content?.parts?.[0]?.text) {
      responseText = res.candidates[0].content.parts[0].text;
    } else {
      responseText = JSON.stringify(res);
    }
    return NextResponse.json({ text: responseText }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ err }, { status: 400 });
  }
};
