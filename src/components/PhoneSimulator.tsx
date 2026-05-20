import React from "react";
import { UserProfile, CartItem, MenuItem, SelectedModifiers, AIChatMessage, AIAction } from "../types";
import MenuTab from "./MenuTab";
import ChatTab from "./ChatTab";
import TrayTab from "./TrayTab";
import { Compass, MessageSquare, ShoppingBag, Wifi, Battery, Signal } from "lucide-react";

interface PhoneSimulatorProps {
  currentTab: "menu" | "chat" | "tray";
  setCurrentTab: (tab: "menu" | "chat" | "tray") => void;
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  cart: CartItem[];
  messages: AIChatMessage[];
  onSendMessage: (text: string) => void;
  isProcessing: boolean;
  onApplyAIChanges: (actions: AIAction[]) => void;
  onAddItem: (item: MenuItem, modifiers: SelectedModifiers, quantity: number) => void;
  onUpdateQty: (key: string, delta: number) => void;
  onClearCart: () => void;
}

export default function PhoneSimulator({
  currentTab,
  setCurrentTab,
  profile,
  setProfile,
  cart,
  messages,
  onSendMessage,
  isProcessing,
  onApplyAIChanges,
  onAddItem,
  onUpdateQty,
  onClearCart
}: PhoneSimulatorProps) {
  
  // Total item count in cart for navigation badge
  const totalCartItems = cart.reduce((acc, curr) => acc + curr.quantity, 0);

  // Get current local formatted hours:minutes
  const getFormattedTime = () => {
    const d = new Date();
    let hours = d.getHours();
    const minutes = d.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${ampm}`;
  };

  return (
    <div id="phone-container" className="flex justify-center items-center h-full select-none">
      {/* Outer physical metallic iPhone simulator frame - Sleek Obsidian Slate style */}
      <div className="w-[360px] h-[670px] bg-slate-900 rounded-[48px] p-3.5 shadow-[0_25px_50px_-12px_rgba(79,70,229,0.15)] border-[6px] border-slate-800 flex flex-col relative overflow-hidden ring-1 ring-white/5">
        
        {/* Dynamic Notch / Island camera design */}
        <div className="absolute top-5 left-1/2 transform -translate-x-1/2 w-28 h-6 bg-black rounded-full z-50 flex items-center justify-between px-3">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-900/40" />
          <div className="w-2.5 h-2.5 rounded-full bg-indigo-500/20 animate-pulse flex items-center justify-center">
            <span className="w-1 h-1 rounded-full bg-indigo-500" />
          </div>
        </div>

        {/* Side physical buttons */}
        <div className="absolute left-[-6px] top-28 w-[6px] h-10 bg-slate-800 rounded-r-md" />
        <div className="absolute left-[-6px] top-44 w-[6px] h-14 bg-slate-800 rounded-r-md" />
        <div className="absolute left-[-6px] top-60 w-[6px] h-14 bg-slate-800 rounded-r-md" />
        <div className="absolute right-[-6px] top-36 w-[6px] h-16 bg-slate-800 rounded-l-md" />

        {/* Inner Phone screen canvas */}
        <div className="flex-1 bg-white rounded-[38px] overflow-hidden flex flex-col relative border border-slate-205/20">
          
          {/* iOS Top Status bar */}
          <div className="h-10 bg-white px-6 pt-2 flex justify-between items-center z-40 select-none">
            <span className="text-[10px] font-mono font-bold text-slate-800 tracking-tight leading-none">
              {getFormattedTime()}
            </span>
            <div className="flex items-center gap-1.5 text-slate-800">
              <Signal className="w-3 h-3 stroke-[2.5]" />
              <Wifi className="w-3 h-3 stroke-[2.5]" />
              <div className="flex items-center gap-0.5">
                <span className="text-[8.5px] font-mono font-bold">96%</span>
                <Battery className="w-4.5 h-3 px-0.2 transform rotate-0 stroke-[2]" />
              </div>
            </div>
          </div>

          {/* Active Screen Tab View Panel */}
          <div className="flex-1 p-4 pb-2 flex flex-col justify-between overflow-hidden relative">
            {currentTab === "menu" && (
              <MenuTab profile={profile} onAddItem={onAddItem} />
            )}
            {currentTab === "chat" && (
              <ChatTab 
                profile={profile} 
                messages={messages} 
                onSendMessage={onSendMessage} 
                isProcessing={isProcessing} 
                onApplyAIChanges={onApplyAIChanges}
              />
            )}
            {currentTab === "tray" && (
              <TrayTab 
                profile={profile} 
                cart={cart} 
                onUpdateQty={onUpdateQty} 
                onClearCart={onClearCart}
                setProfile={setProfile}
              />
            )}
          </div>

          {/* iOS Bottom Navigation bar */}
          <div className="h-16 bg-white/95 border-t border-slate-100 px-6 pb-2.5 flex justify-between items-center z-40">
            {/* Menu tab */}
            <button
              id="nav-tab-menu"
              onClick={() => setCurrentTab("menu")}
              className={`flex flex-col items-center gap-1 transition-all cursor-pointer ${
                currentTab === "menu" ? "text-indigo-600 scale-105" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <Compass className={`w-5 h-5 ${currentTab === "menu" ? "stroke-[2.5]" : "stroke-[2]"}`} />
              <span className="text-[9.5px] font-sans font-semibold leading-none">Cuisine</span>
            </button>

            {/* AI Assistant Chat tab */}
            <button
              id="nav-tab-chat"
              onClick={() => setCurrentTab("chat")}
              className={`flex flex-col items-center gap-1 relative transition-all cursor-pointer ${
                currentTab === "chat" ? "text-indigo-600 scale-105" : "text-slate-400 hover:text-indigo-850"
              }`}
            >
              <MessageSquare className={`w-5 h-5 ${currentTab === "chat" ? "stroke-[2.5]" : "stroke-[2]"}`} />
              <span className="text-[9.5px] font-sans font-semibold leading-none">AI Maitre D</span>
              {isProcessing && (
                <span className="absolute top-0 right-1.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
              )}
            </button>

            {/* Tray Basket tab */}
            <button
              id="nav-tab-tray"
              onClick={() => setCurrentTab("tray")}
              className={`flex flex-col items-center gap-1 relative transition-all cursor-pointer ${
                currentTab === "tray" ? "text-indigo-600 scale-105" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <ShoppingBag className={`w-5 h-5 ${currentTab === "tray" ? "stroke-[2.5]" : "stroke-[2]"}`} />
              <span className="text-[9.5px] font-sans font-semibold leading-none">My Tray</span>
              
              {/* Badges */}
              {totalCartItems > 0 && (
                <span className="absolute -top-1 -right-2 bg-indigo-600 text-white font-mono font-bold text-[8.5px] w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white leading-none scale-90 animate-bounce">
                  {totalCartItems}
                </span>
              )}
            </button>
          </div>

          {/* Elegant Screen Bottom pill footer bar simulator */}
          <div className="h-1 bg-slate-950 w-1/3 mx-auto rounded-full mb-1 flex-shrink-0 z-40 select-none" />
        </div>
      </div>
    </div>
  );
}
