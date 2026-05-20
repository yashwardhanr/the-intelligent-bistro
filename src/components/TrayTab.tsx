import React, { useState } from "react";
import { CartItem, UserProfile } from "../types";
import { Trash2, AlertTriangle, BadgePercent, ChefHat, Check, Award, BadgeAlert, Sparkle } from "lucide-react";

interface TrayTabProps {
  profile: UserProfile;
  cart: CartItem[];
  onUpdateQty: (key: string, delta: number) => void;
  onClearCart: () => void;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
}

export default function TrayTab({
  profile,
  cart,
  onUpdateQty,
  onClearCart,
  setProfile
}: TrayTabProps) {
  const [checkingOut, setCheckingOut] = useState(false);
  const [orderDelivered, setOrderDelivered] = useState(false);

  // Subtotal calculations
  const subtotal = cart.reduce((acc, curr) => {
    // Add possible extra surcharges for modifiers
    let surcharge = 0;
    if (curr.selectedModifiers["Add Extras"]?.includes("Cheddar")) {
      surcharge = 1.50;
    }
    return acc + (curr.menuItem.price + surcharge) * curr.quantity;
  }, 0);

  const culinaryFee = subtotal > 0 ? 3.00 : 0.00;
  const grandTotal = subtotal + culinaryFee;

  // Budget calculations
  const budgetRatio = profile.budget ? grandTotal / profile.budget : 0.00;
  
  // Progress Bar and warnings classes
  let budgetColorClass = "bg-emerald-500";
  let budgetBgClass = "bg-emerald-100/30";
  let budgetStatusText = "Safely within budget";
  const budgetAlert = budgetRatio > 1.0;

  if (budgetRatio > 0.8 && budgetRatio <= 1.0) {
    budgetColorClass = "bg-amber-500 animate-pulse";
    budgetBgClass = "bg-amber-100/30";
    budgetStatusText = "Caution: Reaching budget limit!";
  } else if (budgetAlert) {
    budgetColorClass = "bg-rose-500 animate-pulse";
    budgetBgClass = "bg-rose-100/20";
    budgetStatusText = "Allergent Alert: Budget threshold breached!";
  }

  const handlePlaceOrder = () => {
    setCheckingOut(true);
    setTimeout(() => {
      setCheckingOut(false);
      setOrderDelivered(true);
      // Automatically credit Loyalty Club Points for placing an order
      setProfile(p => ({ ...p, loyaltyPoints: p.loyaltyPoints + 250 }));
    }, 2800);
  };

  const handleResetSuccess = () => {
    onClearCart();
    setOrderDelivered(false);
  };

  return (
    <div id="tray-tab-container" className="flex flex-col h-full bg-white font-sans relative">
      
      {/* Checkout Success Screen */}
      {orderDelivered && (
        <div id="checkout-success" className="absolute inset-0 bg-white rounded-3xl z-40 p-6 flex flex-col items-center justify-center text-center animate-fade-in border-2 border-emerald-500/20 shadow-md">
          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mb-4 animate-bounce border border-emerald-100">
            <ChefHat className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-sm font-bold text-slate-800 tracking-tight leading-tight">Gourmet Order Placed!</h2>
          <p className="text-[11px] text-slate-500 max-w-[190px] mx-auto mt-2 leading-relaxed">
            Chef has accepted your ticket. Your table wait duration is <span className="font-mono font-bold text-indigo-650">18 minutes</span>.
          </p>

          <div className="mt-4 bg-indigo-50 border border-indigo-100 p-3 rounded-2xl flex flex-col gap-1 items-center max-w-[190px]">
            <Award className="w-5 h-5 text-indigo-600" />
            <span className="text-[10px] font-bold text-indigo-850">VIP LOYALTY CLUB CREDIT</span>
            <span className="text-xs font-mono font-bold text-indigo-900">+250 PTS ADDED!</span>
          </div>

          <button
            id="dismiss-checkout-btn"
            onClick={handleResetSuccess}
            className="mt-6 px-4 py-2 bg-indigo-600 hover:bg-indigo-505 text-white font-semibold text-xs rounded-xl transition-all cursor-pointer shadow-md"
          >
            Acknowledge & Restart
          </button>
        </div>
      )}

      {/* Cart scrolling list */}
      <div className="flex-1 overflow-y-auto pr-0.5 max-h-[220px] min-h-[140px] flex flex-col gap-2.5 pb-2 scrollbar-thin scrollbar-thumb-slate-200">
        {cart.length > 0 ? (
          cart.map((item) => {
            let itemSurcharge = 0;
            if (item.selectedModifiers["Add Extras"]?.includes("Cheddar")) {
              itemSurcharge = 1.50;
            }
            const unitPrice = item.menuItem.price + itemSurcharge;

            return (
              <div 
                key={item.key} 
                id={`cart-item-${item.key}`}
                className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl p-2.5 shadow-sm flex-shrink-0"
              >
                {/* Thumb */}
                <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100 border border-slate-200">
                  <img src={item.menuItem.image} alt="" className="w-full h-full object-cover" />
                </div>

                {/* Info detailing modifiers */}
                <div className="flex-1 flex flex-col">
                  <span className="text-xs font-bold text-slate-800 truncate max-w-[120px]">
                    {item.menuItem.name}
                  </span>
                  
                  {/* Selected Modifiers chips list */}
                  {Object.keys(item.selectedModifiers).length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {Object.entries(item.selectedModifiers).map(([key, val]) => (
                        <span key={key} className="text-[7.5px] font-mono px-1 py-0.2 bg-white text-indigo-750 rounded border border-indigo-100 leading-none uppercase font-bold">
                          {key}: {val}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Adjusting Quantity Counter controllers */}
                <div className="flex flex-col items-end gap-1 flex-shrink-0 pl-1 border-l border-slate-200">
                  <span className="text-xs font-mono font-bold text-slate-800 leading-none">
                    ${(unitPrice * item.quantity).toFixed(2)}
                  </span>
                  
                  <div className="flex items-center gap-2 mt-0.5 bg-white rounded-lg border border-slate-200 px-1 py-0.5">
                    <button
                      id={`cart-item-dec-${item.key}`}
                      onClick={() => onUpdateQty(item.key, -1)}
                      className="text-[10px] font-mono font-bold text-slate-500 hover:text-slate-900 px-1 hover:bg-slate-100 rounded leading-none select-none cursor-pointer"
                    >
                      -
                    </button>
                    <span className="text-[10.5px] font-mono font-bold text-slate-800 leading-none select-none">
                      {item.quantity}
                    </span>
                    <button
                      id={`cart-item-inc-${item.key}`}
                      onClick={() => onUpdateQty(item.key, 1)}
                      className="text-[10px] font-mono font-bold text-slate-500 hover:text-slate-900 px-1 hover:bg-slate-100 rounded leading-none select-none cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-400 gap-2 py-8 select-none">
            <ChefHat className="w-8 h-8 text-indigo-600/30 animate-pulse" />
            <div className="flex flex-col gap-0.5">
              <p className="text-xs font-bold text-slate-600">Your tray is empty</p>
              <p className="text-[10px] text-slate-400 max-w-[170px] mx-auto">Browse the visual menu cards or instruct our AI Assistant in the Chat tab!</p>
            </div>
          </div>
        )}
      </div>

      {/* Budget Limit Progress Area */}
      {subtotal > 0 && (
        <div id="cart-budget-panel" className="bg-slate-50 border-t border-b border-slate-100 py-3 flex flex-col gap-1.5 select-none my-1 p-2 rounded-xl">
          <div className="flex justify-between items-center text-[10px] font-mono leading-none">
            <div className="flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${budgetAlert ? "bg-red-500 animate-ping" : "bg-emerald-500"}`} />
              <span className="text-slate-500 uppercase tracking-wider font-semibold">Tray Budget Tracker</span>
            </div>
            <span className={`font-bold ${budgetAlert ? "text-red-650" : "text-indigo-650"}`}>
              ${grandTotal.toFixed(2)} of ${profile.budget} Max
            </span>
          </div>

          {/* Bar track */}
          <div className={`w-full h-1.5 rounded-full overflow-hidden ${budgetBgClass}`}>
            <div 
              id="budget-bar-fill"
              className={`h-full transition-all duration-500 ${budgetColorClass}`}
              style={{ width: `${Math.min(100, budgetRatio * 100)}%` }}
            />
          </div>

          <span className={`text-[8.5px] font-sans font-semibold uppercase leading-none mt-0.5 ${budgetAlert ? "text-red-500 flex items-center gap-1 animate-pulse" : "text-slate-400"}`}>
            {budgetAlert && <BadgeAlert className="w-3.5 h-3.5" />} {budgetStatusText}
          </span>
        </div>
      )}

      {/* Payment receipts */}
      {subtotal > 0 && !checkingOut && (
        <div className="flex flex-col gap-2 pt-2 bg-white rounded-t-xl select-none">
          <div className="flex justify-between text-[11px] text-slate-500 leading-none">
            <span>Subtotal tray cost</span>
            <span className="font-mono font-medium">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-[11px] text-slate-500 leading-none font-medium">
            <span>Chef Premium Surcharges</span>
            <span className="font-mono">${culinaryFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xs font-bold text-slate-800 leading-none border-t border-slate-100 pt-2.5 mt-0.5">
            <span>Estimated grand total</span>
            <span className="font-mono font-bold text-indigo-700">${grandTotal.toFixed(2)}</span>
          </div>

          {/* Place order button */}
          <button
            id="checkout-placing-order-btn"
            onClick={handlePlaceOrder}
            className="w-full py-2.5 mt-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
          >
            <span>Confirm Gastronomy Order</span>
            <span>(${grandTotal.toFixed(2)})</span>
          </button>
        </div>
      )}

      {checkingOut && (
        <div className="py-8 flex flex-col items-center justify-center text-center gap-3">
          <div className="w-8 h-8 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
          <div className="flex flex-col gap-0.5 select-none animate-pulse">
            <span className="text-xs font-bold text-slate-700">Encoding Transactional Ticket</span>
            <span className="text-[10px] text-slate-400">Transmitting to Kitchen Chef tandoor...</span>
          </div>
        </div>
      )}
    </div>
  );
}
