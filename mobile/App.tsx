import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
  SafeAreaView,
  Platform,
  ActivityIndicator,
  KeyboardAvoidingView,
  StatusBar,
  Alert
} from "react-native";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { MENU } from "./menu";
import { UserProfile, CartItem, MenuItem, SelectedModifiers, AIChatMessage, AIAction } from "./types";

export default function App() {
  const chatScrollRef = useRef<ScrollView | null>(null);

  // Navigation tabs: "menu" | "chat" | "tray" | "settings"
  const [currentTab, setCurrentTab] = useState<"menu" | "chat" | "tray" | "settings">("menu");

  // Backend connection settings
  const [backendUrl, setBackendUrl] = useState<string>("http://localhost:4000"); // Standard fallback, can change to local IP (e.g. http://192.168.1.xx:4000)

  // Gastronomical user profile
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
      text: "Greetings! I am BistroMind, your Michelin hospitality AI assistant. Tell me whatever you are craving, specify any dietary rules, and watch me customize your gourmet tray!",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }
  ]);

  const [inputText, setInputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  // Auto-recommend a special dish if user filters/profile updates to veggie
  useEffect(() => {
    if (profile.diet === "veg") {
      setMessages(prev => [
        ...prev,
        {
          id: `diet-alert-${Date.now()}`,
          sender: "assistant",
          text: `Chef ${profile.preferredName}, since you upgraded to strict Vegetarian, I heavily recommend trying our Clay-Oven roasted Paneer Tikka or our fresh quinoa avocado bowls. Just tell me to "Add two Paneer Tikka"!`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    }
  }, [profile.diet]);

  // Handle adding custom items to the tray
  const handleAddItem = (item: MenuItem, modifiers: SelectedModifiers = {}, quantity: number = 1) => {
    setCart(prev => {
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

    setProfile(p => ({ ...p, loyaltyPoints: p.loyaltyPoints + 15 }));
    Alert.alert("Gourmet Tray Updated", `${quantity}x ${item.name} added safely.`);
  };

  // Adjust portion quantities from My Tray tab
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
    Alert.alert("Tray Reset", "Your tray has been completely cleared.");
  };

  // REST API Caller to Node process
  const handleSendMessage = async () => {
    if (!inputText.trim()) return;
    const originalText = inputText;
    setInputText("");

    const userMsg: AIChatMessage = {
      id: `user-msg-${Date.now()}`,
      sender: "user",
      text: originalText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages(prev => [...prev, userMsg]);
    setIsProcessing(true);

    try {
      const response = await fetch(`${backendUrl}/api/ai/order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: originalText,
          cart: cart,
          profile: profile
        })
      });

      if (!response.ok) {
        throw new Error("HTTP connection check failed.");
      }

      const data = await response.json();

      const assistantMsg: AIChatMessage = {
        id: `assistant-msg-${Date.now()}`,
        sender: "assistant",
        text: data.message,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        proposedActions: data.proposedActions || [],
        logs: {
          model: data.modelUsed || "Gemini 3.5 Flash",
          rawResponse: JSON.stringify(data.proposedActions),
          latencyMs: data.latencyMs || 150,
          explanation: data.explanation || ""
        }
      };

      setMessages(prev => [...prev, assistantMsg]);

      // If proposed actions are present, offer user to auto apply
      if (data.proposedActions && data.proposedActions.length > 0) {
        handleApplyAIChanges(data.proposedActions);
      }

    } catch (err) {
      console.warn("Express backend connection caught an error:", err);
      // Construct fallback offline message locally
      const mockResponse = runLocalOfflineFallback(originalText);
      const offlineMsg: AIChatMessage = {
        id: `offline-msg-${Date.now()}`,
        sender: "assistant",
        text: mockResponse.message,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        proposedActions: mockResponse.proposedActions
      };
      setMessages(prev => [...prev, offlineMsg]);
      if (mockResponse.proposedActions && mockResponse.proposedActions.length > 0) {
        handleApplyAIChanges(mockResponse.proposedActions);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Local Offline Rule Engine inside Mobile App for Offline Resiliency
  const runLocalOfflineFallback = (text: string) => {
    const lower = text.toLowerCase();
    const proposedActions: AIAction[] = [];
    let message = "I am serving you in high-fidelity offline mode directly from our native smartphone logic!";

    if (lower.includes("add") || lower.includes("want") || lower.includes("get")) {
      if (lower.includes("chicken")) {
        proposedActions.push({ type: "ADD_ITEM", itemId: "nashville-chicken", quantity: 1, modifiers: { "Spice Level": "Nashville Hot" } });
        message = "Added 1x Nashville Heat Chicken Sandwich with authentic Nashville spice levels to your tray!";
      } else if (lower.includes("paneer") || lower.includes("tikka")) {
        proposedActions.push({ type: "ADD_ITEM", itemId: "paneer-tikka", quantity: 1 });
        message = "Added 1x Clay-oven Roasted Paneer Tikka. Seasoned to medium-high standard.";
      } else if (lower.includes("fries") || lower.includes("potato")) {
        proposedActions.push({ type: "ADD_ITEM", itemId: "truffle-fries", quantity: 1 });
        message = "One portion of Truffle Parmesan Fries has been placed on your tray.";
      } else if (lower.includes("water") || lower.includes("glacial")) {
        proposedActions.push({ type: "ADD_ITEM", itemId: "mineral-water", quantity: 1 });
        message = "Antarctica Glacial Flow volcanic water added. Served chilled with fresh lime slices.";
      } else {
        message = "I didn't quite catch which dish you wanted. Try asking for our 'chicken sandwich', 'paneer tikka', or 'truffle fries'!";
      }
    } else if (lower.includes("clear") || lower.includes("empty")) {
      proposedActions.push({ type: "CLEAR_CART" });
      message = "Your active tray is clear. What gourmet dishes can I queue next?";
    }

    return { message, proposedActions };
  };

  // Apply proposed changes from Gemini agent
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
      } else if (act.type === "CLEAR_CART") {
        setCart([]);
      }
    });
  };

  // Filter menu items based on category and search tags
  const filteredMenu = MENU.filter(item => {
    if (selectedCategory !== "All" && item.category !== selectedCategory) return false;
    if (profile.diet === "veg" && !item.tags.includes("veg")) return false;
    if (profile.diet === "vegan" && !item.tags.includes("vegan")) return false;
    if (profile.diet === "gluten-free" && !item.tags.includes("gluten-free")) return false;
    return true;
  });

  const totalCartCost = cart.reduce((acc, curr) => acc + (curr.menuItem.price * curr.quantity), 0);
  const totalCartItems = cart.reduce((acc, curr) => acc + curr.quantity, 0);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ExpoStatusBar style="dark" />
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleGroup}>
          <Ionicons name="restaurant-outline" size={24} color="#4F46E5" />
          <View style={styles.headerTextGroup}>
            <Text style={styles.headerTitle}>BISTROMIND MOBILE</Text>
            <Text style={styles.headerSubtitle}>Table #4 • VIP Lounge</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.pointsBadge} onPress={() => setCurrentTab("settings")}>
          <Ionicons name="ribbon" size={16} color="#4F46E5" />
          <Text style={styles.pointsText}>{profile.loyaltyPoints} pts</Text>
        </TouchableOpacity>
      </View>

      {/* Main Container */}
      <View style={styles.body}>
        {/* TAB 1: MENU CATALOUGE */}
        {currentTab === "menu" && (
          <View style={styles.tabContainer}>
            {/* Quick Filter Section */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
              {["All", "Starters", "Main Course", "Desserts", "Beverages", "Sides"].map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.catButton, selectedCategory === cat && styles.catButtonActive]}
                  onPress={() => setSelectedCategory(cat)}
                >
                  <Text style={[styles.catButtonText, selectedCategory === cat && styles.catButtonTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* List structure */}
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.listPadding}>
              {filteredMenu.map(item => (
                <View key={item.id} style={styles.foodCard}>
                  <Image source={{ uri: item.image }} style={styles.foodImage} />
                  <View style={styles.foodDetails}>
                    <View style={styles.foodHeader}>
                      <Text style={styles.foodName}>{item.name}</Text>
                      <Text style={styles.foodPrice}>${item.price.toFixed(2)}</Text>
                    </View>
                    <Text style={styles.foodDesc} numberOfLines={2}>{item.description}</Text>
                    
                    <View style={styles.foodStats}>
                      <View style={styles.statChip}>
                        <Ionicons name="flame-outline" size={10} color="#64748B" />
                        <Text style={styles.statText}>{item.calories} kcal</Text>
                      </View>
                      <View style={styles.statChip}>
                        <Ionicons name="time-outline" size={10} color="#64748B" />
                        <Text style={styles.statText}>{item.prepTime}m</Text>
                      </View>
                      {item.tags.includes("veg") && (
                        <View style={[styles.statChip, styles.vegChip]}>
                          <Text style={styles.vegChipText}>VEG</Text>
                        </View>
                      )}
                    </View>

                    <TouchableOpacity style={styles.addButton} onPress={() => handleAddItem(item)}>
                      <Ionicons name="add" size={16} color="#FFFFFF" />
                      <Text style={styles.addButtonText}>Add to Tray</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* TAB 2: AI MAITRE D VOICE & CHAT ASSISTANT */}
        {currentTab === "chat" && (
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
            style={styles.tabContainer}
          >
            <ScrollView 
              style={styles.chatScrollView}
              contentContainerStyle={styles.chatContent}
              ref={chatScrollRef}
              onContentSizeChange={() => chatScrollRef.current?.scrollToEnd({ animated: true })}
            >
              {messages.map((msg) => (
                <View key={msg.id} style={[styles.msgWrapper, msg.sender === "user" ? styles.msgWrapperUser : styles.msgWrapperAssistant]}>
                  {msg.sender === "assistant" && (
                    <View style={styles.botAvatar}>
                      <Ionicons name="sparkles" size={14} color="#FFF" />
                    </View>
                  )}
                  <View style={[styles.bubble, msg.sender === "user" ? styles.bubbleUser : styles.bubbleAssistant]}>
                    <Text style={msg.sender === "user" ? styles.msgTextUser : styles.msgTextAssistant}>
                      {msg.text}
                    </Text>
                    <Text style={styles.msgTime}>{msg.timestamp}</Text>
                  </View>
                </View>
              ))}
              {isProcessing && (
                <View style={styles.loadingBubbleRow}>
                  <View style={[styles.bubble, styles.bubbleAssistant, styles.loadingBubble]}>
                    <ActivityIndicator size="small" color="#4F46E5" />
                    <Text style={styles.loadingText}>BistroMind is drafting response...</Text>
                  </View>
                </View>
              )}
            </ScrollView>

            <View style={styles.chatInputRow}>
              <TextInput
                style={styles.input}
                placeholder="Ask for custom orders, vegan options..."
                placeholderTextColor="#94A3B8"
                value={inputText}
                onChangeText={setInputText}
              />
              <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
                <Ionicons name="send" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        )}

        {/* TAB 3: MY TRAY */}
        {currentTab === "tray" && (
          <View style={styles.tabContainer}>
            <View style={styles.trayHeader}>
              <Text style={styles.trayTitle}>Your Selected Tray</Text>
              {cart.length > 0 && (
                <TouchableOpacity onPress={handleClearCart}>
                  <Text style={styles.clearCartText}>Clear All</Text>
                </TouchableOpacity>
              )}
            </View>

            {cart.length === 0 ? (
              <View style={styles.emptyTrayView}>
                <Ionicons name="basket-outline" size={48} color="#CBD5E1" />
                <Text style={styles.emptyTrayHeading}>Your tray is clean</Text>
                <Text style={styles.emptyTrayBody}>Add signature dishes from the menu or utilize our AI Maitre D to craft customized gastronomic plates.</Text>
                <TouchableOpacity style={styles.browseButton} onPress={() => setCurrentTab("menu")}>
                  <Text style={styles.browseButtonText}>Explore Gourmet Craft</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={{ flex: 1 }}>
                <ScrollView style={styles.trayItemScroll}>
                  {cart.map((item) => (
                    <View key={item.key} style={styles.trayItemCard}>
                      <Image source={{ uri: item.menuItem.image }} style={styles.trayItemImage} />
                      <View style={styles.trayItemMeta}>
                        <Text style={styles.trayItemName}>{item.menuItem.name}</Text>
                        <Text style={styles.trayItemPrice}>${(item.menuItem.price * item.quantity).toFixed(2)}</Text>
                        
                        <View style={styles.qtyEngine}>
                          <TouchableOpacity style={styles.qtyBtn} onPress={() => handleUpdateQty(item.key, -1)}>
                            <Ionicons name="remove" size={14} color="#475569" />
                          </TouchableOpacity>
                          <Text style={styles.qtyVal}>{item.quantity}</Text>
                          <TouchableOpacity style={styles.qtyBtn} onPress={() => handleUpdateQty(item.key, 1)}>
                            <Ionicons name="add" size={14} color="#475569" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  ))}
                </ScrollView>

                {/* Receipt summary */}
                <View style={styles.billBox}>
                  <View style={styles.billRow}>
                    <Text style={styles.billLabel}>Gourmet Total</Text>
                    <Text style={styles.billValue}>${totalCartCost.toFixed(2)}</Text>
                  </View>
                  <View style={styles.billRow}>
                    <Text style={styles.billLabel}>Points Earned</Text>
                    <Text style={[styles.billValue, { color: "#10B981" }]}>+{totalCartItems * 15} loyalty</Text>
                  </View>

                  <TouchableOpacity style={styles.checkoutBtn} onPress={() => Alert.alert("Fine Dining Ordered!", "Your order has been safely transmitted to the kitchen. Chef Yashwardhan is preparing your meal.")}>
                    <Text style={styles.checkoutBtnText}>Transmit to Kitchen</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        )}

        {/* TAB 4: PROFILE & CONNECTION SETTINGS */}
        {currentTab === "settings" && (
          <ScrollView style={styles.tabContainer} contentContainerStyle={styles.listPadding}>
            <Text style={styles.sectionHeading}>Taste Profile</Text>
            
            <View style={styles.settingsGroup}>
              <Text style={styles.settingsLabel}>Fine Dining Name</Text>
              <TextInput
                style={styles.settingInput}
                value={profile.preferredName}
                onChangeText={(val) => setProfile(p => ({ ...p, preferredName: val }))}
              />

              <Text style={styles.settingsLabel}>Diet Preferences</Text>
              <View style={styles.rowWrapper}>
                {[
                  { label: "Standard", val: "none" },
                  { label: "Vegetarian", val: "veg" },
                  { label: "Vegan", val: "vegan" }
                ].map((dietOpt) => (
                  <TouchableOpacity
                    key={dietOpt.val}
                    style={[styles.dietOptCard, profile.diet === dietOpt.val && styles.dietOptCardActive]}
                    onPress={() => setProfile(p => ({ ...p, diet: dietOpt.val as any }))}
                  >
                    <Text style={[styles.dietOptText, profile.diet === dietOpt.val && styles.dietOptTextActive]}>
                      {dietOpt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.settingsLabel}>Allergies Indicators</Text>
              <View style={styles.rowWrapper}>
                {[
                  { name: "Peanuts/Nuts", raw: "peanuts" },
                  { name: "Gluten Sensitivity", raw: "gluten" }
                ].map((alg) => {
                  const active = profile.allergies.includes(alg.raw);
                  return (
                    <TouchableOpacity
                      key={alg.raw}
                      style={[styles.dietOptCard, active && styles.dietOptCardDanger]}
                      onPress={() => setProfile(p => {
                        const next = active 
                          ? p.allergies.filter(a => a !== alg.raw) 
                          : [...p.allergies, alg.raw];
                        return { ...p, allergies: next };
                      })}
                    >
                      <Text style={[styles.dietOptText, active && styles.dietOptTextDanger]}>
                        {alg.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <Text style={styles.sectionHeading}>Backend Connection Server</Text>
            <View style={styles.settingsGroup}>
              <Text style={styles.settingsLabel}>Node.js Server URL Config</Text>
              <TextInput
                style={styles.settingInput}
                placeholder="e.g., http://192.168.1.50:4000"
                value={backendUrl}
                onChangeText={setBackendUrl}
              />
              <Text style={styles.connectionNote}>
                Connect to your local workstation running your backend so the phone app can trigger the live Gemini 3.5 engine on standard local environments.
              </Text>
            </View>
          </ScrollView>
        )}
      </View>

      {/* iOS styled Bottom Nav */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={[styles.navBtn, currentTab === "menu" && styles.navBtnActive]} onPress={() => setCurrentTab("menu")}>
          <Ionicons name="compass" size={20} color={currentTab === "menu" ? "#4F46E5" : "#94A3B8"} />
          <Text style={[styles.navText, currentTab === "menu" && styles.navTextActive]}>Cuisine</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.navBtn, currentTab === "chat" && styles.navBtnActive]} onPress={() => setCurrentTab("chat")}>
          <Ionicons name="sparkles" size={20} color={currentTab === "chat" ? "#4F46E5" : "#94A3B8"} />
          <Text style={[styles.navText, currentTab === "chat" && styles.navTextActive]}>AI Guest</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.navBtn, currentTab === "tray" && styles.navBtnActive]} onPress={() => setCurrentTab("tray")}>
          <View style={styles.badgeWrapper}>
            <Ionicons name="basket" size={20} color={currentTab === "tray" ? "#4F46E5" : "#94A3B8"} />
            {totalCartItems > 0 && <View style={styles.navBadge} />}
          </View>
          <Text style={[styles.navText, currentTab === "tray" && styles.navTextActive]}>Tray</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.navBtn, currentTab === "settings" && styles.navBtnActive]} onPress={() => setCurrentTab("settings")}>
          <Ionicons name="options" size={20} color={currentTab === "settings" ? "#4F46E5" : "#94A3B8"} />
          <Text style={[styles.navText, currentTab === "settings" && styles.navTextActive]}>Settings</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  header: {
    height: 56,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  headerTitleGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTextGroup: {
    marginLeft: 8,
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: "#0F172A",
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 9,
    color: "#64748B",
    marginTop: 1,
  },
  pointsBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EEF2F6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  pointsText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#4F46E5",
    marginLeft: 4,
  },
  body: {
    flex: 1,
  },
  tabContainer: {
    flex: 1,
  },
  categoriesScroll: {
    maxHeight: 48,
    backgroundColor: "#FFFFFF",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  catButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#F1F5F9",
    marginRight: 8,
    height: 28,
    justifyContent: "center",
  },
  catButtonActive: {
    backgroundColor: "#4F46E5",
  },
  catButtonText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#475569",
  },
  catButtonTextActive: {
    color: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
  },
  listPadding: {
    padding: 16,
  },
  foodCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 16,
    flexDirection: "row",
    overflow: "hidden",
    padding: 12,
  },
  foodImage: {
    width: 84,
    height: 84,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
  },
  foodDetails: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "space-between",
  },
  foodHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  foodName: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#1E293B",
    flex: 1,
    marginRight: 4,
  },
  foodPrice: {
    fontSize: 12,
    fontWeight: "800",
    color: "#4F46E5",
  },
  foodDesc: {
    fontSize: 9.5,
    color: "#64748B",
    marginVertical: 4,
    lineHeight: 13,
  },
  foodStats: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  statChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 6,
  },
  statText: {
    fontSize: 8,
    color: "#64748B",
    marginLeft: 3,
    fontWeight: "500",
  },
  vegChip: {
    backgroundColor: "#ECFDF5",
    borderColor: "#A7F3D0",
    borderWidth: 0.5,
  },
  vegChipText: {
    fontSize: 8,
    color: "#10B981",
    fontWeight: "800",
  },
  addButton: {
    backgroundColor: "#4F46E5",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    borderRadius: 8,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
    marginLeft: 4,
  },
  chatScrollView: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  chatContent: {
    padding: 16,
  },
  msgWrapper: {
    flexDirection: "row",
    marginBottom: 16,
    maxWidth: "80%",
  },
  msgWrapperAssistant: {
    alignSelf: "flex-start",
  },
  msgWrapperUser: {
    alignSelf: "flex-end",
  },
  botAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#4F46E5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    marginTop: 2,
  },
  bubble: {
    borderRadius: 16,
    padding: 12,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  bubbleAssistant: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 4,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  bubbleUser: {
    backgroundColor: "#4F46E5",
    borderTopRightRadius: 4,
  },
  msgTextAssistant: {
    fontSize: 11,
    color: "#334155",
    lineHeight: 16,
  },
  msgTextUser: {
    fontSize: 11,
    color: "#FFFFFF",
    lineHeight: 16,
  },
  msgTime: {
    fontSize: 8,
    color: "#94A3B8",
    alignSelf: "flex-end",
    marginTop: 4,
  },
  loadingBubbleRow: {
    flexDirection: "row",
    marginBottom: 16,
  },
  loadingBubble: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  loadingText: {
    fontSize: 10,
    color: "#64748B",
  },
  chatInputRow: {
    height: 56,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingBottom: Platform.OS === "ios" ? 4 : 0,
  },
  input: {
    flex: 1,
    height: 38,
    backgroundColor: "#F1F5F9",
    borderRadius: 19,
    paddingHorizontal: 16,
    fontSize: 11,
    color: "#1E293B",
  },
  sendButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#4F46E5",
    marginLeft: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  trayHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  trayTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
  },
  clearCartText: {
    fontSize: 11,
    color: "#EF4444",
    fontWeight: "700",
  },
  emptyTrayView: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  emptyTrayHeading: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#475569",
    marginTop: 12,
  },
  emptyTrayBody: {
    fontSize: 10,
    color: "#94A3B8",
    textAlign: "center",
    marginTop: 6,
    lineHeight: 14,
  },
  browseButton: {
    backgroundColor: "#4F46E5",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 16,
  },
  browseButtonText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "bold",
  },
  trayItemScroll: {
    flex: 1,
    paddingHorizontal: 16,
  },
  trayItemCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 10,
    borderRadius: 12,
    marginBottom: 10,
  },
  trayItemImage: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: "#F1F5F9",
  },
  trayItemMeta: {
    flex: 1,
    marginLeft: 10,
    justifyContent: "space-between",
  },
  trayItemName: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#1E293B",
  },
  trayItemPrice: {
    fontSize: 10.5,
    fontWeight: "800",
    color: "#4F46E5",
  },
  qtyEngine: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    alignSelf: "flex-start",
    borderRadius: 6,
    padding: 2,
    marginTop: 4,
  },
  qtyBtn: {
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyVal: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#1E293B",
    paddingHorizontal: 8,
  },
  billBox: {
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    padding: 16,
    paddingBottom: Platform.OS === "ios" ? 22 : 16,
  },
  billRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  billLabel: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "500",
  },
  billValue: {
    fontSize: 11,
    color: "#0F172A",
    fontWeight: "800",
  },
  checkoutBtn: {
    backgroundColor: "#4F46E5",
    height: 42,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  checkoutBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: "900",
    color: "#64748B",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 8,
    marginTop: 12,
  },
  settingsGroup: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  settingsLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#475569",
    marginBottom: 6,
    marginTop: 4,
  },
  settingInput: {
    height: 36,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 11,
    color: "#1E293B",
    backgroundColor: "#F8FAFC",
  },
  rowWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginVertical: 4,
  },
  dietOptCard: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  dietOptCardActive: {
    backgroundColor: "#EEF2F6",
    borderColor: "#4F46E5",
  },
  dietOptCardDanger: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FCA5A5",
  },
  dietOptText: {
    fontSize: 9.5,
    fontWeight: "600",
    color: "#475569",
  },
  dietOptTextActive: {
    color: "#4F46E5",
    fontWeight: "bold",
  },
  dietOptTextDanger: {
    color: "#EF4444",
    fontWeight: "bold",
  },
  connectionNote: {
    fontSize: 8.5,
    color: "#94A3B8",
    lineHeight: 12,
    marginTop: 8,
  },
  bottomNav: {
    height: 54,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingBottom: 2,
  },
  navBtn: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  navBtnActive: {
    transform: [{ scale: 1.02 }],
  },
  navText: {
    fontSize: 8,
    color: "#94A3B8",
    marginTop: 3,
    fontWeight: "600",
  },
  navTextActive: {
    color: "#4F46E5",
    fontWeight: "bold",
  },
  badgeWrapper: {
    position: "relative",
  },
  navBadge: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#EF4444",
    position: "absolute",
    top: -2,
    right: -2,
  }
});
