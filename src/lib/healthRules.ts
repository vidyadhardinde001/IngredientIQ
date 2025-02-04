// Defines health rules for different conditions
export const healthRules = {
    diabetes: {
      maxSugarPer100g: 10,
      maxCarbsPer100g: 30,
      avoidIngredients: ["sugar", "corn syrup"]
    },
    heart: {
      maxSaturatedFatPer100g: 2,
      maxSodiumPer100g: 200,
      avoidIngredients: ["palm oil", "hydrogenated fat"]
    },
    gluten: {
      avoidIngredients: ["wheat", "barley", "rye"]
    },
    // Add more conditions as needed
  };
  
  export type HealthCondition = keyof typeof healthRules;