import React, { useState } from "react";
import { Box, Button, TextField, CircularProgress } from "@mui/material";

interface SearchSectionProps {
  barcode: string;
  setBarcode: (value: string) => void;
  fetchFoodByBarcode: () => void;
  productName: string;
  setProductName: (value: string) => void;
  fetchFoodByName: () => void;
}

const SearchAndScan: React.FC<SearchSectionProps> = ({
  barcode,
  setBarcode,
  fetchFoodByBarcode,
  productName,
  setProductName,
  fetchFoodByName,
}) => {
  // State for loading and error handling
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handling barcode search and setting loading state
  const handleBarcodeSearch = async () => {
    setIsLoading(true);
    setError(null); // Reset error state on new search
    try {
      await fetchFoodByBarcode(); // Replace with actual fetch logic
    } catch (err) {
      setError("An error occurred while fetching the barcode data.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handling product name search and setting loading state
  const handleProductSearch = async () => {
    setIsLoading(true);
    setError(null); // Reset error state on new search
    try {
      await fetchFoodByName(); // Replace with actual fetch logic
    } catch (err) {
      setError("An error occurred while fetching the product data.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ marginBottom: "20px", textAlign: "center" }}>
      <TextField
        label="Enter Product Barcode"
        variant="outlined"
        value={barcode}
        onChange={(e) => setBarcode(e.target.value)}
        sx={{ width: "300px", marginBottom: "20px" }}
      />
      <Button
        variant="contained"
        onClick={handleBarcodeSearch}
        sx={{ marginLeft: "10px", padding: "10px 20px" }}
        disabled={isLoading}
      >
        {isLoading ? <CircularProgress size={24} /> : "Search by Barcode"}
      </Button>

      <Box sx={{ marginTop: "20px" }}>
        <TextField
          label="Enter Product Name"
          variant="outlined"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          sx={{ width: "300px", marginBottom: "20px" }}
        />
        <Button
          variant="contained"
          onClick={handleProductSearch}
          sx={{ marginLeft: "10px", padding: "10px 20px" }}
          disabled={isLoading}
        >
          {isLoading ? <CircularProgress size={24} /> : "Search by Name"}
        </Button>
      </Box>

      {/* Error message */}
      {error && (
        <Box sx={{ marginTop: "20px", color: "red", fontWeight: "bold" }}>
          {error}
        </Box>
      )}
    </Box>
  );
};

export default SearchAndScan;
