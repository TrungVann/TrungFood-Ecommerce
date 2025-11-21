import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const initializeSiteConfig = async () => {
  try {
    const existingConfig = await prisma.site_config.findFirst();

    if (!existingConfig) {
      await prisma.site_config.create({
        data: {
          categories: [
            "Main dishes",
            "Snacks",
            "Desserts",
            "Drinks",
            "Fast food",
            "Healthy food",
            "Vegetarian",
          ],
          subCategories: {
            "Main dishes": [
              "Rice dishes",
              "Noodle dishes",
              "Pasta",
              "Soup",
              "Stew",
              "Grilled dishes",
              "Seafood dishes",
              "Meat dishes",
            ],
            Snacks: [
              "Chips",
              "Nuts",
              "Street food",
              "Finger food",
              "Pastries",
              "Fried snacks",
            ],
            Desserts: [
              "Cakes",
              "Cookies",
              "Ice cream",
              "Pudding",
              "Pastries",
              "Sweet soups",
            ],
            Drinks: [
              "Tea",
              "Coffee",
              "Juice",
              "Smoothies",
              "Soft drinks",
              "Milk tea",
            ],
            "Fast food": [
              "Burgers",
              "Fried chicken",
              "Pizza",
              "Hot dogs",
              "Fries",
              "Tacos",
            ],
            "Healthy food": [
              "Salads",
              "Low-carb meals",
              "High-protein meals",
              "Vegan bowls",
              "Smoothie bowls",
              "Whole grains",
            ],
            Vegetarian: [
              "Vegetarian noodles",
              "Vegetarian rice dishes",
              "Vegetarian soups",
              "Tofu dishes",
              "Vegetable stir-fry",
              "Plant-based meat dishes",
            ],
          },
        },
      });
    }

    
  } catch (error) {
    console.log("Error initializing site config: ", error)
  }
};

export default initializeSiteConfig;