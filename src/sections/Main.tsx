import React, { useState } from "react";
import { Box, Button } from "@mui/material";
import SearchAndScan from "./SearchAndScan"; // Import your SearchAndScan component

const App: React.FC = () => {
  // Create state for barcode and product name
  const [barcode, setBarcode] = useState<string>("");
  const [productName, setProductName] = useState<string>("");

  // Functions to handle fetching the food by barcode and product name
  const fetchFoodByBarcode = () => {
    console.log("Fetching food by barcode:", barcode);
    // Add your logic to fetch food based on the barcode
  };

  const fetchFoodByName = () => {
    console.log("Fetching food by name:", productName);
    // Add your logic to fetch food based on the product name
  };

  return (
    <div>
      <h1>Product Search</h1>
      <SearchAndScan
        barcode={barcode}
        setBarcode={setBarcode}
        fetchFoodByBarcode={fetchFoodByBarcode}
        productName={productName}
        setProductName={setProductName}
        fetchFoodByName={fetchFoodByName}
      />
    </div>
  );
};

export default App;
