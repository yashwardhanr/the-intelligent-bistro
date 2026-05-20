const MENU = [
  {
    id: "nashville-chicken",
    name: "Nashville Heat Chicken Sandwich",
    price: 14.50,
    description: "Crispy cayenne-dipped chicken breast, stacked with double-brined sweet pickles and creamy house-made herb slaw on a toasted buttered brioche bun.",
    category: "Main Course",
    image: "https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?auto=format&fit=crop&w=600&q=80",
    tags: ["non-veg", "spicy", "high-protein"],
    calories: 680,
    protein: 34,
    prepTime: 12,
    modifiers: [
      { name: "Spice Level", options: ["Mild", "Medium", "Nashville Hot", "Fire Breathing"], defaultOption: "Nashville Hot" },
      { name: "Add Extras", options: ["None", "Extra Pickles", "Melted Cheddar (+ $1.50)"], defaultOption: "None" }
    ]
  },
  {
    id: "paneer-tikka",
    name: "Charcoal Grilled Paneer Tikka",
    price: 12.00,
    description: "House-crafted cottage cheese cubes marinated in heirloom yogurt and double-ground spices, clay-oven roasted with bell peppers and drizzled with mint-coriander emulsion.",
    category: "Starters",
    image: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=600&q=80",
    tags: ["veg", "gluten-free", "spicy", "high-protein"],
    calories: 420,
    protein: 22,
    prepTime: 15,
    modifiers: [
      { name: "Spice", options: ["Mild", "Regular Spice", "Fiery Tikka"], defaultOption: "Regular Spice" }
    ]
  },
  {
    id: "mushroom-risotto",
    name: "Wild Mushroom & Truffle Risotto",
    price: 18.50,
    description: "Slow-simmered Arborio rice bound with dark forest porcini paste, finished with shaved black truffles, Parmigiano-Reggiano, and organic cold-pressed olive oil.",
    category: "Main Course",
    image: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?auto=format&fit=crop&w=600&q=80",
    tags: ["veg", "gluten-free", "healthy"],
    calories: 510,
    protein: 12,
    prepTime: 18
  },
  {
    id: "salmon-poke",
    name: "Pacific Smoked Salmon Poke Bowl",
    price: 16.50,
    description: "Sashimi-grade naturally smoked wild salmon, warm premium vinegar rice, edamame beans, ribboned cucumbers, pickled ginger, fresh ginger-sesame dressing, and avocado slices.",
    category: "Main Course",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80",
    tags: ["non-veg", "healthy", "high-protein"],
    calories: 480,
    protein: 28,
    prepTime: 10
  },
  {
    id: "buddha-bowl",
    name: "Vegan Radiant Buddha Bowl",
    price: 13.50,
    description: "Crispy maple-chili baked chickpeas, tri-color quinoa seed beds, shredded ruby kale, roasted sweet potato wedges, topped with an organic creamy garlic tahini swirl.",
    category: "Main Course",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80",
    tags: ["veg", "vegan", "healthy", "gluten-free"],
    calories: 390,
    protein: 14,
    prepTime: 8,
    modifiers: [
      { name: "Grain Base", options: ["Tri-color Quinoa", "Brown Jasmine Rice"], defaultOption: "Tri-color Quinoa" }
    ]
  },
  {
    id: "avocado-tempura",
    name: "Crispy Avocado Tempura Bites",
    price: 9.50,
    description: "Slices of perfectly ripe Haas avocados dipped in sparkling-water light tempura batter, crispy fried and seasoned with mild Togarashi, served with sriracha-soy dip.",
    category: "Starters",
    image: "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=600&q=80",
    tags: ["veg", "vegan", "spicy"],
    calories: 310,
    protein: 4,
    prepTime: 8
  },
  {
    id: "truffle-fries",
    name: "Truffle Parmesan Duck-fat Fries",
    price: 8.50,
    description: "Hand-cut organic Idaho potatoes twice cooked to absolute golden crisp, tossed in real white truffle essence, fine sea salt, and aged finely grated Pecorino Romano.",
    category: "Sides",
    image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&q=80",
    tags: ["veg", "gluten-free"],
    calories: 380,
    protein: 6,
    prepTime: 6,
    modifiers: [
      { name: "Fat Base", options: ["Duck Fat (Crispiest)", "Vegetable Oil (Plant-Based)"], defaultOption: "Duck Fat (Crispiest)" }
    ]
  },
  {
    id: "quinoa-salad",
    name: "Quinoa Orchard Garden Salad",
    price: 7.50,
    description: "Fluffy white quinoa grains, organic hydroponic baby kale leaves, compressed apples, dried cranberries, and slivered supreme almonds dressed in cider vinaigrette.",
    category: "Sides",
    image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=85",
    tags: ["veg", "vegan", "healthy", "gluten-free", "contains-nuts"],
    calories: 220,
    protein: 7,
    prepTime: 5
  },
  {
    id: "lava-cake",
    name: "Belgium Chocolate Lava Fondant",
    price: 9.00,
    description: "Intense single-origin 72% dark chocolate cake baked with a liquid ganache center, finished with powdered gold dust and dynamic wild saffron-passionfruit syrup glaze.",
    category: "Desserts",
    image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80",
    tags: ["veg"],
    calories: 450,
    protein: 5,
    prepTime: 10
  },
  {
    id: "raspberry-mousse",
    name: "Heirloom Chocolate Raspberry Mousse",
    price: 8.50,
    description: "Whisper-light aerated dark avocado-cocoa cream whipped with natural madagascar vanilla, spooned over a dynamic organic fresh raspberry compote bed.",
    category: "Desserts",
    image: "https://images.unsplash.com/photo-1541795795328-f073b763494e?auto=format&fit=crop&w=600&q=80",
    tags: ["veg", "vegan", "healthy", "gluten-free"],
    calories: 260,
    protein: 3,
    prepTime: 4
  },
  {
    id: "hibiscus-kombucha",
    name: "Sparkling Lavender Hibiscus Kombucha",
    price: 5.50,
    description: "Naturally active effervescent house-brewed tea, secondary fermented with cold-pressed organic red hibiscus petals and fresh lavender sprigs.",
    category: "Beverages",
    image: "https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&w=600&q=80",
    tags: ["veg", "vegan", "healthy"],
    calories: 45,
    protein: 0,
    prepTime: 2
  },
  {
    id: "creme-cold-brew",
    name: "Saffron Spiced Cream Cold Brew",
    price: 6.00,
    description: "24-hour steeped single-estate dark roast, topped with a velvety layer of sweet milk foam infused with Kashmiri saffron threads and green cardamom powder.",
    category: "Beverages",
    image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=600&q=80",
    tags: ["veg", "spicy"],
    calories: 140,
    protein: 2,
    prepTime: 3
  },
  {
    id: "mineral-water",
    name: "Antarctica Glacial Flow Water",
    price: 3.50,
    description: "Pre-Ice-Age pure volcanic aquifer water naturally rich in silica and electrolytes, double-chilled and served in glass stemware with freshly sliced garden lime.",
    category: "Beverages",
    image: "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?auto=format&fit=crop&w=600&q=80",
    tags: ["veg", "vegan", "healthy"],
    calories: 0,
    protein: 0,
    prepTime: 1,
    modifiers: [
      { name: "Serving Style", options: ["Chilled with Lime", "Room Temperature with Mint", "Sparkling Effervescent"], defaultOption: "Chilled with Lime" }
    ]
  },
  {
    id: "crispy-tofu-baos",
    name: "Golden Sesame Tofu Baos",
    price: 11.00,
    description: "Mini soft pillowy steamed buns stuffed with golden crispy organic tofu, quick-pickled daikon, sliced carrots, and a drizzle of rich spicy hoisin peanut glaze.",
    category: "Starters",
    image: "https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?auto=format&fit=crop&w=600&q=80",
    tags: ["veg", "vegan", "spicy", "contains-nuts"],
    calories: 340,
    protein: 12,
    prepTime: 10
  },
  {
    id: "lamb-sheekh",
    name: "Clay-Oven Lamb Sheekh Kebab",
    price: 13.50,
    description: "Spiced minced farm-raised lamb blended with fresh mint, minced garlic, organic ginger, and ground garam masala roasted to juicy perfection in our clay oven.",
    category: "Starters",
    image: "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?auto=format&fit=crop&w=600&q=80",
    tags: ["non-veg", "high-protein", "spicy"],
    calories: 410,
    protein: 26,
    prepTime: 12,
    modifiers: [
      { name: "Yogurt Dip", options: ["Mint Chutney", "Fiery Garlic Mayo"], defaultOption: "Mint Chutney" }
    ]
  },
  {
    id: "beef-tenderloin",
    name: "Truffle Glazed Beef Tenderloin",
    price: 29.00,
    description: "Grass-fed beef tenderloin medallion seared with compound herb butter, resting on a bed of roasted garlic potato purée and buttered asparagus spears.",
    category: "Main Course",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80",
    tags: ["non-veg", "high-protein", "gluten-free"],
    calories: 710,
    protein: 42,
    prepTime: 20,
    modifiers: [
      { name: "Doneness", options: ["Rare", "Medium Rare", "Medium", "Well Done"], defaultOption: "Medium Rare" }
    ]
  },
  {
    id: "jackfruit-biryani",
    name: "Heritage Jackfruit Dum Biryani",
    price: 15.00,
    description: "Indulgent saffron-infused aged basmati rice slow-smoked 'dum' style with rich marinated baby jackfruit, caramelized sweet red onions, and fresh mint leaves.",
    category: "Main Course",
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80",
    tags: ["veg", "gluten-free", "spicy"],
    calories: 520,
    protein: 9,
    prepTime: 15
  },
  {
    id: "mango-sticky-rice",
    name: "Sweet Coconut Mango Sticky Rice",
    price: 8.00,
    description: "Aromatic warm sweet glutinous rice steamed in thick organic coconut milk, plated with freshly sliced ripe honey mangoes and toasted sesame seeds.",
    category: "Desserts",
    image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80",
    tags: ["veg", "vegan", "gluten-free"],
    calories: 340,
    protein: 4,
    prepTime: 6
  },
  {
    id: "kyoto-matcha-tiramisu",
    name: "Uji Matcha Tiramisu",
    price: 10.00,
    description: "Espresso-subbed ladyfingers soaked in ceremonial grade organic Kyoto matcha, layered with double-whipped vanilla bean mascarpone and light dustings of matcha.",
    category: "Desserts",
    image: "https://images.unsplash.com/photo-1536680465769-2365207b035e?auto=format&fit=crop&w=600&q=80",
    tags: ["veg"],
    calories: 320,
    protein: 5,
    prepTime: 5
  }
];

module.exports = { MENU };
