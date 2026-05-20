import React, { useState } from "react";
import { AIChatMessage } from "../types";
import { 
  Terminal, 
  Database, 
  Cpu, 
  Activity, 
  Smartphone, 
  BookOpen, 
  Download, 
  Wifi, 
  CheckCircle2, 
  Server, 
  ArrowRight 
} from "lucide-react";

interface TraceBoardProps {
  messages: AIChatMessage[];
}

export default function TraceBoard({ messages }: TraceBoardProps) {
  // Toggle between live REST telemetry logs and Phone setup guide
  const [activePanel, setActivePanel] = useState<"telemetry" | "phone-guide">("phone-guide");

  // Get the latest assistant response with trace logs
  const latestTraceMsg = [...messages]
    .reverse()
    .find(m => m.sender === "assistant" && m.logs);

  return (
    <div id="trace-board" className="bg-[#0e0c0a] border border-[#211a14] rounded-2xl p-6 text-slate-300 flex flex-col gap-4 shadow-2xl h-full font-mono select-none">
      
      {/* Universal Tabs Panel */}
      <div className="flex border-b border-[#211a14] pb-2 gap-2">
        <button
          onClick={() => setActivePanel("phone-guide")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
            activePanel === "phone-guide" 
              ? "bg-[#181512] text-amber-400 border border-[#422d19]" 
              : "text-slate-500 hover:text-slate-350 bg-transparent border border-transparent"
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>Access on Phone</span>
        </button>
        <button
          onClick={() => setActivePanel("telemetry")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
            activePanel === "telemetry" 
              ? "bg-[#181512] text-emerald-400 border border-[#1b3524]" 
              : "text-slate-500 hover:text-slate-350 bg-transparent border border-transparent"
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>Postgres/REST Trace</span>
        </button>
      </div>

      {/* PANEL 1: MOBILE RUN GUIDE */}
      {activePanel === "phone-guide" ? (
        <div className="flex-1 flex flex-col gap-4 overflow-y-auto max-h-[500px] scrollbar-thin scrollbar-thumb-[#231a13] pr-1">
          
          <div className="bg-[#1c140c]/50 border border-[#3e2b17] rounded-lg p-3 text-[11px] leading-relaxed text-[#dfd0c1] flex items-start gap-2.5">
            <span className="text-amber-500 font-bold">★ MONOREPO GENERATED</span>
            <p>
              I have written standard, standalone files in <code className="text-white">/mobile</code> (Expo App) and <code className="text-white">/backend</code> (Express & Gemini). You can export the whole bundle via structural download ZIP!
            </p>
          </div>

          {/* Step 1: Backend */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-xs text-white font-semibold">
              <span className="w-5 h-5 bg-amber-500/10 border border-amber-500/25 rounded-md flex items-center justify-center text-amber-400 text-[10px] font-bold">1</span>
              <span>Deploy Node.js Backend Server</span>
            </div>
            <div className="bg-[#060504] border border-[#1d1610] p-3 rounded-lg text-[10.5px] text-[#b3a89c] font-sans flex flex-col gap-1">
              <p>Host our server.ts logic independently on your machine:</p>
              <pre className="p-2 bg-[#0c0a08] border border-[#1f1710] rounded text-orange-200 mt-1.5 font-mono text-[10px]">
{`cd backend
npm install
npm start`}
              </pre>
              <p className="text-[9.5px] text-[#8c8175] mt-1">
                Creates REST port at <code className="text-amber-500">http://localhost:4000</code> utilizing the custom Gemini waiter.
              </p>
            </div>
          </div>

          {/* Step 2: Mobile Client */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-xs text-white font-semibold flex-shrink-0">
              <span className="w-5 h-5 bg-amber-500/10 border border-amber-500/25 rounded-md flex items-center justify-center text-amber-400 text-[10px] font-bold">2</span>
              <span>Launch React Native Expo</span>
            </div>
            <div className="bg-[#060504] border border-[#1d1610] p-3 rounded-lg text-[10.5px] text-[#b3a89c] font-sans flex flex-col gap-1">
              <p>Install <span className="text-white font-bold">Expo Go</span> App on your physical iPhone/Android. Runbundler locally:</p>
              <pre className="p-2 bg-[#0c0a08] border border-[#1f1710] rounded text-orange-200 mt-1.5 font-mono text-[10px]">
{`cd mobile
npm install
npx expo start`}
              </pre>
              <div className="text-[9.5px] text-[#8c8175] mt-1.5 leading-relaxed flex flex-col gap-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  Connect both devices to your <span className="text-white font-semibold">same Home Wi-Fi</span> network.
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  Scan the terminal's QR code via physical smartphone camera!
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  In the app's <span className="text-white font-semibold">Settings</span> tab, input your server's LAN IP address.
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-[#1a1510] pt-2 text-[9px] text-[#716558] flex items-center justify-between">
            <span>READY FOR STANDALONE DOWNLOAD</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          </div>

        </div>
      ) : (
        /* PANEL 2: REST TELEMETRY LOGS */
        <div className="flex-1 flex flex-col gap-4">
          
          {/* Hardware Header */}
          <div className="grid grid-cols-3 gap-2 bg-[#171410] border border-[#231a13] p-3 rounded-lg text-[10px]">
            <div className="flex flex-col gap-0.5">
              <span className="text-[#8e857b] text-[8px] uppercase">Engine Portal</span>
              <span className="text-emerald-300 flex items-center gap-1 font-semibold truncate">
                <Cpu className="w-3 h-3 text-emerald-500" /> 
                {latestTraceMsg?.logs?.model || "Standard Node"}
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[#8e857b] text-[8px] uppercase">REST Latency</span>
              <span className={`font-semibold ${latestTraceMsg?.logs?.latencyMs ? "text-emerald-300" : "text-[#70665d]"}`}>
                {latestTraceMsg?.logs?.latencyMs ? `${latestTraceMsg.logs.latencyMs}ms` : "0.00ms"}
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[#8e857b] text-[8px] uppercase">HTTP Gateway</span>
              <span className="text-amber-500 flex items-center gap-1 font-semibold">
                <Database className="w-3 h-3 text-amber-500" /> PORT 4000
              </span>
            </div>
          </div>

          {/* Terminal Console window */}
          <div className="flex-1 bg-[#060504] border border-[#1b1510] rounded-lg p-4 font-mono text-xs overflow-y-auto flex flex-col gap-3 min-h-[140px] max-h-[350px] scrollbar-thin scrollbar-thumb-[#231a13]">
            {latestTraceMsg ? (
              <>
                <div className="flex items-center gap-1.5 text-emerald-500/60 border-b border-[#1b1510] pb-2 text-[10px]">
                  <span className="px-1.5 py-0.5 bg-emerald-950/40 rounded text-emerald-400">POST</span>
                  <span>/api/ai/order</span>
                  <span className="ml-auto text-[#625950]">200 OK</span>
                </div>

                {/* Request */}
                <div className="flex flex-col gap-1">
                  <span className="text-[#80766b] text-[10px] select-none">// Client payload request payload:</span>
                  <div className="bg-[#120f0d] p-2.5 rounded border border-[#251e18] text-[11px] overflow-x-auto text-[#e6d0bb]">
                    {`{`}
                    <div className="pl-3">
                      <span className="text-amber-400">"message"</span>: <span className="text-emerald-300">"{latestTraceMsg.logs?.rawResponse ? "User input parsed successfully" : "No orders sent"}"</span>,
                    </div>
                    {`}`}
                  </div>
                </div>

                {/* Response ACTIONS */}
                <div className="flex flex-col gap-1">
                  <span className="text-[#80766b] text-[10px] select-none">// Gemini dynamic parsed schemas JSON:</span>
                  <div className="bg-[#120f0d] p-2.5 rounded border border-[#251e18] text-[11px] overflow-x-auto text-yellow-300">
                    <pre className="whitespace-pre-wrap">{JSON.stringify(
                      {
                        proposedActions: latestTraceMsg.proposedActions || [],
                        explanation: latestTraceMsg.logs?.explanation || "Parsed successfully.",
                      }, 
                      null, 
                      2
                    )}</pre>
                  </div>
                </div>

                {/* explanation */}
                <div className="text-[10px] text-emerald-500/70 border-t border-[#1b1510] pt-2 flex items-start gap-1.5">
                  <span className="text-amber-500 font-bold uppercase select-none">AI Insight &gt;</span>
                  <span>{latestTraceMsg.logs?.explanation || "Awaiting target prompt command."}</span>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-[#554d45] gap-3">
                <Activity className="w-8 h-8 text-[#554d45] animate-pulse" />
                <div className="flex flex-col gap-0.5">
                  <p className="text-xs font-semibold text-[#8e857b]">Console Idle</p>
                  <p className="text-[10px] text-[#554d45] max-w-[220px]">Choose a quick prompt on the left or chat inside the iPhone simulator to review telemetry.</p>
                </div>
              </div>
            )}
          </div>

          {/* Footer list */}
          <div className="border-t border-[#211a14] pt-3 flex flex-col gap-2">
            <span className="text-[10px] text-[#8c8277] uppercase font-bold tracking-wider">Node REST Endpoints</span>
            <div className="flex flex-col gap-1.5 text-[10px] text-orange-100/60 font-sans">
              <div className="flex justify-between items-center bg-[#13110e] px-2.5 py-1.5 rounded border border-[#271f18]">
                <span className="font-mono text-emerald-400">GET /api/menu</span>
                <span className="text-[9px] text-emerald-500 bg-[#0f2a1b]/40 px-1 py-0.2 rounded border border-emerald-950/20">LIVE</span>
              </div>
              <div className="flex justify-between items-center bg-[#13110e] px-2.5 py-1.5 rounded border border-[#271f18]">
                <span className="font-mono text-emerald-400">POST /api/ai/order</span>
                <span className="text-[9px] text-[#8e8276] uppercase">SECURE CLOUD</span>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
