/**
 * Copilot Chat Panel
 * ══════════════════
 *
 * In-app AI assistant UI shell. This is the frontend interface only —
 * there is NO backend LLM connection yet. The panel displays an honest
 * "not connected" state rather than faking intelligent responses.
 *
 * Backend Integration (Phase 2)
 * ────────────────────────────
 * When the LLM backend is ready:
 * 1. Replace the placeholder message handler with an API call
 * 2. Add streaming response support (SSE or WebSocket)
 * 3. The message component structure is already designed for streaming
 *
 * Role-Aware Framing
 * ──────────────────
 * The placeholder text and suggested prompts change based on the
 * user's role to set correct expectations for what the Copilot will
 * eventually help with.
 */
import { useRole } from "@/contexts/RoleContext";
import { canAccessPage } from "@/config/roles";
import {
  Bot,
  MessageSquare,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

/** Role-specific placeholder prompts */
const ROLE_PROMPTS: Record<string, string[]> = {
  aid_worker: [
    "What's the conflict forecast for Bama next month?",
    "Which supply routes are currently highest risk?",
    "Summarize today's operational KPIs",
  ],
  ngo: [
    "Generate a summary report for this week",
    "How many team members are active?",
    "What are the current IDP population trends?",
  ],
  student: [
    "How does the LSTM model make predictions?",
    "What features does the MILP optimizer use?",
    "Explain the training data pipeline",
  ],
  individual: [
    "What's happening in Borno State?",
    "How many people are displaced?",
    "Which regions need the most attention?",
  ],
};

interface CopilotProps {
  /** Whether the user's role allows Copilot access */
  visible: boolean;
}

export default function Copilot({ visible }: CopilotProps) {
  const { role } = useRole();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!visible || !role) return null;

  const prompts = ROLE_PROMPTS[role] || ROLE_PROMPTS.individual;

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    // Placeholder response — clearly honest about not being connected
    setTimeout(() => {
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "Copilot is not yet connected to live data. This is a preview of the assistant interface. When connected, I'll be able to answer questions about forecasts, supply routes, and operational data.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    }, 800);
  };

  const handlePromptClick = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full flex items-center justify-center shadow-glow-blue transition-all duration-300 ${
          isOpen
            ? "bg-dark-card border border-white/[0.1] rotate-0"
            : "bg-un-blue hover:bg-un-blue/80 hover:scale-105"
        }`}
        title="Open AI Copilot"
      >
        {isOpen ? (
          <X size={22} className="text-dark-text" />
        ) : (
          <Bot size={22} className="text-white" />
        )}
      </button>

      {/* Notification dot when closed and no messages */}
      {!isOpen && messages.length === 0 && (
        <div className="fixed bottom-6 right-6 z-40 w-14 h-14 pointer-events-none">
          <div className="absolute top-0 right-0 w-3.5 h-3.5 bg-un-amber rounded-full border-2 border-dark-bg animate-pulse" />
        </div>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-40 w-[380px] max-w-[calc(100vw-3rem)] bg-dark-card border border-white/[0.08] rounded-card-lg shadow-glass-lg overflow-hidden animate__animated animate__fadeInUp">
          {/* Header */}
          <div className="px-4 py-3 border-b border-white/[0.06] bg-gradient-to-r from-un-navy/50 to-dark-card">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-btn bg-un-blue/15 flex items-center justify-center">
                <Sparkles size={16} className="text-un-blue" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-dark-text">Copilot</h3>
                <p className="text-[0.6rem] text-surface-500">
                  Not connected — preview interface
                </p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="h-[320px] overflow-y-auto scrollbar-thin px-4 py-3 space-y-3">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-12 h-12 rounded-full bg-un-blue/10 flex items-center justify-center mb-3">
                  <Bot size={24} className="text-un-blue" />
                </div>
                <p className="text-sm font-semibold text-dark-text mb-1">
                  AI Copilot
                </p>
                <p className="text-xs text-surface-500 max-w-[240px] mb-4">
                  This assistant is not yet connected to live data. You can
                  explore the interface, but responses are placeholder text.
                </p>

                {/* Suggested prompts */}
                <div className="space-y-1.5 w-full">
                  {prompts.map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => handlePromptClick(prompt)}
                      className="w-full text-left text-[0.75rem] px-3 py-2 rounded-btn bg-dark-bg/60 text-surface-400 hover:bg-white/[0.05] hover:text-dark-text transition-colors border border-white/[0.04]"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {/* Not-connected banner */}
                <div className="bg-un-amber/10 border border-un-amber/20 rounded-btn px-3 py-2 mb-2">
                  <p className="text-[0.7rem] text-un-amber font-medium">
                    Preview mode — responses are placeholders, not live data.
                  </p>
                </div>

                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] px-3 py-2 rounded-card text-[0.8rem] leading-relaxed ${
                        msg.role === "user"
                          ? "bg-un-blue/15 text-dark-text border border-un-blue/20"
                          : "bg-dark-bg/60 text-surface-300 border border-white/[0.04]"
                      }`}
                    >
                      {msg.role === "assistant" && (
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <Bot size={12} className="text-un-blue" />
                          <span className="text-[0.6rem] font-semibold text-un-blue uppercase tracking-wider">
                            Copilot
                          </span>
                        </div>
                      )}
                      {msg.content}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input */}
          <div className="px-3 py-3 border-t border-white/[0.06]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-dark-bg/60 border border-white/[0.06] rounded-btn px-3 py-2 text-[0.8rem] text-dark-text placeholder:text-surface-500/50 focus:outline-none focus:border-un-blue/40 transition-colors"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="w-9 h-9 rounded-btn bg-un-blue/20 flex items-center justify-center text-un-blue hover:bg-un-blue/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
