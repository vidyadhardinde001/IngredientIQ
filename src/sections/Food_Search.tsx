"use client";

import React, { useState } from "react";
import { useEffect } from "react";

import axios from "axios";
import NutriScoreSection from "./Nutriscore";
import Link from "next/link";

import { healthRules, HealthCondition } from "@/lib/healthRules";

import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  CircularProgress,
  Divider,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { Bar } from "react-chartjs-2";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Chart as ChartJS,
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip as ChartTooltip,
  Legend,
} from "chart.js";


ChartJS.register(
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  ChartTooltip,
  Legend
);

const FoodSearch: React.FC = () => {
  const [barcode, setBarcode] = useState<string>("");
  const [productName, setProductName] = useState<string>("");
  const [foodDataList, setFoodDataList] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const [substitutes, setSubstitutes] = useState<any[]>([]);
  const [substituteLoading, setSubstituteLoading] = useState(false);
  const [healthData, setHealthData] = useState<{ 
    healthIssues: string[], 
    allergies: string[] 
  }>({ healthIssues: [], allergies: [] });

  useEffect(() => {
    const userHealthData = JSON.parse(localStorage.getItem("userHealthData") || "{}");
    setHealthData({
      healthIssues: userHealthData.healthIssues || [],
      allergies: userHealthData.allergies || []
    });
  }, [selectedProduct]); // Refresh when product changes

  // Enhanced product analysis and substitution logic
  const getProductCategory = (product: any) => {
    return product.categories_tags?.[0]?.replace(/en:/g, "") || "generic";
  };

  const hasAllergens = (product: any) => {
    return healthData.allergies.some(allergy => 
      product.ingredients_text?.toLowerCase().includes(allergy.toLowerCase())
    );
  };

  const isWidelyAvailable = (product: any) => {
    return (product.stores_tags?.length || 0) >= 3 && 
           (product.countries_tags?.length || 0) >= 2;
  };

  const isNutritionallyBetter = (product: any, originalProduct: any) => {
    const nutrition = product.nutriments || {};
    const originalNutrition = originalProduct.nutriments || {};

    return healthData.healthIssues.every(issue => {
      const condition = issue.toLowerCase() as HealthCondition;
      const rules = healthRules[condition] || {};

      // Sugar check
      if (rules.maxSugarPer100g) {
        const subSugar = Number(nutrition.sugars_100g) || 0;
        const origSugar = Number(originalNutrition.sugars_100g) || 0;
        return subSugar < Math.min(origSugar * 0.7, rules.maxSugarPer100g);
      }

      // Fat check
      if (rules.maxSaturatedFatPer100g) {
        const subFat = Number(nutrition.saturated_fat_100g) || 0;
        const origFat = Number(originalNutrition.saturated_fat_100g) || 0;
        return subFat < Math.min(origFat * 0.7, rules.maxSaturatedFatPer100g);
      }

      // Add more condition checks as needed
      return true;
    });
  };


  const findSubstitutes = async (originalProduct: any) => {
    setSubstituteLoading(true);
    try {
      const category = getProductCategory(originalProduct);
      const response = await axios.get(
        `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(category)}&json=1&sort_by=popularity&page_size=30`
      );

      const substitutes = response.data.products?.filter((product: any) => (
        product.code !== originalProduct.code &&
        !hasAllergens(product) &&
        isNutritionallyBetter(product, originalProduct) &&
        isWidelyAvailable(product)
      )).slice(0, 5) || [];

      setSubstitutes(substitutes);
    } catch (error) {
      console.error("Substitute search failed:", error);
    }
    setSubstituteLoading(false);
  };

  const analyzeProduct = (product: any) => {
    // const harmful: string[] = [];
    const warnings: string[] = [];
    const nutrition = product.nutriments || {};

    console.log("Full Product Data:", product); 

    console.log("User Health Data:", healthData); // Add this
    console.log("Product Nutrition:", nutrition); // Add this
  
    // Check for health issues
    healthData.healthIssues.forEach(issue => {
      const condition = issue.toLowerCase() as HealthCondition;
      const rules = healthRules[condition] || {};
  
      // Sugar check
      if (rules.maxSugarPer100g && (nutrition.sugars_100g || 0) > rules.maxSugarPer100g) {
        warnings.push(`low-sugar`);
      }
  
      // Fat check
      if (rules.maxSaturatedFatPer100g && (nutrition.saturated_fat_100g || 0) > rules.maxSaturatedFatPer100g) {
        warnings.push(`low-fat`);
      }
  
      // Add other checks
    });
  
    // Check for allergies
    healthData.allergies.forEach(allergy => {
      if (product.ingredients_text?.toLowerCase().includes(allergy.toLowerCase())) {
        warnings.push(`no-${allergy}`);
      }
    });
    console.log("Identified harmful components:", warnings);
  
    // return harmful.length > 0 ? harmful : [
    //   "healthy",
    //   "natural",
    //   "organic",
    //   "low-sugar",
    //   "low-fat"
    // ];
    return warnings;
  };

//   const isWidelyAvailable = (product: any) => {
//   return (product.stores_tags?.length || 0) >= 3 && // Available in 3+ store chains
//          (product.countries_tags?.length || 0) >= 2; // Available in 2+ countries
// };

  const isProductBetter = (product: any, harmfulComponents: string[]) => {
    const nutrition = product.nutriments || {};
    
    // Add null checks and fallback values
    const getSafeValue = (value: any) => Number(value) || 0;
  
    return harmfulComponents.every(component => {
      // For diabetes/sugar check
      if (component === "low-sugar") {
        const originalSugar = getSafeValue(selectedProduct.nutriments?.sugars_100g);
        const substituteSugar = getSafeValue(nutrition.sugars_100g);
        return substituteSugar < Math.max(originalSugar * 0.7, 10);
      }
  
      // For heart/fat check
      if (component === "low-fat") {
        return getSafeValue(nutrition.saturated_fat) < 5;
      }
  
      // For allergies
      if (component.startsWith("no-")) {
        const allergen = component.split("-")[1];
        return !product.ingredients_text?.toLowerCase().includes(allergen);
      }
  
      return true;
    });
  };

  const handleProductSelect = (product: any) => {
    setSelectedProduct(product);
    findSubstitutes(product);
  };

  

  // Update fetchFoodByBarcode function
const fetchFoodByBarcode = async () => {
  setLoading(true);
  setSelectedProduct(null);
  setError("");
  try {
    const response = await axios.get(
      `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`
    );
    
    if (response.data.status === 1 && response.data.product) {
      const product = response.data.product;
      setSelectedProduct(product);
      findSubstitutes(product); // Add this line
    } else {
      setError("Product not found.");
    }
  } catch (err) {
    setError("Failed to fetch data.");
  }
  setLoading(false);
};

  const fetchFoodByName = async () => {
    setLoading(true);
    setFoodDataList([]);
    setSelectedProduct(null);
    setError("");
    try {
      const response = await axios.get(
        `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${productName}&search_simple=1&json=1`
      );
      if (response.data.products && response.data.products.length > 0) {
        setFoodDataList(response.data.products);
      } else {
        setError("No products found.");
      }
    } catch (err) {
      setError("Failed to fetch data.");
    }
    setLoading(false);
  };

  const generateChartData = (
    labels: string[],
    values: number[],
    label: string
  ) => ({
    labels,
    datasets: [
      {
        label,
        data: values,
        backgroundColor: [
          "rgba(75, 192, 192, 0.2)",
          "rgba(255, 99, 132, 0.2)",
          "rgba(255, 206, 86, 0.2)",
          "rgba(153, 102, 255, 0.2)",
        ],
        borderColor: [
          "rgba(75, 192, 192, 1)",
          "rgba(255, 99, 132, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(153, 102, 255, 1)",
        ],
        borderWidth: 1,
      },
    ],
  });

  return (
    <Container sx={{ marginTop: "20px" }}>
      {/* Barcode Search */}
      <Box sx={{ marginBottom: "20px", textAlign: "center" }}>
        <input
          type="text"
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
          placeholder="Enter product barcode"
          style={{ padding: "10px", width: "300px", borderRadius: "4px" }}
        />
        <Button
          variant="contained"
          onClick={fetchFoodByBarcode}
          sx={{ marginLeft: "10px", padding: "10px 20px" }}
        >
          Search by Barcode
        </Button>
      </Box>

      {/* Product Name Search */}
      <Box sx={{ marginBottom: "20px", textAlign: "center" }}>
        <input
          type="text"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          placeholder="Enter product name"
          style={{ padding: "10px", width: "300px", borderRadius: "4px" }}
        />
        <Button
          variant="contained"
          onClick={fetchFoodByName}
          sx={{ marginLeft: "10px", padding: "10px 20px" }}
        >
          Search by Name
        </Button>
      </Box>

      {loading && <CircularProgress />}
      {error && <Typography color="error">{error}</Typography>}

      {/* Product List and Details */}
      {foodDataList.length > 0 && !selectedProduct && (
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <Box
              sx={{
                maxHeight: "400px",
                overflowY: "auto",
                padding: "10px",
                borderRight: "2px solid #ddd",
              }}
            >
              <List>
                {foodDataList.map((product, index) => (
                  <ListItem key={index} disablePadding>
                    <ListItemButton onClick={() => handleProductSelect(product)}>
                      <ListItemText
                        primary={product.product_name || "Unnamed Product"}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Box>
          </Grid>
          {selectedProduct && (
            <Grid item xs={12} sm={8}>
              <Card>
                <CardContent>
                  <Typography variant="h5">
                    {selectedProduct.product_name || "Product Name"}
                  </Typography>
                  <img
                    src={selectedProduct.image_url}
                    alt={selectedProduct.product_name}
                    style={{
                      width: "100%",
                      borderRadius: "8px",
                      marginTop: "10px",
                    }}
                  />
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    sx={{ marginTop: "10px" }}
                  >
                    Brand: {selectedProduct.brands || "N/A"}
                  </Typography>
                  <Chip
                    label={`Quantity: ${selectedProduct.quantity || "N/A"}`}
                    color="primary"
                    sx={{ marginTop: "10px" }}
                  />
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      )}

      {selectedProduct && (
        <Grid container spacing={3} sx={{ marginTop: "20px" }}>
          {/* Nutritional Breakdown */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6">Nutritional Breakdown</Typography>
                <Bar
                  data={generateChartData(
                    ["Energy (kcal)", "Fat (g)", "Sugars (g)", "Salt (g)"],
                    [
                      selectedProduct.nutriments?.energy_kcal || 0,
                      selectedProduct.nutriments?.fat || 0,
                      selectedProduct.nutriments?.sugars || 0,
                      selectedProduct.nutriments?.salt || 0,
                    ],
                    "Nutrition Per 100g"
                  )}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* NutriScore Section (Replaced with our new component) */}
          <Grid item xs={12}>
            <NutriScoreSection selectedProduct={selectedProduct} />
          </Grid>

          {/* Ingredients Section */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6">Ingredients</Typography>
                {selectedProduct.ingredients &&
                selectedProduct.ingredients.length > 0 ? (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Ingredient</TableCell>
                          <TableCell>Percentage</TableCell>
                          <TableCell>Vegan</TableCell>
                          <TableCell>Vegetarian</TableCell>
                          <TableCell>Sub Ingredients</TableCell>
                          <TableCell>Palm Oil</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedProduct.ingredients.map(
                          (ingredient, index) => (
                            <TableRow key={index}>
                              <TableCell>{ingredient.text}</TableCell>
                              <TableCell>
                                {ingredient.percent_estimate
                                  ? `${ingredient.percent_estimate}%`
                                  : "N/A"}
                              </TableCell>
                              <TableCell>
                                {ingredient.vegan ? "Yes" : "No"}
                              </TableCell>
                              <TableCell>
                                {ingredient.vegetarian ? "Yes" : "No"}
                              </TableCell>
                              <TableCell>
                                {ingredient.has_sub_ingredients ? "Yes" : "No"}
                              </TableCell>
                              <TableCell>
                                {ingredient.from_palm_oil ? "Yes" : "No"}
                              </TableCell>
                            </TableRow>
                          )
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography>No ingredients available.</Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Detailed Information */}
          <Grid item xs={12}>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">Detailed Information</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body1">
                  Ingredients:{" "}
                  {selectedProduct.ingredients_text || "Not available"}
                </Typography>
                <Divider sx={{ margin: "10px 0" }} />
                <Typography variant="body1">
                  Allergens:{" "}
                  {selectedProduct.allergens || "No allergens listed."}
                </Typography>
                <Typography variant="body1">
                  Packaging:{" "}
                  {selectedProduct.packaging || "No packaging info available"}
                </Typography>
              </AccordionDetails>
            </Accordion>
          </Grid>
        </Grid>
      )}
      {substitutes.length > 0 && (
        <Grid container spacing={3} sx={{ mt: 4 }}>
          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom>
              Healthier & Accessible Alternatives
            </Typography>
            <Divider />
          </Grid>
          {substitutes.map((substitute) => (
            <Grid item xs={12} sm={6} md={4} key={substitute.code || substitute._id}>
              <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                <img
                  src={substitute.image_url}
                  alt={substitute.product_name}
                  style={{ width: "100%", height: "200px", objectFit: "contain", padding: "10px" }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h6">
                    {substitute.product_name || "Unnamed Product"}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                    <Chip 
                      label={`${substitute.stores_tags?.length || 0} stores`}
                      size="small" 
                      color="info"
                    />
                    <Chip
                      label={`${substitute.countries_tags?.length || 0} countries`}
                      size="small"
                      color="secondary"
                    />
                  </Box>
                  <Box sx={{ mt: 1 }}>
                    {substitute.nutriscore_grade && (
                      <Chip
                        label={`Nutri-Score: ${substitute.nutriscore_grade.toUpperCase()}`}
                        color="primary"
                        sx={{ mr: 1 }}
                      />
                    )}
                    {substitute.ecoscore_grade && (
                      <Chip
                        label={`Eco-Score: ${substitute.ecoscore_grade.toUpperCase()}`}
                        color="secondary"
                      />
                    )}
                  </Box>
                </CardContent>
                <Box sx={{ p: 2 }}>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => handleProductSelect(substitute)}
                  >
                    View Details
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {substituteLoading && (
        <Box sx={{ textAlign: "center", mt: 4 }}>
          <CircularProgress />
          <Typography variant="body2" sx={{ mt: 1 }}>
            Finding popular and safer alternatives...
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default FoodSearch;
