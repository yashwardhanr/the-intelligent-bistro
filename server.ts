import express from "express";
import path from "path";
import fs from "fs";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { MENU } from "./src/data/menu.js"; // note relative path and ts-to-js resolution safely

// Load environment variables early
dotenv.config();

// Initialize Express
const app = express();
const PORT = 3000;

app.use(express.json());

// API: Get menu catalog
app.get("/api/menu", (req, res) => {
  res.json({ menu: MENU });
});

// Lazy-loaded Gemini initialization
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is missing. Falling back to offline simulator mode.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Simple but smart local rule-based mock parser for instant offline fidelity
function runFallbackMockParser(message: string, currentCart: any[], profile: any): any {
  const text = message.toLowerCase();
  const proposedActions: any[] = [];
  let userReply = "";
  let explanation = "Executed in high-fidelity deterministic offline fallback mode.";

  if (text.includes("add") || text.includes("want") || text.includes("order") || text.includes("get") || text.includes("buy") || text.includes("like")) {
    if (text.includes("chicken") || text.includes("sandwich")) {
      const qty = text.includes("two") || text.includes("2") ? 2 : 1;
      proposedActions.push({
        type: "ADD_ITEM",
        itemId: "nashville-chicken",
        quantity: qty,
        modifiers: { "Spice Level": "Nashville Hot", "Add Extras": "None" }
      });
      userReply = `I have updated your tray with ${qty} of our crispy Nashville Heat Chicken Sandwich. Would you like a refreshingly cool Antarctic Glacial Flow Water to balance the spice?`;
    }
    if (text.includes("paneer") || text.includes("tikka")) {
      const qty = text.includes("two") || text.includes("2") ? 2 : 1;
      proposedActions.push({
        type: "ADD_ITEM",
        itemId: "paneer-tikka",
        quantity: qty,
        modifiers: { "Spice": "Regular Spice" }
      });
      userReply = `Certainly! I've added ${qty} Charcoal Grilled Paneer Tikka roasted in our clay tandoor. It has been spiced to Medium tolerance.`;
    }
    if (text.includes("fries") || text.includes("potato") || text.includes("truffle")) {
      proposedActions.push({
        type: "ADD_ITEM",
        itemId: "truffle-fries",
        quantity: 1,
        modifiers: { "Fat Base": "Duck Fat (Crispiest)" }
      });
      userReply = "Excellent choice. One plate of our hand-cut Truffle Parmesan Duck-fat Fries has been queued. They are incredibly crispy!";
    }
    if (text.includes("water") || text.includes("glacial")) {
      proposedActions.push({
        type: "ADD_ITEM",
        itemId: "mineral-water",
        quantity: 1,
        modifiers: { "Serving Style": "Chilled with Lime" }
      });
      userReply = "Adding Antarctica Glacial Flow Water. Served double-chilled with freshly sliced lime in a tall glass.";
    }
    if (text.includes("kombucha") || text.includes("hibiscus")) {
      proposedActions.push({
        type: "ADD_ITEM",
        itemId: "hibiscus-kombucha",
        quantity: 1
      });
      userReply = "Adding our house-brewed effervescent Sparkling Lavender Hibiscus Kombucha.";
    }
    if (text.includes("risotto")) {
      proposedActions.push({
        type: "ADD_ITEM",
        itemId: "mushroom-risotto",
        quantity: 1
      });
      userReply = "I have put down a plate of Wild Mushroom & Truffle Risotto simmered in organic white wine.";
    }
    if (text.includes("buddha") || text.includes("vegan radiant")) {
      proposedActions.push({
        type: "ADD_ITEM",
        itemId: "buddha-bowl",
        quantity: 1,
        modifiers: { "Grain Base": "Tri-color Quinoa" }
      });
      userReply = "Adding a nourishing bowl of our healthy Vegan Radiant Buddha Bowl.";
    }
    if (text.includes("lava") || text.includes("cake") || text.includes("dessert")) {
      if (profile.allergies.includes("peanuts") || profile.allergies.includes("nuts")) {
        userReply = "I would love to add our chocolate lava cake, but I noticed you have configured a Nut Allergy in your profile! The molten cake contains traces of pistachio dust. May I recommend our gorgeous light, nut-free Chocolate Raspberry Mousse instead?";
        explanation = "Allergy conflict prevented adding lava cake.";
      } else {
        proposedActions.push({
          type: "ADD_ITEM",
          itemId: "lava-cake",
          quantity: 1
        });
        userReply = "One slice of Belgium Chocolate Lava Fondant added to desserts list. It is served with passionate saffron glaze!";
      }
    }
    if (proposedActions.length === 0) {
      userReply = "I couldn't quite map that dish. Did you mean our signature Nashville Heat Chicken Sandwich, Charcoal Grilled Paneer Tikka, or maybe some Truffle Fries?";
    }
  } else if (text.includes("remove") || text.includes("delete") || text.includes("cancel") || text.includes("drop")) {
    let itemFound = false;
    if (text.includes("water") || text.includes("antarctica")) {
      proposedActions.push({ type: "REMOVE_ITEM", itemId: "mineral-water", quantity: 1 });
      userReply = "Removed the Antarctica Glacial Flow Water from your current basket.";
      itemFound = true;
    }
    if (text.includes("chicken") || text.includes("sandwich")) {
      proposedActions.push({ type: "REMOVE_ITEM", itemId: "nashville-chicken", quantity: 1 });
      userReply = "Understood. Decreased the Nashville Chicken Sandwich portion counts by one.";
      itemFound = true;
    }
    if (!itemFound) {
      userReply = "No matching items found to adjust. Please clarify which item you'd like to decrease.";
    }
  } else if (text.includes("clear") || text.includes("empty") || text.includes("reset")) {
    proposedActions.push({ type: "CLEAR_CART" });
    userReply = "Your tray has been completely cleared. Ready for a brand new bistro order request!";
  } else if (text.includes("vegetarian") || text.includes("make it veg") || text.includes("make veg")) {
    // Elegant vegetable swap logic
    userReply = "Certainly! I have modified your active cart to be strictly Vegetarian. Any chicken or salmon selection has been replaced with delicious Charcoal Grilled Paneer Tikka and fresh avocado alternatives!";
    explanation = "Vegetarian profile optimization applied.";
    
    // Find if chicken is in cart, swap for paneer
    let hasNonVeg = false;
    for (const item of currentCart) {
      if (item.menuItem.id === "nashville-chicken") {
        proposedActions.push({ type: "REMOVE_ITEM", itemId: "nashville-chicken", quantity: item.quantity });
        proposedActions.push({ type: "ADD_ITEM", itemId: "paneer-tikka", quantity: item.quantity, modifiers: { "Spice": "Regular Spice" } });
        hasNonVeg = true;
      }
      if (item.menuItem.id === "salmon-poke") {
        proposedActions.push({ type: "REMOVE_ITEM", itemId: "salmon-poke", quantity: item.quantity });
        proposedActions.push({ type: "ADD_ITEM", itemId: "buddha-bowl", quantity: item.quantity });
        hasNonVeg = true;
      }
    }
    if (!hasNonVeg) {
      userReply = "I've locked your preference to strict vegetarian. Your current cart is clean of meat, so no direct substitutions were necessary! What delicious veg treats can I serve you?";
    }
  } else if (text.includes("healthy") || text.includes("healthier") || text.includes("low cal")) {
    userReply = "I've balanced your selections to prioritize low-calorie and high-nutrient alternatives! Swapping fries for Quinoa Garden Salad, and soft-drinks for kombucha.";
    explanation = "Health-focus filter activated.";
    for (const item of currentCart) {
      if (item.menuItem.id === "truffle-fries") {
        proposedActions.push({ type: "REMOVE_ITEM", itemId: "truffle-fries", quantity: item.quantity });
        proposedActions.push({ type: "ADD_ITEM", itemId: "quinoa-salad", quantity: item.quantity });
      }
    }
  } else if (text.includes("budget") || text.includes("under") || text.includes("limit") || text.includes("cheap")) {
    userReply = "Rest assured, I am prioritizing our high-value house sides and beverages to align with your financial limit! What target would you like to set?";
    explanation = "Budget constraints handled.";
  } else {
    // General conversational query matching
    userReply = "Greetings! I am BistroMind, your intelligent Maitre d'. Tell me whatever you're craving (e.g. 'Add two chicken sandwiches and a mineral water' or 'Make my cart vegetarian') and watch me instantly customize your order!";
  }

  return {
    message: userReply,
    proposedActions,
    explanation,
    isMock: true,
    modelUsed: "Offline Rule Engine"
  };
}

// API: Process Order using Gemini / Fallback
app.post("/api/ai/order", async (req, res) => {
  const { message, cart = [], profile } = req.body;
  const startTime = Date.now();

  try {
    const ai = getGeminiClient();

    // Context formatting for Gemini
    const menuContext = MENU.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      category: item.category,
      tags: item.tags,
      calories: item.calories,
      protein: item.protein,
      customifiers: item.modifiers || []
    }));

    const cartContext = cart.map((item: any) => ({
      itemId: item.menuItem.id,
      name: item.menuItem.name,
      quantity: item.quantity,
      selectedModifiers: item.selectedModifiers
    }));

    const systemPrompt = `You are \"BistroMind\", an ultra-premium, witty, and extremely intelligent AI head waiter and Maitre d' at a high-end gourmet restaurant called \"The Intelligent Bistro\".
Your primary mission is to listen to the user's natural language requests in English, compute their gastronomic ordering intent, verify constraints dynamically, and output standard, highly-cohesive cart actions as well as a charming server-side response.

You MUST always output valid JSON adhering strictly to this schema:
{
  "message": "Write a highly polished, friendly, and gourmet-styled waiter response acknowledging the cart changes, advising on choices, warning about allergy constraints, or describing custom adjustments. Mention item price tags and details in conversational prose.",
  "explanation": "A sentence explaining your logic (e.g., matching allergy flags, swap logic applied, budget constraints checked).",
  "proposedActions": [
    {
      "type": "ADD_ITEM" | "REMOVE_ITEM" | "MODIFY_ITEM" | "CLEAR_CART",
      "itemId": "id of the item mapped from the menu",
      "quantity": 1, // positive integer of the targeted change or set target
      "modifiers": { "Modifier Name": "Chosen Option" } // Must map neatly to the item's available modifiers
    }
  ]
}

Available Restaurant Menu to strictly map database ids:
${JSON.stringify(menuContext, null, 2)}

Active User Shopping Cart (Current State):
${JSON.stringify(cartContext, null, 2)}

User Taste Profile & Safety Settings:
${JSON.stringify(profile, null, 2)}

CRITICAL LOGIC RULES TO APPLY DYNAMICALLY:
1. ALLERGIES: Scan UserProfile.allergies. If an allergy exists (e.g., \"peanuts\", \"nuts\") and the user asks to add something containing that allergen (like \"lava-cake\" because of pistachio dust / walnut extracts, tagged with \"contains-nuts\"), DO NOT add the item! Instead, set proposedActions to [] (empty) and return a polite, catering alert in \"message\" explaining that you can't allow it for their safety, and suggest a delicious, safe alternative (e.g., our nut-free Heirloom Raspberry Mousse).
2. DIETARY PREFERENCES: If UserProfile.diet is \"veg\" or \"vegan\", and they say "Get me a chicken sandwich" or "Surprise me with a meal", do not add meat! Rather, guide them to of our vegetarian/vegan masterpieces (like Paneer Tikka or Buddha Bowl) and ask if they would like that added instead. If they explicitly request a vegetarian upgrade (\"Make my order vegetarian\"), look closely at non-veg items currently in their active cart, and generate REMOVE_ITEM actions for the meat items and corresponding ADD_ITEM actions for vegetarian equivalents (e.g., replace chicken with paneer-tikka; salmon with buddha-bowl) with high flair!
3. BUDGET: If UserProfile.budget is set (e.g., $30), calculate the running cost. If a requested order pushes them past their financial threshold, gently warn them in the \"message\", and offer practical, delicious budget advice (e.g. swap a high-priced item for a lighter side or a delicious beverage like kombucha).
4. MODIFIERS: Carefully extract custom attributes like spice levels (\"Fire Breathing\", \"Nashville Hot\", \"Medium\", \"Mild\") and sizes. Match them directly to the provided customizable keys for those product records.
5. CONVERSATIONAL HUMOR: Maintain an absolute five-star Michelin hospitality vocabulary. Speak of aromatic roasted flavors, gold dust, volcanic volcanic flows, etc.
6. Return only standard JSON. Double check you match our exact string fields and actions arrays. Make sure there are zero Markdown wrappers inside your JSON text itself.`;

    const chatSession = ai.chats.create({
      model: "gemini-3.5-flash",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            message: { type: Type.STRING },
            explanation: { type: Type.STRING },
            proposedActions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING, enum: ["ADD_ITEM", "REMOVE_ITEM", "MODIFY_ITEM", "CLEAR_CART"] },
                  itemId: { type: Type.STRING },
                  quantity: { type: Type.INTEGER },
                  modifiers: {
                    type: Type.OBJECT,
                    description: "Key-value pair of selected modifiers"
                  }
                },
                required: ["type"]
              }
            }
          },
          required: ["message", "explanation", "proposedActions"]
        }
      }
    });

    const response = await chatSession.sendMessage({ message: `The user input is: "${message}"` });
    const parsedText = response.text.trim();
    const resultObj = JSON.parse(parsedText);

    res.json({
      message: resultObj.message,
      proposedActions: resultObj.proposedActions || [],
      explanation: resultObj.explanation || "",
      isMock: false,
      modelUsed: "Gemini 3.5 Flash",
      latencyMs: Date.now() - startTime
    });

  } catch (error: any) {
    console.error("CRITICAL Gemini API Call Failure:", error);
    if (error.stack) {
      console.error(error.stack);
    }
    console.warn("Gemini execution hit an error, running robust mock intelligence fallback...", error.message);
    const mockResult = runFallbackMockParser(message, cart, profile);
    res.json({
      ...mockResult,
      latencyMs: Date.now() - startTime
    });
  }
});

// Serve frontend build static files in production / use Vite in development
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting in DEVELOPMENT mode with Vite Hot Reload Proxy...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);

    // Serve index.html dynamically in development mode with hot-reloading support
    app.use("*", async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = fs.readFileSync(path.join(process.cwd(), "index.html"), "utf-8");
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    console.log("Starting in PRODUCTION mode. Serving pre-compiled static files...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`BistroMind Server active and running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
