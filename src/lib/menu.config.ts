export const menuConfig = {
  season: "Spring",
  accentColor: "#1B4F8A",
  specials: [
    {
      id: "orange-blossom-latte",
      name: "Orange Blossom Latte",
      description: "Smooth espresso with delicate orange blossom sweetness",
      temps: ["Hot", "Iced"],
      defaults: {
        base: "Espresso",
        milk: "Whole Milk",
        sweetener: "Orange Blossom",
        temperature: "Hot",
      },
    },
    {
      id: "rooh-afza-latte",
      name: "Rooh Afza Latte",
      description: "Floral rose latte topped with Rooh Afza cold foam",
      temps: ["Iced"],
      defaults: {
        base: "Espresso",
        milk: "Whole Milk",
        sweetener: "Rooh Afza",
        temperature: "Iced",
      },
    },
    {
      id: "bees-knees-matcha",
      name: "Bee's Knees Matcha",
      description: "Matcha kissed with honey, thyme, and lavender",
      temps: ["Hot", "Iced"],
      defaults: {
        base: "Matcha",
        milk: "Whole Milk",
        sweetener: "Bee's Knees",
        temperature: "Hot",
      },
    },
  ],
  buildYourOwn: {
    bases: ["Espresso", "Cold Brew", "Matcha"],
    milks: ["Whole Milk", "Oat Milk"],
    sweeteners: ["Vanilla", "Orange Blossom", "Bee's Knees", "Rooh Afza", "Cookie Dough"],
    temperatures: ["Hot", "Iced"],
  },
};
