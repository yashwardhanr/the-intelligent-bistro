import React, { useState } from "react";
import { MenuItem, SelectedModifiers, UserProfile } from "../types";
import { MENU } from "../data/menu";
import { Search, Flame, Leaf, Award, Clock, Star, Heart, Plus, Check, ShieldAlert, Sparkles } from "lucide-react";

interface MenuTabProps {
  profile: UserProfile;
  onAddItem: (item: MenuItem, modifiers: SelectedModifiers, quantity: number) => void;
}

type CategoryType = "All" | "Starters" | "Main Course" | "Desserts" | "Beverages" | "Sides";

export default function MenuTab({ profile, onAddItem }: MenuTabProps) {
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>("All");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Custom modifier state
  const [customizingItem, setCustomizingItem] = useState<MenuItem | null>(null);
  const [chosenModifiers, setChosenModifiers] = useState<SelectedModifiers>({});
  const [customQty, setCustomQty] = useState(1);
  const [addedAnimationId, setAddedAnimationId] = useState<string | null>(null);

  // Filter menu items based on Search, Category, and User Taste Profile (veg/vegan constraints)
  const filteredMenu = MENU.filter(item => {
    // Category match
    if (selectedCategory !== "All" && item.category !== selectedCategory) return false;
    
    // Search match
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      if (!item.name.toLowerCase().includes(q) && !item.description.toLowerCase().includes(q)) {
        return false;
      }
    }

    // Interactive Taste Filter: Veg/Vegan preferences
    if (profile.diet === "veg") {
      // Must not be non-veg
      if (item.tags.includes("non-veg")) return false;
    }
    if (profile.diet === "vegan") {
      // Must include vegan tag
      if (!item.tags.includes("vegan")) return false;
    }

    return true;
  });

  const handleOpenCustomize = (item: MenuItem) => {
    if (item.modifiers && item.modifiers.length > 0) {
      const defaultMods: SelectedModifiers = {};
      item.modifiers.forEach(m => {
        defaultMods[m.name] = m.defaultOption;
      });
      setChosenModifiers(defaultMods);
      setCustomQty(1);
      setCustomizingItem(item);
    } else {
      // Add immediately with no modifiers
      onAddItem(item, {}, 1);
      triggerSuccessFlash(item.id);
    }
  };

  const handleConfirmCustomize = () => {
    if (customizingItem) {
      onAddItem(customizingItem, chosenModifiers, customQty);
      triggerSuccessFlash(customizingItem.id);
      setCustomizingItem(null);
    }
  };

  const triggerSuccessFlash = (itemId: string) => {
    setAddedAnimationId(itemId);
    setTimeout(() => {
      setAddedAnimationId(null);
    }, 1200);
  };

  return (
    <div id="menu-tab-container" className="flex flex-col gap-4 h-full relative font-sans">
      
      {/* Search and Welcome Area */}
      <div className="flex flex-col gap-2.5">
        <div className="flex justify-between items-end">
          <div>
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest block">Signature Cuisine</span>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-1.5 leading-none">
              The Bistro Menu <Sparkles className="w-4 h-4 text-indigo-600" />
            </h1>
          </div>
          {profile.diet !== "none" && (
            <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100 font-semibold uppercase">
              🌿 {profile.diet} filter on
            </span>
          )}
        </div>

        {/* Small Search input */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            id="menu-search-input"
            type="text"
            placeholder="Craving a spicy chicken sandwich? Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-100 border-none rounded-xl py-2 pl-9 pr-4 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Categories Horizontal Scroller */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-2 px-2 scrollbar-none select-none">
        {(["All", "Starters", "Main Course", "Desserts", "Beverages", "Sides"] as CategoryType[]).map((cat) => (
          <button
            key={cat}
            id={`category-tab-${cat.replace(" ", "-")}`}
            onClick={() => setSelectedCategory(cat)}
            className={`py-1.5 px-3 rounded-full text-[11px] whitespace-nowrap font-medium transition-all duration-200 cursor-pointer ${
              selectedCategory === cat
                ? "bg-indigo-600 text-white font-semibold shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Food Listings */}
      <div id="food-listings-scroller" className="flex-1 min-h-0 overflow-y-auto pr-0.5 flex flex-col gap-3 pb-8">
        {filteredMenu.length > 0 ? (
          filteredMenu.map((item) => {
            const hasAnim = addedAnimationId === item.id;
            const hasAllergyConflict = item.tags.includes("contains-nuts") && profile.allergies.includes("peanuts");

            return (
              <div 
                key={item.id} 
                id={`menu-card-${item.id}`}
                className={`flex gap-3 bg-white border rounded-2xl p-3 relative overflow-hidden transition-all duration-300 shadow-sm flex-shrink-0 ${
                  hasAnim ? "border-emerald-400 bg-emerald-50/25" : "border-slate-100 hover:border-indigo-150 hover:shadow-md"
                }`}
              >
                {/* Visual Label overlays */}
                <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
                  {item.tags.includes("veg") && (
                    <span className="p-1 bg-white/95 backdrop-blur-md rounded-lg shadow-sm border border-emerald-100/50">
                      <Leaf className="w-3 h-3 text-emerald-600 fill-emerald-500/10" />
                    </span>
                  )}
                  {item.tags.includes("spicy") && (
                    <span className="p-1 bg-white/95 backdrop-blur-md rounded-lg shadow-sm border border-orange-100/50">
                      <Flame className="w-3 h-3 text-orange-600 fill-orange-500/10" id={`spice-indicator-${item.id}`} />
                    </span>
                  )}
                </div>

                {/* Left - Dish Thumbnail Image */}
                <div className="w-20 h-20 rounded-xl overflow-hidden relative bg-slate-100 flex-shrink-0">
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  {/* Rating Badge */}
                  <div className="absolute bottom-1 right-1 bg-black/70 px-1 py-0.5 rounded text-[8px] font-mono text-amber-400 font-bold flex items-center gap-0.5">
                    <Star className="w-2 h-2 fill-amber-400 border-none text-transparent" /> 4.9
                  </div>
                </div>

                {/* Center - Description & Specs */}
                <div className="flex-1 flex flex-col gap-1 min-w-0">
                  <div className="flex justify-between items-start gap-1">
                    <h3 className="text-xs font-bold text-slate-800 leading-snug tracking-tight break-words">
                      {item.name}
                    </h3>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-relaxed font-sans line-clamp-2">
                    {item.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-1 mt-1.5">
                    {/* Calories */}
                    <span className="text-[9px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded font-mono font-medium whitespace-nowrap">
                      {item.calories} kcal
                    </span>
                    {/* Prep time info */}
                    <span className="text-[9px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded font-mono font-medium flex items-center gap-0.5 whitespace-nowrap">
                      <Clock className="w-2.5 h-2.5 text-slate-400" /> {item.prepTime}m
                    </span>
                    {/* Nutrient Tags */}
                    {item.tags.includes("high-protein") && (
                      <span className="text-[9px] text-indigo-700 bg-indigo-50/75 px-1.5 py-0.5 rounded font-sans font-bold uppercase tracking-wider border border-indigo-100/50 whitespace-nowrap">
                        PRO+
                      </span>
                    )}
                  </div>
                </div>

                {/* Right Area - Prices & Adding Controls */}
                <div className="flex flex-col items-end justify-between min-w-[65px] flex-shrink-0 pl-1 border-l border-slate-100">
                  <span className="text-xs font-mono font-bold text-slate-900 leading-none">
                    ${item.price.toFixed(2)}
                  </span>

                  {hasAllergyConflict ? (
                    <div className="flex flex-col items-center gap-0.5 pb-1">
                      <ShieldAlert className="w-4 h-4 text-red-500" />
                      <span className="text-[7px] font-bold text-red-600 font-mono uppercase bg-red-50 py-0.2 px-1 rounded leading-none border border-red-100">NUT ALERT</span>
                    </div>
                  ) : hasAnim ? (
                    <div className="w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center text-white scale-110 shadow-sm transition-transform duration-300">
                      <Check className="w-4 h-4 text-white font-bold stroke-[3]" />
                    </div>
                  ) : (
                    <button
                      id={`add-btn-${item.id}`}
                      onClick={() => handleOpenCustomize(item)}
                      className="w-7 h-7 bg-indigo-600 text-white hover:bg-indigo-500 rounded-full flex items-center justify-center shadow-sm active:scale-95 transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4 text-white stroke-[3]" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2 animate-fade-in">
            <Search className="w-7 h-7 text-slate-300" />
            <div className="flex flex-col gap-0.5">
              <p className="text-xs font-bold text-slate-600">No matching dishes</p>
              <p className="text-[10px] text-slate-405 max-w-[190px] mx-auto">Your dietary profile or query filtered out some options. Try adjusting filters.</p>
            </div>
          </div>
        )}
      </div>

      {/* Customizable Modifiers Overlay Modal Drawer simulated inside phone */}
      {customizingItem && (
        <div id="customize-item-modal" className="absolute inset-0 bg-black/50 backdrop-blur-xs z-50 rounded-3xl flex flex-col justify-end">
          <div className="bg-white rounded-t-2xl p-4 flex flex-col gap-4 max-h-[310px] overflow-y-auto animate-slide-up border-t border-slate-200 shadow-xl">
            
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[9px] font-semibold text-indigo-600 font-mono tracking-widest uppercase">Customize Gastronomy</span>
                <h3 className="text-sm font-bold text-slate-900 leading-tight">{customizingItem.name}</h3>
              </div>
              <button 
                id="close-customize-btn"
                onClick={() => setCustomizingItem(null)} 
                className="text-xs text-slate-400 hover:text-slate-600 font-bold px-1.5 py-0.5 bg-slate-100 rounded-md"
              >
                Cancel
              </button>
            </div>

            {/* Custom Modifiers groups */}
            {customizingItem.modifiers?.map((mod, modIdx) => (
              <div key={modIdx} className="flex flex-col gap-1.5" id={`mod-group-${mod.name.replace(" ", "-")}`}>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{mod.name}</span>
                <div className="flex flex-wrap gap-1.5">
                  {mod.options.map((opt) => {
                    const isSelected = chosenModifiers[mod.name] === opt;
                    return (
                      <button
                        key={opt}
                        id={`modifier-option-${opt.replace(" ", "-")}`}
                        onClick={() => setChosenModifiers(prev => ({ ...prev, [mod.name]: opt }))}
                        className={`py-1 px-2.5 rounded-lg text-[10px] transition-all cursor-pointer border ${
                          isSelected
                            ? "bg-indigo-600 text-white border-indigo-600 font-semibold shadow-inner"
                            : "bg-slate-50 text-slate-600 border-slate-205 hover:bg-slate-100"
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Quantity counters */}
            <div className="flex justify-between items-center border-t border-slate-100 pt-3 mt-1">
              <div>
                <span className="text-[10px] font-semibold text-slate-400 block uppercase tracking-wider">Quantity Portions</span>
                <div className="flex items-center gap-3 mt-1">
                  <button 
                    id="dec-qty-btn"
                    onClick={() => setCustomQty(prev => Math.max(1, prev - 1))} 
                    className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-750 font-bold font-mono text-center flex items-center justify-center leading-none text-xs"
                  >
                    -
                  </button>
                  <span className="text-xs font-mono font-bold text-slate-800">{customQty}</span>
                  <button 
                    id="inc-qty-btn"
                    onClick={() => setCustomQty(prev => prev + 1)} 
                    className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-750 font-bold font-mono text-center flex items-center justify-center leading-none text-xs"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Total custom price tag */}
              <button
                id="add-customized-final-btn"
                onClick={handleConfirmCustomize}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer active:scale-95 transition-all text-center"
              >
                Add $
                {((customizingItem.price + (chosenModifiers["Add Extras"]?.includes("Cheddar") ? 1.50 : 0)) * customQty).toFixed(2)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
