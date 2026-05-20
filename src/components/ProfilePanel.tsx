import React from "react";
import { UserProfile, DietType, SpiceToleranceType } from "../types";
import { Sparkles, ShieldAlert, BadgeDollarSign, Swords, Flame, Sparkle } from "lucide-react";

interface ProfilePanelProps {
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  onSendPresetMessage: (msg: string) => void;
  isProcessing: boolean;
}

const PRESET_PROMPTS = [
  {
    label: "Add spicy sandwich & water",
    prompt: "Add two spicy chicken sandwiches and a large water",
    icon: "🔥"
  },
  {
    label: "Change order to vegetarian",
    prompt: "Make my whole order vegetarian please",
    icon: "🌿"
  },
  {
    label: "Add dessert (Check Nut Allergy)",
    prompt: "Add a chocolate lava cake for my dessert",
    icon: "🍫"
  },
  {
    label: "Upgrade to healthier items",
    prompt: "Actually, swap those heavy items and make it healthier",
    icon: "🥗"
  },
  {
    label: "Clean the tray",
    prompt: "Please clear my cart and let me start fresh",
    icon: "🔄"
  },
  {
    label: "Surprise me (High Protein)",
    prompt: "Surprise me with a meal high in protein under 50 calories",
    icon: "⚡"
  }
];

export default function ProfilePanel({
  profile,
  setProfile,
  onSendPresetMessage,
  isProcessing
}: ProfilePanelProps) {
  
  const handleDietChange = (diet: DietType) => {
    setProfile(prev => ({ ...prev, diet }));
  };

  const handleSpiceChange = (spiceTolerance: SpiceToleranceType) => {
    setProfile(prev => ({ ...prev, spiceTolerance }));
  };

  const handleToggleAllergy = (allergy: string) => {
    setProfile(prev => {
      const exists = prev.allergies.includes(allergy);
      const newAllergies = exists
        ? prev.allergies.filter(a => a !== allergy)
        : [...prev.allergies, allergy];
      return { ...prev, allergies: newAllergies };
    });
  };

  const incrementPoints = () => {
    setProfile(prev => ({ ...prev, loyaltyPoints: prev.loyaltyPoints + 150 }));
  };

  return (
    <div id="profile-panel" className="bg-white border border-slate-200 rounded-2xl p-6 text-slate-800 flex flex-col gap-6 shadow-sm h-full select-none">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
        <div className="p-2 bg-indigo-50 rounded-xl">
          <Sparkles className="w-5 h-5 text-indigo-600 animate-pulse" />
        </div>
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-slate-900 font-sans">Bistro Profile Control</h2>
          <p className="text-xs text-indigo-600 font-mono">Gastronomic Personalization System</p>
        </div>
      </div>

      {/* Guest Loyalty Identity Card */}
      <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 border border-indigo-700 rounded-xl p-4 flex flex-col justify-between gap-3 relative overflow-hidden shadow-sm">
        <div className="absolute top-[-20px] right-[-20px] w-24 h-24 bg-white/10 rounded-full blur-xl" />
        <div className="flex justify-between items-start z-10">
          <div>
            <p className="text-[10px] uppercase font-mono tracking-widest text-indigo-200/80">Loyalty Club Member</p>
            <h3 className="text-base font-semibold text-white tracking-tight">{profile.preferredName}</h3>
          </div>
          <span className="px-2 py-0.5 bg-white/20 text-white rounded-md text-[10px] font-mono border border-white/25">
            VIP ELITE
          </span>
        </div>
        <div className="flex justify-between items-end z-10 pt-2">
          <div>
            <span className="text-[10px] font-mono text-indigo-200/70 block">AVAILABLE POINTS</span>
            <span className="text-lg font-mono font-bold text-white">{profile.loyaltyPoints.toLocaleString()} PTS</span>
          </div>
          <button 
            id="earn-points-btn"
            onClick={incrementPoints}
            className="px-2.5 py-1 bg-white text-indigo-600 rounded-lg text-xs font-semibold hover:bg-indigo-50 transition-colors cursor-pointer"
          >
            + Add Points
          </button>
        </div>
      </div>

      {/* Inputs */}
      <div className="flex flex-col gap-5 overflow-y-auto pr-1 max-h-[280px]">
        
        {/* Diet Preferences */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-mono font-medium text-slate-500 flex items-center gap-1.5 uppercase tracking-wider">
            <Sparkle className="w-3.5 h-3.5 text-indigo-600" /> Culinary Filter
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(["none", "veg", "vegan"] as DietType[]).map((d) => (
              <button
                key={d}
                id={`diet-btn-${d}`}
                onClick={() => handleDietChange(d)}
                className={`py-1.5 px-2 rounded-lg text-xs font-medium border capitalize transition-all cursor-pointer ${
                  profile.diet === d
                    ? "bg-indigo-600 text-white border-indigo-600 font-semibold"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                }`}
              >
                {d === "none" ? "All Eats" : d}
              </button>
            ))}
          </div>
        </div>

        {/* Spice Level Target */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-mono font-medium text-slate-500 flex items-center gap-1.5 uppercase tracking-wider">
            <Flame className="w-3.5 h-3.5 text-indigo-600 animate-pulse" /> Heat Threshold
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(["mild", "medium", "hot"] as SpiceToleranceType[]).map((s) => (
              <button
                key={s}
                id={`spice-btn-${s}`}
                onClick={() => handleSpiceChange(s)}
                className={`py-1.5 px-2 rounded-lg text-xs font-medium border capitalize transition-all cursor-pointer ${
                  profile.spiceTolerance === s
                    ? "bg-indigo-600 text-white border-indigo-600 font-semibold shadow-inner"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Allergy Ward Checkboxes */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-mono font-medium text-slate-500 flex items-center gap-1.5 uppercase tracking-wider">
            <ShieldAlert className="w-3.5 h-3.5 text-indigo-600" /> Dynamic Allergen Warnings
          </label>
          <div className="flex flex-col gap-2">
            {[
              { id: "peanuts", label: "Peanuts & Tree Nuts (e.g. Lava Cake)" },
              { id: "gluten", label: "Gluten Intolerance" }
            ].map(allergen => {
              const checked = profile.allergies.includes(allergen.id);
              return (
                <div 
                  key={allergen.id} 
                  id={`allergen-${allergen.id}`}
                  onClick={() => handleToggleAllergy(allergen.id)}
                  className={`flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer transition-all ${
                    checked 
                      ? "bg-rose-50 border-rose-200 text-rose-800" 
                      : "bg-slate-50 border-slate-200 text-slate-500"
                  }`}
                >
                  <div className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                    checked ? "bg-rose-500 border-rose-400" : "border-slate-300"
                  }`}>
                    {checked && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </div>
                  <span className="text-xs font-sans font-medium">{allergen.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Financial Budget Cap */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center text-xs font-mono font-medium text-slate-500 uppercase tracking-wider">
            <span className="flex items-center gap-1.5"><BadgeDollarSign className="w-3.5 h-3.5 text-indigo-600" /> Budget Optimizer</span>
            <span className="text-indigo-600 font-bold">${profile.budget} Max</span>
          </div>
          <input
            id="budget-range-input"
            type="range"
            min="15"
            max="100"
            step="5"
            value={profile.budget}
            onChange={(e) => setProfile(prev => ({ ...prev, budget: parseInt(e.target.value) }))}
            className="w-full accent-indigo-600 cursor-pointer h-1 bg-slate-100 rounded-lg appearance-none"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>$15</span>
            <span>$100</span>
          </div>
        </div>

        {/* Healthy Menu Upgrade Toggle */}
        <div 
          id="toggle-healthy"
          onClick={() => setProfile(prev => ({ ...prev, healthFocus: !prev.healthFocus }))}
          className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
            profile.healthFocus 
              ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
              : "bg-slate-50 border-slate-200 text-slate-500"
          }`}
        >
          <div className="flex flex-col">
            <span className="text-xs font-sans font-semibold text-slate-800">Macro Calorie Trim</span>
            <span className="text-[10px] text-slate-400">Auto-suggest wholesome substitutes</span>
          </div>
          <div className={`w-9 h-5 rounded-full p-0.5 transition-all ${profile.healthFocus ? "bg-emerald-500" : "bg-slate-300"}`}>
            <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${profile.healthFocus ? "translate-x-4" : "translate-x-0"}`} />
          </div>
        </div>
      </div>

      {/* Preset Command Cloud */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-mono font-medium text-slate-500 uppercase tracking-wider flex items-center gap-1">
          <Swords className="w-3.5 h-3.5 text-indigo-600" /> Interactive Evaluation Chips
        </label>
        <p className="text-[10px] text-slate-400 mt-1 font-sans">Click any capsule to feed the AI natural language intents directly:</p>
        <div className="flex flex-wrap gap-1.5 max-h-[140px] overflow-y-auto pr-1">
          {PRESET_PROMPTS.map((item, idx) => (
            <button
              key={idx}
              id={`preset-prompt-${idx}`}
              onClick={() => !isProcessing && onSendPresetMessage(item.prompt)}
              disabled={isProcessing}
              className="py-1 px-2.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 hover:text-indigo-600 rounded-full text-xs font-sans flex items-center gap-1.5 transition-all text-left cursor-pointer disabled:opacity-50"
            >
              <span>{item.icon}</span>
              <span className="truncate max-w-[190px]">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
