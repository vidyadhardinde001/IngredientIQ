"use client"; 
import { useEffect, useState } from "react";

const BarcodeScanner: React.FC = () => {
  const [scannedCode, setScannedCode] = useState<string>("");
  const [productData, setProductData] = useState<any>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    import("html5-qrcode").then((module) => {
      const Html5QrcodeScanner = module.Html5QrcodeScanner;
      const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 });

      scanner.render(
        async (decodedText) => {
          setScannedCode(decodedText);
          scanner.clear(); // Stop scanning after one successful scan
          fetchProductDetails(decodedText);
        },
        (errorMessage) => {
          setError(errorMessage);
        }
      );

      return () => {
        scanner.clear();
      };
    });
  }, []);

  const fetchProductDetails = async (barcode: string) => {
    try {
      const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
      const data = await response.json();

      if (data.status === 1) {
        setProductData(data.product);
      } else {
        setError("Product not found in Open Food Facts database.");
      }
    } catch (err) {
      setError("Error fetching product details.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-4">Barcode Scanner</h1>
      <div id="reader" className="w-full max-w-md bg-white p-4 shadow-md rounded-md"></div>

      {scannedCode && (
        <div className="mt-4 p-2 bg-green-200 text-green-800 font-bold rounded-md">
          Scanned Code: {scannedCode}
        </div>
      )}

      {error && <p className="text-red-600 mt-2">{error}</p>}

      {productData && (
        <div className="mt-6 p-4 bg-white shadow-md rounded-md w-full max-w-md">
          <h2 className="text-lg font-bold">{productData.product_name || "Unknown Product"}</h2>
          {productData.image_url && (
            <img src={productData.image_url} alt="Product" className="mt-2 w-32 h-32 object-cover" />
          )}
          <p className="mt-2"><strong>Brand:</strong> {productData.brands || "N/A"}</p>
          <p><strong>Ingredients:</strong> {productData.ingredients_text || "Not Available"}</p>
          <p><strong>Nutri-Score:</strong> {productData.nutriscore_grade?.toUpperCase() || "N/A"}</p>
        </div>
      )}
    </div>
  );
};

export default BarcodeScanner;
