"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import ItineraryView from "./ItineraryView";
import {
  MessageSquare,
  X,
  Send,
  RotateCcw,
  Sparkles,
  Bot,
  User,
  Compass,
} from "lucide-react";

const INITIAL_MESSAGE = {
  id: "init-1",
  role: "assistant",
  content:
    "Hello! I'm Aura, your Travel Unbounded AI Concierge. Where would you like to travel next, or what kind of trip are you dreaming of?",
};

const STARTER_PROMPTS = [
  "🌲 Kerala — Backwaters & Hill Stations",
  "🦁 Kenya — Wildlife Safari Adventure",
  "🏔️ Himachal Pradesh — Mountains & Snow",
  "🏖️ Andaman — Beach & Island Escape",
  "🕌 Ladakh — High Altitude Himalayan Trek",
  "🌏 Vietnam — Cultural & Bay Cruises",
];

// Context-aware quick replies shown after conversation starts
const QUICK_REPLIES_BY_PHASE = {
  destination: ["Beach & Islands 🏖️", "Wildlife Safari 🦁", "Mountain Adventure 🏔️", "Cultural Heritage 🕌", "Backwaters & Hills 🌿"],
  duration:    ["3 Days", "4 Days", "5 Days", "7 Days", "10 Days", "2 Weeks"],
  travelers:   ["Solo Traveler", "Couple", "Family with Kids", "Group of Friends"],
  budget:      ["Standard", "Deluxe", "Luxury"],
  interests:   ["Wildlife & Photography", "Trekking & Adventure", "Wellness & Yoga", "Local Cuisine", "Cultural Temples", "Water Sports"],
  dates:       ["This Month", "Next Month", "December", "January", "March", "Flexible"],
};

function getQuickReplies(messages) {
  // Detect phase from the LAST ASSISTANT message
  const lastBotMsg = [...messages].reverse().find(m => m.role === "assistant");
  const botText = (lastBotMsg?.content || "").toLowerCase();

  // ── Check what the bot is currently ASKING (look for the question part) ──

  // DATES question (check early — "when" is unambiguous)
  if (
    botText.includes("when are you") ||
    botText.includes("when do you") ||
    botText.includes("when would you") ||
    botText.includes("travel date") ||
    (botText.includes("month") && (botText.includes("plan") || botText.includes("travel") || botText.includes("prefer"))) ||
    (botText.includes("season") && botText.includes("mind")) ||
    botText.includes("flexible with date")
  ) return QUICK_REPLIES_BY_PHASE.dates;

  // INTERESTS question (check before budget — Gemini often says "Deluxe... Do you have any interests?")
  if (
    (botText.includes("activities") && (botText.includes("must") || botText.includes("specific") || botText.includes("any"))) ||
    (botText.includes("interests") && (botText.includes("must") || botText.includes("specific") || botText.includes("any"))) ||
    botText.includes("must-have") ||
    (botText.includes("photography") && botText.includes("?")) ||
    (botText.includes("trekking") && botText.includes("?")) ||
    botText.includes("birdwatch") ||
    botText.includes("nature walk") ||
    botText.includes("water sports")
  ) return QUICK_REPLIES_BY_PHASE.interests;

  // BUDGET question (only when bot is ASKING about style/accommodation — not just acknowledging)
  if (
    (botText.includes("preferred") && (botText.includes("style") || botText.includes("accommodation"))) ||
    (botText.includes("standard") && botText.includes("deluxe") && botText.includes("luxury")) ||
    botText.includes("budget level") ||
    botText.includes("travel style")
  ) return QUICK_REPLIES_BY_PHASE.budget;

  // TRAVELERS question
  if (
    botText.includes("who will be") ||
    botText.includes("who is travel") ||
    botText.includes("traveling solo") ||
    botText.includes("as a couple") ||
    botText.includes("with family") ||
    botText.includes("group of friends") ||
    botText.includes("joining you") ||
    botText.includes("who will join")
  ) return QUICK_REPLIES_BY_PHASE.travelers;

  // DURATION question
  if (
    botText.includes("how many days") ||
    botText.includes("how long") ||
    botText.includes("many days") ||
    botText.includes("number of days") ||
    botText.includes("how much time")
  ) return QUICK_REPLIES_BY_PHASE.duration;

  // DESTINATION question
  if (
    botText.includes("kind of") ||
    botText.includes("dreaming of") ||
    botText.includes("type of experience") ||
    botText.includes("type of travel") ||
    (botText.includes("destination") && botText.includes("?")) ||
    (botText.includes("mountains") && botText.includes("beaches") && botText.includes("?")) ||
    botText.includes("what kind")
  ) return QUICK_REPLIES_BY_PHASE.destination;

  // Fallback: infer from USER messages only (not bot text to avoid false positives)
  const userText = messages.filter(m => m.role === "user").map(m => m.content).join(" ").toLowerCase();
  const hasDest = /kerala|kenya|himachal|ladakh|andaman|goa|vietnam|tanzania|iceland|mountain|beach|wildlife|backwater/.test(userText);
  const hasDuration = /\d+\s*days?|week|weekend|\d+\s*month/.test(userText);
  const hasTravelers = /solo|couple|family|friends|adults?/.test(userText);
  const hasBudget = /standard|deluxe|luxury/.test(userText);
  const hasInterests = /wildlife|photography|trek|yoga|cuisine|culture|water sport|adventure|birdwatch/.test(userText);
  if (!hasDest) return QUICK_REPLIES_BY_PHASE.destination;
  if (!hasDuration) return QUICK_REPLIES_BY_PHASE.duration;
  if (!hasTravelers) return QUICK_REPLIES_BY_PHASE.travelers;
  if (!hasBudget) return QUICK_REPLIES_BY_PHASE.budget;
  if (!hasInterests) return QUICK_REPLIES_BY_PHASE.interests;
  return QUICK_REPLIES_BY_PHASE.dates;
}

export default function ChatWidget() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      inputRef.current?.focus();
    }
  }, [messages, isOpen, loading]);

  // Hide on admin routes
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const handleStartOver = () => {
    setMessages([
      {
        id: `init-${Date.now()}`,
        role: "assistant",
        content:
          "Let's start fresh! Tell me where you'd like to travel, or pick an idea below to get started.",
      },
    ]);
    setInput("");
  };

  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      // Prepare history for API
      const apiMessages = newMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to get AI response");
      }

      const botMsg = {
        id: `bot-${Date.now()}`,
        role: "assistant",
        content: data.reply,
        itinerary: data.itinerary || null,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          content:
            "I ran into a temporary connection issue. Please try again or feel free to reach our team at hello@travelunbounded.com!",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSendMessage();
  };

  return (
    <>
      {/* Floating Chat Trigger Button */}
      <div className="fixed bottom-6 right-6 z-50 select-none">
        <AnimatePresence>
          {!isOpen && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="relative"
            >
              {/* Pulsing Beacon Ring */}
              <span className="absolute -inset-1 rounded-full bg-brand/30 animate-ping pointer-events-none" />

              <button
                onClick={() => setIsOpen(true)}
                className="relative flex items-center gap-2.5 rounded-full bg-gradient-to-r from-brand via-teal-600 to-teal-500 px-4 py-3.5 text-white shadow-xl shadow-teal-900/30 hover:scale-105 active:scale-95 transition-all cursor-pointer group"
                aria-label="Open AI Travel Planner"
              >
                <div className="relative">
                  <MessageSquare size={20} className="transition-transform group-hover:rotate-6" />
                  <Sparkles size={11} className="absolute -top-1.5 -right-1.5 text-amber-300 animate-pulse" />
                </div>
                <span className="text-xs font-bold tracking-tight pr-1 hidden sm:inline">
                  Plan with AI
                </span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Expandable Chat Modal Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[94vw] sm:w-[430px] max-w-[430px] h-[590px] max-h-[85vh] rounded-3xl border border-teal-100 bg-white/95 backdrop-blur-2xl shadow-2xl shadow-teal-950/20 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="px-5 py-3.5 bg-gradient-to-r from-brand to-teal-700 text-white flex items-center justify-between border-b border-white/10 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative w-9 h-9 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-xs">
                  <Bot size={20} className="text-white" />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-brand" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-extrabold text-sm tracking-tight text-white">Aura Concierge</h3>
                    <span className="rounded-full bg-white/20 px-1.5 py-0.2 text-[9px] font-semibold text-amber-200 uppercase tracking-wider">
                      Groq AI
                    </span>
                  </div>
                  <p className="text-[10px] text-teal-100 font-light flex items-center gap-1">
                    <Compass size={10} />
                    Travel Unbounded
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleStartOver}
                  title="Start Over"
                  className="rounded-xl p-2 text-white/80 hover:bg-white/15 hover:text-white transition-all cursor-pointer text-xs font-semibold flex items-center gap-1"
                >
                  <RotateCcw size={14} />
                  <span className="text-[11px] hidden sm:inline">Reset</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  title="Close Chat"
                  className="rounded-xl p-2 text-white/80 hover:bg-white/15 hover:text-white transition-all cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Conversation Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs scroll-smooth bg-gradient-to-b from-stone-50/60 to-white">
              {messages.map((m) => {
                const isUser = m.role === "user";
                return (
                  <div
                    key={m.id}
                    className={`flex gap-2.5 ${isUser ? "justify-end" : "justify-start"}`}
                  >
                    {!isUser && (
                      <div className="w-7 h-7 rounded-xl bg-brand/10 text-brand flex items-center justify-center flex-shrink-0 mt-0.5 border border-brand/20">
                        <Bot size={15} />
                      </div>
                    )}

                    <div className={`max-w-[85%] ${isUser ? "text-right" : "text-left"}`}>
                      <div
                        className={`inline-block rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-xs ${
                          isUser
                            ? "bg-gradient-to-r from-brand to-teal-600 text-white rounded-tr-xs"
                            : "bg-white text-gray-800 border border-gray-100 rounded-tl-xs"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{m.content}</p>
                      </div>

                      {/* Embedded Day-wise Itinerary Card */}
                      {m.itinerary && <ItineraryView itinerary={m.itinerary} />}
                    </div>

                    {isUser && (
                      <div className="w-7 h-7 rounded-xl bg-teal-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
                        <User size={14} />
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Quick Starter Chips on Initial message */}
              {messages.length === 1 && (
                <div className="pt-2 space-y-2">
                  <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider pl-1">
                    Suggested Journeys:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {STARTER_PROMPTS.map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        onClick={() => handleSendMessage(prompt)}
                        className="rounded-xl border border-teal-200/80 bg-teal-50/60 px-2.5 py-1.5 text-[11px] font-semibold text-teal-900 hover:bg-teal-100 hover:border-teal-300 transition-all text-left shadow-2xs cursor-pointer active:scale-95"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Typing Indicator */}
              {loading && (
                <div className="flex items-center gap-2 text-gray-500 pl-1">
                  <div className="w-7 h-7 rounded-xl bg-brand/10 text-brand flex items-center justify-center flex-shrink-0 border border-brand/20">
                    <Bot size={15} />
                  </div>
                  <div className="rounded-2xl bg-white border border-gray-100 px-3.5 py-2 shadow-xs flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-brand animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-brand animate-bounce" />
                    <span className="text-[11px] text-gray-400 pl-1 font-medium">
                      Aura is crafting...
                    </span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Contextual Replies (when conversation has started) */}
            {messages.length > 1 && !loading && (
              <div className="px-3 pt-2 pb-1 border-t border-gray-100 bg-white/70 overflow-x-auto flex gap-1.5 flex-nowrap no-scrollbar">
                {getQuickReplies(messages).map((reply) => (
                  <button
                    key={reply}
                    type="button"
                    onClick={() => handleSendMessage(reply)}
                    className="whitespace-nowrap rounded-lg bg-gray-100 hover:bg-teal-50 hover:text-brand border border-gray-200/60 px-2.5 py-1 text-[10px] font-semibold text-gray-600 transition-all cursor-pointer flex-shrink-0"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            )}

            {/* Input Footer */}
            <form
              onSubmit={handleSubmit}
              className="p-3 border-t border-gray-100 bg-white flex items-center gap-2 flex-shrink-0"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Aura (e.g., 4 days in Kerala for couple)..."
                disabled={loading}
                className="flex-1 rounded-2xl border border-gray-200 bg-stone-50 px-4 py-2.5 text-xs text-gray-900 placeholder-gray-400 focus:bg-white focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="w-10 h-10 rounded-2xl bg-gradient-to-r from-brand to-teal-500 text-white flex items-center justify-center shadow-md shadow-teal-900/20 hover:brightness-110 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer flex-shrink-0"
                aria-label="Send Message"
              >
                <Send size={15} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
