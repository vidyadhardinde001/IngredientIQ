import type { NextApiRequest, NextApiResponse } from "next";
import { OpenAI } from "openai"; // Correct import for OpenAI package

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const openaiKey = process.env.OPENAI_API_KEY; // Get API key from environment variables

  if (!openaiKey) {
    console.error("Missing OpenAI API key");
    return res.status(500).json({ error: "OpenAI API key not configured" });
  }

  const openai = new OpenAI({
    apiKey: openaiKey, // Use the API key
  });

  try {
    const { prompt } = req.body; // Extract prompt from the request body
    
    // Add a console log to verify that the prompt is coming through correctly
    console.log("Request Body:", req.body);

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" }); // If prompt is not provided, return an error
    }

    // Call OpenAI's API with the provided prompt
    const response = await openai.chat.completions.create({
      model: "gpt-4", // The model being used
      messages: [
        { role: "user", content: prompt }, // Pass the prompt to the model
      ],
    });

    // Return only the content of the first choice from OpenAI's response
    const aiResponse = response.choices[0]?.message?.content ?? "No response from AI.";
    return res.status(200).json({ message: aiResponse });
  } catch (error: any) {
    console.error("Error communicating with OpenAI:", error); // Log any errors
    return res.status(500).json({ error: "Failed to fetch information from OpenAI." });
  }
}
