import { useState } from "react";
import Tesseract from "tesseract.js";

const IngredientDetailsPage = () => {
  const [image, setImage] = useState<string | null>(null);
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [ingredientDetails, setIngredientDetails] = useState<any | null>(null);

  // Handle image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Extract text from the image (OCR)
  const handleScan = () => {
    if (image) {
      extractIngredients(image);
    }
  };

  // Using Tesseract.js to extract text
  const extractIngredients = (imageDataUrl: string) => {
    Tesseract.recognize(imageDataUrl, "eng", {
      logger: (m) => console.log(m),
    }).then(({ data: { text } }) => {
      console.log("OCR Result:", text);
      const ingredientsList = text.split("\n").filter((line) => line.trim() !== "");
      setIngredients(ingredientsList);
    });
  };

  // Fetch ingredient details (Example: using a mock API or hardcoded data)
  const fetchIngredientDetails = async (ingredient: string) => {
    try {
      // Fetch ingredient details from an API (You can replace it with your own API or local data)
      const response = await fetch(`/api/ingredient-info/${ingredient}`);
      const data = await response.json();
      setIngredientDetails(data);
    } catch (error) {
      console.error("Error fetching ingredient details:", error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-6 text-indigo-600">
        Scan Ingredients and Get Details
      </h1>
      <div className="flex justify-center mb-6">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="file-upload bg-indigo-500 text-white py-2 px-4 rounded-full cursor-pointer hover:bg-indigo-600 transition duration-300"
        />
      </div>

      {image && (
        <div className="flex justify-center mb-6">
          <div>
            <h2 className="text-xl font-semibold text-center mb-4">Image Preview:</h2>
            <img src={image} alt="Uploaded" width="300" className="rounded-lg shadow-md" />
          </div>
        </div>
      )}

      <div className="text-center mb-6">
        <button
          onClick={handleScan}
          className="bg-green-500 text-white py-2 px-6 rounded-full hover:bg-green-600 transition duration-300"
        >
          Extract Ingredients
        </button>
      </div>

      {ingredients.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h3 className="text-2xl font-semibold text-center mb-4">Extracted Ingredients:</h3>
          <ul className="space-y-4">
            {ingredients.map((ingredient, index) => (
              <li key={index} className="flex justify-between items-center">
                <span className="text-lg">{ingredient}</span>
                <button
                  onClick={() => fetchIngredientDetails(ingredient)}
                  className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition duration-300"
                >
                  View Details
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {ingredientDetails && (
        <div className="bg-gray-100 p-6 rounded-lg shadow-md">
          <h3 className="text-2xl font-semibold text-center mb-4">Ingredient Details:</h3>
          <div className="space-y-4">
            <p><strong>Name:</strong> {ingredientDetails.name}</p>
            <p><strong>Description:</strong> {ingredientDetails.description}</p>
            <p><strong>Health Benefits:</strong> {ingredientDetails.benefits}</p>
            <p><strong>Usage:</strong> {ingredientDetails.usage}</p>
            <p><strong>Safety:</strong> {ingredientDetails.safety}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default IngredientDetailsPage;
