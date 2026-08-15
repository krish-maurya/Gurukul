import { NextResponse } from "next/server";
import { answerCopilot } from "@/lib/copilot/engine";
import { generateCasualReply, isCasualGreeting, polishGroundedResponse, understandCopilotRequest } from "@/lib/copilot/nlp";
import type { CopilotContext } from "@/lib/copilot/types";

// This project currently uses client-side mock sessions. Keep identity mapping server-owned
// so the caller cannot elevate a role by supplying a role header. Replace this resolver with
// the application's authenticated server session when a real auth provider is connected.
const DEVELOPMENT_SESSIONS: Record<string, CopilotContext> = {
  "user-admin-1": { userId: "user-admin-1", name: "Dr. Eleanor Vance", role: "ADMIN" },
  "user-teacher-1": { userId: "user-teacher-1", name: "Prof. Alan Turing", role: "TEACHER" },
};

export async function POST(request: Request) {
  const userId = request.headers.get("x-gurukul-user-id");
  const context = userId ? DEVELOPMENT_SESSIONS[userId] : undefined;
  if (!context) return NextResponse.json({ message: "Sign in to use GURUKUL Assistant." }, { status: 401 });
  try {
    const body = await request.json();
    if (typeof body?.query !== "string") return NextResponse.json({ message: "A valid question is required." }, { status: 400 });
    const history: Array<{ role: string; content: string; intent?: string }> = Array.isArray(body.history) ? body.history : [];
    if (isCasualGreeting(body.query)) {
      const casualMessage = await generateCasualReply(body.query, context.name);
      if (casualMessage) return NextResponse.json({ message: casualMessage, intent: "AMBIGUOUS_QUERY" });
    }
    const normalizedQuery = await understandCopilotRequest(body.query, history);
    const retrievedResponse = await answerCopilot(normalizedQuery, context, history);
    const response = await polishGroundedResponse(retrievedResponse, body.query, context);
    return NextResponse.json(response);
  } catch {
    return NextResponse.json({ message: "I couldn't process that request right now." }, { status: 500 });
  }
}
