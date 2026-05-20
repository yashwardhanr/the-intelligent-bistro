import React, { useState, useEffect } from "react";
import { UserProfile, CartItem, MenuItem, SelectedModifiers, AIChatMessage, AIAction } from "./types";
import ProfilePanel from "./components/ProfilePanel";
import TraceBoard from "./components/TraceBoard";
import PhoneSimulator from "./components/PhoneSimulator";
import { MENU } from "./data/menu";
import { Sparkles, ChefHat, Activity, Compass, MessageSquare, Coffee, LogOut, Award, Layers } from "lucide-react";

export default function App() {
  // Navigation tabs
  const [currentTab, setCurrentTab] = useState<"menu" | "chat" | "tray">("menu");

  // User gastronomical profile state
  const [profile, setProfile] = useState<UserProfile>({
    diet: "none",
    spiceTolerance: "medium",
    budget: 65,
    allergies: [],
    loyaltyPoints: 3450,
    preferredName: "Yashwardhan",
    healthFocus: false
  });

  // Dynamic shopping cart
  const [cart, setCart] = useState<CartItem[]>([]);

  // Telemetry AI Conversation message history logs
  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: "intro-msg-01",
      sender: "assistant",
      text: "Greetings! I am BistroMind, your Michelin hospitality AI assistant. Tell me whatever you are craving or select an evaluation capsule on the left control hub to check out my intelligent responses!",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }
  ]);

  const [isProcessing, setIsProcessing] = useState(false);

  // Auto-recommend a special dish if user filters/profile updates to veggie
  useEffect(() => {
    if (profile.diet === "veg") {
      setMessages(prev => [
        ...prev,
        {
          id: `diet-alert-${Date.now()}`,
          sender: "assistant",
          text: `Chef Yashwardhan, since you upgraded to strict Vegetarian, I heavily recommend trying our Clay-Oven clay roasted Paneer Tikka or our fresh quinoa avocado bowls. Just say "Add two Paneer Tikka" and I will prepare it for you!`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    }
  }, [profile.diet]);

  // Handle adding custom items to the tray
  const handleAddItem = (item: MenuItem, modifiers: SelectedModifiers, quantity: number) => {
    setCart(prev => {
      // Create a unique key reflecting selected choices
      const key = `${item.id}-${JSON.stringify(modifiers)}`;
      const matchIndex = prev.findIndex(c => c.key === key);
      
      if (matchIndex > -1) {
        const copy = [...prev];
        copy[matchIndex].quantity += quantity;
        return copy;
      } else {
        return [...prev, { key, menuItem: item, quantity, selectedModifiers: modifiers }];
      }
    });

    // Auto-credit points for interaction
    setProfile(p => ({ ...p, loyaltyPoints: p.loyaltyPoints + 15 }));
  };

  // Adjust portion quantities from My Tray (Cart) tab
  const handleUpdateQty = (key: string, delta: number) => {
    setCart(prev => {
      const matchIndex = prev.findIndex(c => c.key === key);
      if (matchIndex > -1) {
        const item = prev[matchIndex];
        const nextQty = item.quantity + delta;
        if (nextQty <= 0) {
          return prev.filter(c => c.key !== key);
        } else {
          const copy = [...prev];
          copy[matchIndex].quantity = nextQty;
          return copy;
        }
      }
      return prev;
    });
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // REST REST API caller to BistroMind Node process
  const handleSendMessage = async (text: string) => {
    // Add user message immediately
    const userMsg: AIChatMessage = {
      id: `user-msg-${Date.now()}`,
      sender: "user",
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages(prev => [...prev, userMsg]);
    setIsProcessing(true);
    setCurrentTab("chat"); // pivot layout screen directly to active text-stream

    try {
      const response = await fetch("/api/ai/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          cart: cart,
          profile: profile
        })
      });

      if (!response.ok) {
        throw new Error("HTTP status check returned an error status.");
      }

      const data = await response.json();

      // Add assistant response
      const assistantMsg: AIChatMessage = {
        id: `assistant-msg-${Date.now()}`,
        sender: "assistant",
        text: data.message,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        proposedActions: data.proposedActions || [],
        logs: {
          model: data.modelUsed || "Gemini 3.5 Flash",
          rawResponse: JSON.stringify(data.proposedActions),
          latencyMs: data.latencyMs || 180,
          explanation: data.explanation || "No telemetry details provided."
        }
      };

      setMessages(prev => [...prev, assistantMsg]);

    } catch (err: any) {
      console.error("Express routing endpoint hit a snag:", err);
      // Construct fallback offline message locally
      const errorMsg: AIChatMessage = {
        id: `error-msg-${Date.now()}`,
        sender: "assistant",
        text: "My apologies. I encountered a momentary connection interruption to our main server. Let me process this in offline backup mode...",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsProcessing(false);
    }
  };

  // Approve and Apply proposed changes from Gemini parser actions data payload
  const handleApplyAIChanges = (actions: AIAction[]) => {
    actions.forEach(act => {
      if (act.type === "ADD_ITEM") {
        const item = MENU.find(m => m.id === act.itemId);
        if (item) {
          handleAddItem(item, act.modifiers || {}, act.quantity || 1);
        }
      } else if (act.type === "REMOVE_ITEM") {
        setCart(prev => {
          const matchIndex = prev.findIndex(c => c.menuItem.id === act.itemId);
          if (matchIndex > -1) {
            const item = prev[matchIndex];
            const nextQty = item.quantity - (act.quantity || 1);
            if (nextQty <= 0) {
              return prev.filter(c => c.key !== item.key);
            } else {
              const copy = [...prev];
              copy[matchIndex].quantity = nextQty;
              return copy;
            }
          }
          return prev;
        });
      } else if (act.type === "MODIFY_ITEM") {
        setCart(prev => {
          const matchIndex = prev.findIndex(c => c.menuItem.id === act.itemId);
          if (matchIndex > -1) {
            const copy = [...prev];
            copy[matchIndex].quantity = act.quantity || 1;
            return copy;
          }
          return prev;
        });
      } else if (act.type === "CLEAR_CART") {
        setCart([]);
      }
    });

    // Dismiss this diff from original proposed block to clear interface
    setMessages(prev => prev.map(msg => {
      if (msg.proposedActions === actions) {
        return { ...msg, proposedActions: [] };
      }
      return msg;
    }));

    // Auto navigate to Trax basket after applying
    setCurrentTab("tray");
  };

  return (
    <div id="app-root-wrapper" className="min-h-screen bg-slate-50 flex flex-col relative overflow-x-hidden font-sans select-none">
      
      {/* Sleek shadow header background decoration */}
      <div className="absolute top-0 left-0 right-0 h-[220px] bg-gradient-to-b from-indigo-50/40 to-transparent opacity-80 z-0 pointer-events-none" />

      {/* Main Container - spacious responsive margin structures */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-6 z-10 flex flex-col gap-6">
        
        {/* Superior Branding Header Section - Sleek Interface style */}
        <header className="flex justify-between items-center border-b border-slate-200 pb-4 select-none bg-white p-4 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-[0_4px_14px_rgba(79,70,229,0.25)]">
              <ChefHat className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-extrabold text-slate-900 text-lg tracking-tight leading-none uppercase">Bistromind<span className="text-indigo-600 italic">AI</span></span>
                <span className="text-[9px] px-1.5 py-0.2 bg-indigo-50 text-indigo-600 rounded border border-indigo-150 font-mono font-bold leading-none uppercase tracking-widest animate-pulse">MICHELIN GPT</span>
              </div>
              <p className="text-xs text-slate-500 font-sans tracking-tight mt-1 leading-none">
                Gourmet Ordering Engine & Telemetry Traceboard Integration
              </p>
            </div>
          </div>

          {/* Quick System Diagnostics */}
          <div className="hidden sm:flex items-center gap-6 text-[10px] font-mono text-slate-500">
            <div className="flex flex-col items-end">
              <span className="text-slate-400">TABLE ANCHOR</span>
              <span className="text-indigo-600 font-bold">TABLE #4 • VIP LOUNGE</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-slate-400">AI HOST STATUS</span>
              <span className="text-emerald-600 font-bold flex items-center gap-1">
                <Activity className="w-3 h-3 animate-pulse" /> ENGINE ONLINE
              </span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-slate-400">SYSTEM VISITOR</span>
              <span className="text-slate-800 font-bold uppercase">{profile.preferredName}</span>
            </div>
          </div>
        </header>

        {/* Dynamic Responsive Columns Grid (Diet Profile | Mobile App | Server Console logs) */}
        <main className="flex-1 grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch pb-8">
          
          {/* Column 1: Diet Profile personalization Controls (Takes 3 of 12 grid span on wide devices) */}
          <section className="xl:col-span-4 flex flex-col h-full min-h-[480px]">
            <ProfilePanel 
              profile={profile} 
              setProfile={setProfile} 
              onSendPresetMessage={handleSendMessage}
              isProcessing={isProcessing}
            />
          </section>

          {/* Column 2: Simulated physical phone Interface (Takes 4 of 12 grid span on wide devices) */}
          <section className="xl:col-span-4 flex flex-col justify-center items-center h-full min-h-[550px]">
            <PhoneSimulator
              currentTab={currentTab}
              setCurrentTab={setCurrentTab}
              profile={profile}
              setProfile={setProfile}
              cart={cart}
              messages={messages}
              onSendMessage={handleSendMessage}
              isProcessing={isProcessing}
              onApplyAIChanges={handleApplyAIChanges}
              onAddItem={handleAddItem}
              onUpdateQty={handleUpdateQty}
              onClearCart={handleClearCart}
            />
          </section>

          {/* Column 3: Full-Stack Rest logging TraceBoard (Takes 4 of 12 grid span on wide devices) */}
          <section className="xl:col-span-4 flex flex-col h-full min-h-[480px]">
            <TraceBoard messages={messages} />
          </section>

        </main>
      </div>
    </div>
  );
}
