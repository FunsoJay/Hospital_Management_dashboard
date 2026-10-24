import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  X,
  Send,
  Download,
  Pin,
  Bot,
  User,
  Database,
  ArrowRight,
  Maximize2,
  Minimize2,
  RefreshCw,
} from 'lucide-react';
import { EnrichedRecord } from '../../data/hospitalData';
import { MetricSummary } from '../../data/analyticsEngine';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  source?: string;
  tablesUsed?: string[];
  supportingData?: any;
  pinned?: boolean;
}

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: MetricSummary;
  records: EnrichedRecord[];
  onPinInsight?: (text: string) => void;
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  isOpen,
  onClose,
  summary,
  records,
  onPinInsight,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      role: 'assistant',
      content: `Hello! I am your **AegisHealth Intelligence Assistant** powered by Gemini 3.8 Flash and real-time hospital analytics.

I have full operational knowledge across our **3 Branches** (Central Hospital, Westside Clinic, Eastside Clinic), **10 Physicians**, **50 Patients**, and **200 Clinical Procedures & Billing Cycles** in 2023.

Ask me anything about revenue, cancellation causes, physician caseloads, or forecasting. Or try one of the starter questions below:`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      tablesUsed: ['appointments', 'billing', 'doctors', 'patients', 'treatments'],
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const starterQuestions = [
    'Why are appointments being cancelled?',
    'Which payment method has the highest failure rate?',
    'Which doctors bring in the most revenue?',
    'Forecast revenue for the next 6 months',
    'How much is outstanding and how old is it?',
    'Compare this quarter with last quarter',
  ];

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          conversationHistory: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          contextData: {
            totalBilled: summary.totalBilled,
            totalCollected: summary.totalCollected,
            collectionRate: summary.collectionRate,
            cancellationRate: summary.cancellationRate,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.reply || 'No response generated.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: data.source || 'gemini-3.8-flash',
        tablesUsed: data.tablesUsed || ['billing', 'appointments'],
        supportingData: data.supportingData,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error('Chat error:', err);
      // Friendly in-chat fallback message
      const errorMsg: ChatMessage = {
        id: `assistant-err-${Date.now()}`,
        role: 'assistant',
        content: `I encountered a network issue communicating with the backend. However, using our embedded analytical ledger:
- **Total Billed:** $${summary.totalBilled.toLocaleString()}
- **Collected:** $${summary.totalCollected.toLocaleString()} (${summary.collectionRate.toFixed(1)}%)
- **Cancellations:** ${summary.cancellationRate.toFixed(1)}% across ${summary.totalAppointments} visits.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        tablesUsed: ['billing', 'appointments'],
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleExportChat = () => {
    const textData = messages
      .map((m) => `[${m.timestamp}] ${m.role.toUpperCase()}:\n${m.content}\n\n`)
      .join('---\n');
    const blob = new Blob([textData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AegisHealth_Analytics_Conversation_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePin = (msg: ChatMessage) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === msg.id ? { ...m, pinned: !m.pinned } : m))
    );
    if (onPinInsight) {
      onPinInsight(msg.content);
    }
  };

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 bg-[#161918] border border-[#262B29] rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 animate-in slide-in-from-bottom-5 ${
        isExpanded
          ? 'w-[95vw] md:w-[780px] h-[85vh]'
          : 'w-[92vw] sm:w-[440px] h-[580px] max-h-[85vh]'
      }`}
    >
      {/* Header */}
      <div className="p-3.5 bg-[#1C201F] border-b border-[#262B29] flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#2ECC71] to-[#7ED321] flex items-center justify-center text-black font-extrabold shadow-md shadow-[#2ECC71]/20">
            <Sparkles className="w-4 h-4 fill-black stroke-black" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white tracking-tight">
                AI Analytics Assistant
              </span>
              <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-[#2ECC71]/20 text-[#2ECC71] font-bold">
                Online
              </span>
            </div>
            <span className="text-[10px] text-[#8C9391]">
              Grounding: 200 visits · 200 bills · 10 doctors
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleExportChat}
            className="p-1.5 rounded-lg text-[#8C9391] hover:text-white hover:bg-[#262B29]"
            title="Export conversation history"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg text-[#8C9391] hover:text-white hover:bg-[#262B29]"
            title={isExpanded ? 'Collapse view' : 'Expand full screen'}
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8C9391] hover:text-white hover:bg-[#262B29]"
            title="Close Assistant"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages stream */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} gap-1`}
            >
              <div className="flex items-center gap-1.5 text-[10px] text-[#8C9391] px-1">
                {isUser ? (
                  <span>You · {msg.timestamp}</span>
                ) : (
                  <span className="flex items-center gap-1 text-[#2ECC71]">
                    <Sparkles className="w-3 h-3" />
                    AegisHealth Intelligence · {msg.timestamp}
                  </span>
                )}
              </div>

              <div
                className={`p-3.5 rounded-2xl max-w-[92%] leading-relaxed whitespace-pre-wrap break-words ${
                  isUser
                    ? 'active-pill-gradient text-black font-medium shadow-sm'
                    : 'bg-[#1C201F] border border-[#262B29] text-[#E5E9E7]'
                }`}
              >
                {msg.content}

                {/* Supporting Card if returned */}
                {!isUser && msg.supportingData && (
                  <div className="mt-3 p-2.5 rounded-xl bg-[#0B0D0C] border border-[#262B29] text-[11px] grid grid-cols-2 gap-2">
                    {Object.entries(msg.supportingData).map(([key, val]: any) => (
                      <div key={key} className="flex flex-col">
                        <span className="text-[10px] text-[#8C9391] uppercase">{key}</span>
                        <span className="font-semibold text-white">{String(val)}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tables & joins cited */}
                {!isUser && msg.tablesUsed && msg.tablesUsed.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-[#262B29] flex items-center justify-between text-[10px] text-[#8C9391]">
                    <span className="flex items-center gap-1">
                      <Database className="w-3 h-3 text-[#2ECC71]" />
                      Tables: {msg.tablesUsed.join(' ⋈ ')}
                    </span>
                    <button
                      onClick={() => handlePin(msg)}
                      className={`flex items-center gap-1 hover:text-white transition-colors ${
                        msg.pinned ? 'text-[#2ECC71]' : ''
                      }`}
                      title={msg.pinned ? 'Pinned to dashboard' : 'Pin to dashboard'}
                    >
                      <Pin className="w-3 h-3" />
                      <span>{msg.pinned ? 'Pinned' : 'Pin'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-[#1C201F] border border-[#262B29] text-xs text-[#8C9391] w-fit">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#2ECC71]" />
            <span>Analyzing hospital relational database...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Starter Questions (visible if few messages or input empty) */}
      {messages.length <= 4 && (
        <div className="px-3 py-2 bg-[#0B0D0C] border-t border-[#262B29] flex items-center gap-2 overflow-x-auto shrink-0">
          <span className="text-[10px] uppercase font-bold text-[#8C9391] shrink-0">
            Suggested:
          </span>
          {starterQuestions.map((sq, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(sq)}
              className="px-2.5 py-1 rounded-lg bg-[#1C201F] hover:bg-[#262B29] border border-[#262B29] text-[11px] text-[#C7CECB] hover:text-white whitespace-nowrap transition-colors shrink-0"
            >
              {sq}
            </button>
          ))}
        </div>
      )}

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3 bg-[#1C201F] border-t border-[#262B29] flex items-center gap-2 shrink-0"
      >
        <input
          type="text"
          placeholder="Ask a question about doctors, revenue, cancellations, or forecast..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          className="flex-1 bg-[#0B0D0C] border border-[#262B29] rounded-xl px-3.5 py-2 text-xs text-white placeholder-[#8C9391] focus:outline-none focus:border-[#2ECC71]/60 transition-colors"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="p-2 rounded-xl active-pill-gradient text-black font-bold disabled:opacity-40 transition-all shrink-0 hover:scale-105"
          title="Send query"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
