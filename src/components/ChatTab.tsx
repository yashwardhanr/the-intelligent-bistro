import React, { useState, useRef, useEffect } from "react";
import { AIChatMessage, AIAction, UserProfile } from "../types";
import { Send, Mic, Sparkles, CheckSquare, X, ArrowUpRight, Clock, HelpCircle } from "lucide-react";
import { MENU } from "../data/menu";

interface ChatTabProps {
  profile: UserProfile;
  messages: AIChatMessage[];
  onSendMessage: (text: string) => void;
  isProcessing: boolean;
  onApplyAIChanges: (actions: AIAction[]) => void;
}

export default function ChatTab({
  profile,
  messages,
  onSendMessage,
  isProcessing,
  onApplyAIChanges
}: ChatTabProps) {
  const [inputText, setInputText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordedSentenceIdx, setRecordedSentenceIdx] = useState(0);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Micro-list of simulated voice prompts for a voice demo experience
  const SIMULATED_MIC_PROMPTS = [
    "Add two spicy chicken sandwiches and a cold water",
    "Please clear my cart so we can restart",
    "Actually, make everything on my tray vegetarian",
    "Add a sweet chocolate lava cake",
    "Can we replace fries with garden salad for wellness?"
  ];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isProcessing]);

  const handleSend = () => {
    if (inputText.trim() !== "" && !isProcessing) {
      onSendMessage(inputText);
      setInputText("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  // Simulate Mic voice recordings safely
  const triggerMicRecording = () => {
    if (isProcessing) return;
    setIsRecording(true);
    
    // Animate waveforms, pick a creative prompt sentence and push as if recorded by throat
    setTimeout(() => {
      setIsRecording(false);
      const sentence = SIMULATED_MIC_PROMPTS[recordedSentenceIdx % SIMULATED_MIC_PROMPTS.length];
      setInputText(sentence);
      setRecordedSentenceIdx(prev => prev + 1);
    }, 2500); // 2.5s recording delay
  };

  const renderActionDiffSummary = (actions: AIAction[]) => {
    if (!actions || actions.length === 0) return null;

    return (
      <div className="flex flex-col gap-1.5 p-2.5 bg-indigo-50/40 border border-indigo-100 rounded-xl text-[10px] my-2 select-none">
        <span className="font-bold text-indigo-800 uppercase tracking-wider block border-b border-indigo-100/60 pb-1">
          Proposed Tray Revision
        </span>
        <div className="flex flex-col gap-1">
          {actions.map((act, idx) => {
            const mItem = MENU.find(m => m.id === act.itemId);
            const name = mItem ? mItem.name : act.itemId;
            let displayString = "";

            if (act.type === "ADD_ITEM") {
              const modifierString = act.modifiers 
                ? ` (${Object.values(act.modifiers).join(", ")})` 
                : "";
              displayString = `➕ Add ${act.quantity || 1}x ${name}${modifierString}`;
            } else if (act.type === "REMOVE_ITEM") {
              displayString = `➖ Decrease ${act.quantity || 1}x ${name}`;
            } else if (act.type === "MODIFY_ITEM") {
              displayString = `🔄 Modify ${name} quantity to ${act.quantity}`;
            } else if (act.type === "CLEAR_CART") {
              displayString = `🚨 Clear all items from active tray`;
            }

            return (
              <span key={idx} className="font-mono text-indigo-900 font-semibold block">
                {displayString}
              </span>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div id="chat-tab-container" className="flex flex-col h-full bg-white font-sans">
      
      {/* Messages Scrolling Container */}
      <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3 max-h-[300px] min-h-[220px] scrollbar-thin scrollbar-thumb-slate-200">
        
        {/* Welcome Intro Waiter */}
        <div className="flex gap-2.5 bg-gradient-to-r from-indigo-50/50 to-sky-50/50 border border-indigo-100/65 p-3.5 rounded-2xl shadow-sm animate-fade-in">
          <div className="w-8 h-8 rounded-full bg-indigo-600/10 flex items-center justify-center flex-shrink-0 border border-indigo-600/10">
            <Sparkles className="w-4 h-4 text-indigo-650 animate-pulse" />
          </div>
          <div className="flex flex-col gap-1 text-[11px]">
            <span className="font-bold text-slate-800">Your Intelligent Maitre d'</span>
            <p className="text-slate-600 font-medium leading-relaxed">
              Chef {profile.preferredName}! Tell me whatever you're craving. I am here to help you configure custom combinations, avoid allergies, and optimize your tray budget.
            </p>
            <div className="text-[10px] text-indigo-700 font-mono flex items-center gap-1 mt-1 font-bold">
              <Clock className="w-3.5 h-3.5" /> Chef is active • Volcanic aquifers on tap
            </div>
          </div>
        </div>

        {/* Message Logs */}
        {messages.map((msg) => {
          const isUser = msg.sender === "user";
          return (
            <div 
              key={msg.id} 
              id={`chat-msg-${msg.id}`}
              className={`flex flex-col max-w-[85%] ${
                isUser ? "self-end items-end" : "self-start items-start"
              } gap-0.5`}
            >
              <div 
                className={`py-2 px-3 rounded-2xl text-[11px] font-sans leading-relaxed tracking-tight ${
                  isUser 
                    ? "bg-indigo-600 text-white rounded-tr-none font-medium shadow-sm" 
                    : "bg-slate-50 text-slate-800 border border-slate-200 rounded-tl-none"
                }`}
              >
                {msg.text}

                {/* Diff Review Panel */}
                {!isUser && msg.proposedActions && msg.proposedActions.length > 0 && (
                  <>
                    {renderActionDiffSummary(msg.proposedActions)}
                    
                    {/* Approve apply CTA button container */}
                    <div className="flex gap-1.5 mt-2">
                       <button
                        id={`approve-diff-btn-${msg.id}`}
                        onClick={() => onApplyAIChanges(msg.proposedActions!)}
                        className="py-1 px-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[9px] font-bold shadow-sm cursor-pointer flex items-center gap-1 active:scale-95 transition-all text-center leading-none"
                      >
                        <CheckSquare className="w-3 h-3 text-white" /> Approve & Apply
                      </button>
                    </div>
                  </>
                )}
              </div>
              <span className="text-[8px] text-slate-400 font-mono px-1">
                {msg.timestamp}
              </span>
            </div>
          );
        })}

        {/* Typing indicator simulator */}
        {isProcessing && (
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-250/50 px-3 py-2 rounded-xl self-start">
            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Mic sound animation overlay */}
      {isRecording && (
        <div id="mic-recording-overlay" className="py-2.5 px-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-between mx-2 mb-2 animate-pulse">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-[10px] font-mono font-bold text-red-600">Simulating Voice Hook...</span>
          </div>
          {/* Waveforms */}
          <div className="flex items-center gap-0.5 h-3">
            {[1, 3, 2, 4, 1, 3, 2, 4].map((h, i) => (
              <span 
                key={i} 
                className="w-0.5 bg-red-400 rounded-full animate-pulse" 
                style={{ height: `${h * 20}%`, animationDelay: `${i * 100}ms` }} 
              />
            ))}
          </div>
        </div>
      )}

      {/* Input Tray Footer */}
      <div className="p-2 bg-white border-t border-slate-100 flex items-center gap-1.5 rounded-b-3xl">
        <button
          id="mic-recording-btn"
          disabled={isProcessing || isRecording}
          onClick={triggerMicRecording}
          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors border cursor-pointer ${
            isRecording 
              ? "bg-red-500 border-red-400 text-white" 
              : "bg-slate-50 hover:bg-slate-100 text-slate-500 border-slate-200"
          }`}
        >
          <Mic className={`w-4 h-4 ${isRecording ? "animate-wiggle text-white" : "text-slate-600"}`} />
        </button>

        <input
          id="chat-message-input"
          type="text"
          placeholder="Type orders or tap Mic..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyPress}
          disabled={isProcessing}
          className="flex-1 bg-slate-150 border-none rounded-lg px-2.5 py-1.5 text-xs text-slate-800 placeholder-slate-450 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
        />

        <button
          id="send-message-btn"
          onClick={handleSend}
          disabled={inputText.trim() === "" || isProcessing}
          className="w-7 h-7 bg-indigo-600 text-white hover:bg-indigo-550 disabled:bg-slate-50 disabled:text-slate-305 rounded-lg flex items-center justify-center shadow-sm disabled:shadow-none transition-colors cursor-pointer"
        >
          <Send className="w-3.5 h-3.5 fill-current" />
        </button>
      </div>
    </div>
  );
}
