export interface MenuItem {
  id: string;
  name: string;
  price: number;
  description: string;
  category: "Starters" | "Main Course" | "Desserts" | "Beverages" | "Sides";
  image: string;
  tags: ("veg" | "non-veg" | "vegan" | "spicy" | "healthy" | "high-protein" | "contains-nuts" | "gluten-free")[];
  calories: number;
  protein: number; // in grams
  prepTime: number; // in minutes
  modifiers?: {
    name: string;
    options: string[];
    defaultOption: string;
  }[];
}

export interface SelectedModifiers {
  [key: string]: string;
}

export interface CartItem {
  key: string; // unique cart entry key: id + stringified modifiers
  menuItem: MenuItem;
  quantity: number;
  selectedModifiers: SelectedModifiers;
}

export type DietType = "none" | "veg" | "vegan" | "gluten-free";
export type SpiceToleranceType = "mild" | "medium" | "hot";

export interface UserProfile {
  diet: DietType;
  spiceTolerance: SpiceToleranceType;
  budget: number;
  allergies: string[];
  loyaltyPoints: number;
  preferredName: string;
  healthFocus: boolean;
}

export interface AIAction {
  type: "ADD_ITEM" | "REMOVE_ITEM" | "MODIFY_ITEM" | "CLEAR_CART";
  itemId?: string;
  quantity?: number;
  modifiers?: SelectedModifiers;
}

export interface AIChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
  suggestedPrompts?: string[];
  proposedActions?: AIAction[];
  logs?: {
    model: string;
    rawResponse: string;
    latencyMs: number;
    tokensUsed?: number;
    explanation?: string;
  };
}

export interface CartDiff {
  itemId: string;
  name: string;
  price: number;
  oldQty: number;
  newQty: number;
  modifiers?: SelectedModifiers;
}
