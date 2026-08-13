"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  ChevronDown,
  ChevronUp,
  Send,
  Bot,
  User,
  ShieldAlert,
  MessageSquare,
  Minus,
  Maximize2,
} from "lucide-react";
import { executeCopilotTool, CopilotToolResult } from "@/lib/copilot/tools";
import { StructuredResults } from "./structured-results";

interface Message {
  id: string;
  sender: "user" | "copilot";
  text: string;
  toolResult?: CopilotToolResult;
  timestamp: string;
}

export function ChatDrawer() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "msg-1",
      sender: "copilot",
      text: "Greetings! I am GURUKUL Copilot. I can query attendance risk flags, document OCR queues, or resolve timetable clashes for you.",
      timestamp: "Just now",
    },
  ]);
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isExpanded) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isExpanded]);

  const handleSend = async (customQuery?: string) => {
    const query = customQuery || input;
    if (!query.trim()) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customQuery) setInput("");
    setIsThinking(true);

    const result = await executeCopilotTool(query);

    const copilotMsg: Message = {
      id: `copilot-${Date.now()}`,
      sender: "copilot",
      text: result.summary,
      toolResult: result,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setIsThinking(false);
    setMessages((prev) => [...prev, copilotMsg]);
  };

  return (
    <div className="fixed bottom-0 right-6 z-50 flex flex-col items-end select-none">
      {/* ------------------------------------------------------------- */}
      {/* 1. LINKEDIN-STYLE MINIMIZED BAR (ALWAYS VISIBLE AT BOTTOM RIGHT) */}
      {/* ------------------------------------------------------------- */}
      {!isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="bg-gurukul-dark text-white hover:bg-slate-900 border border-white/20 rounded-t-xl px-4 py-2.5 shadow-2xl flex items-center gap-3 transition-all duration-200 group hover:-translate-y-0.5"
        >
          <div className="relative">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-gurukul-tech to-gurukul-ocean flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4 text-white animate-pulse" />
            </div>
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-gurukul-dark" />
          </div>

          <div className="text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white tracking-tight">GURUKUL Copilot</span>
              <span className="text-[9px] bg-gurukul-tech/30 text-gurukul-ocean font-semibold px-1.5 py-0.2 rounded uppercase">
                AI
              </span>
            </div>
            <p className="text-[10px] text-slate-400 truncate max-w-[180px]">
              Click to open assistant console
            </p>
          </div>

          <ChevronUp className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors ml-1" />
        </button>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. EXPANDED MESSAGING PANEL (DRAWER OPENING UP FROM BOTTOM RIGHT) */}
      {/* ------------------------------------------------------------- */}
      {isExpanded && (
        <div className="w-80 sm:w-96 h-[520px] bg-white rounded-t-2xl shadow-2xl border border-slate-300 flex flex-col justify-between overflow-hidden animate-in slide-in-from-bottom duration-200">
          {/* LinkedIn-style Messaging Header */}
          <div className="p-3.5 bg-gradient-to-r from-gurukul-dark via-[#0a1824] to-[#1e3bb3] text-white flex items-center justify-between border-b border-white/10 cursor-pointer"
               onClick={() => setIsExpanded(false)}
          >
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-gurukul-ocean">
                  <Sparkles className="w-4 h-4 text-gurukul-ocean" />
                </div>
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-gurukul-dark" />
              </div>
              <div>
                <h3 className="text-xs font-bold tracking-tight text-white flex items-center gap-1.5">
                  <span>GURUKUL Copilot</span>
                  <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-semibold uppercase">
                    Active
                  </span>
                </h3>
                <p className="text-[10px] text-gurukul-ocean font-medium">Function Execution Engine</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(false);
                }}
                className="p-1 rounded-md text-white/70 hover:bg-white/10 hover:text-white transition-colors"
                title="Minimize Copilot"
              >
                <Minus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Chat Transcript Stream */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-slate-50/70 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[88%] p-3 rounded-xl text-xs leading-relaxed ${
                    m.sender === "user"
                      ? "bg-gurukul-dark text-white rounded-br-none shadow-xs"
                      : "bg-white border border-slate-200 text-gurukul-dark rounded-bl-none shadow-subtle"
                  }`}
                >
                  <p>{m.text}</p>

                  {/* Render Structured Inline Tables / Cards */}
                  {m.toolResult && <StructuredResults result={m.toolResult} />}
                </div>

                <span className="text-[9px] text-slate-400 mt-1 px-1">{m.timestamp}</span>
              </div>
            ))}

            {isThinking && (
              <div className="flex items-center gap-2 text-xs text-gurukul-tech font-medium p-2 bg-white rounded-lg border border-slate-200 w-fit animate-pulse shadow-xs">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Executing Service Tool & Structuring Response...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Query Prompts */}
          <div className="p-3 bg-white border-t border-slate-200 space-y-2">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => handleSend("Show students below 75% attendance")}
                className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-2.5 py-1 rounded-full whitespace-nowrap border border-slate-200 transition-colors"
              >
                📊 Risk (&lt;75%)
              </button>
              <button
                onClick={() => handleSend("Show pending document reviews")}
                className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-2.5 py-1 rounded-full whitespace-nowrap border border-slate-200 transition-colors"
              >
                📄 Pending Documents
              </button>
              <button
                onClick={() => handleSend("Show timetable conflicts")}
                className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-2.5 py-1 rounded-full whitespace-nowrap border border-slate-200 transition-colors"
              >
                🗓️ Timetable Clashes
              </button>
            </div>

            {/* Input Bar */}
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask Copilot (e.g. attendance risks)..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-3 pr-10 py-2 text-xs text-gurukul-dark focus:outline-none focus:border-gurukul-tech"
              />
              <button
                onClick={() => handleSend()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-gurukul-tech text-white rounded-lg hover:bg-gurukul-tech/90 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
