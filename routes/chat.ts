import "bun";
import express from "express";
import type { AuthRequest } from "../type";
import { serverError, success } from "../utils/responder";
import { Car } from "../model/car";
import { Message } from "../model/message";
import { check } from "../middleware/auth";
import { requireField } from "../utils/validators";

const router = express.Router();

const specOptions = {
  makes: [
    "Toyota",
    "Honda",
    "Chevrolet",
    "Ravon",
    "Lexus",
    "Lixiang",
    "BYD",
    "Ford",
    "BMW",
    "Audi",
    "Porsche",
    "Mercedes-Benz",
    "Hyundai",
    "Kia",
    "Volkswagen",
    "Tesla",
    "Nissan",
  ],
  colors: [
    "White",
    "Black",
    "Gray",
    "Silver",
    "Blue",
    "Red",
    "Green",
    "Yellow",
    "Brown",
    "Orange",
  ],
  transmissions: ["Automatic", "Manual", "CVT", "Dual-Clutch"],
  fuelTypes: ["Petrol", "Diesel", "Electric", "Hybrid", "Hydrogen"],
  bodyTypes: [
    "Sedan",
    "Hatchback",
    "SUV",
    "Coupe",
    "Convertible",
    "Pickup Truck",
    "Van",
    "Wagon",
  ],
  driveTypes: ["FWD", "RWD", "AWD", "4WD"],
  engineSizes: [
    "1.0L",
    "1.2L",
    "1.5L",
    "1.6L",
    "2.0L",
    "2.5L",
    "3.0L",
    "Electric",
  ],
  engineCylinders: ["2", "3", "4", "6", "8", "12"],
};

const buildPrompt = (userPrompt: string) => {
  return `You are a car expert. Based on the user prompt below, pick appropriate car specifications from the available options.

User prompt: "${userPrompt}"

Choose from these:
- Makes: ${specOptions.makes.join(", ")}
- Colors: ${specOptions.colors.join(", ")}
- Transmissions: ${specOptions.transmissions.join(", ")}
- Fuel Types: ${specOptions.fuelTypes.join(", ")}
- Body Types: ${specOptions.bodyTypes.join(", ")}
- Drive Types: ${specOptions.driveTypes.join(", ")}
- Engine Sizes: ${specOptions.engineSizes.join(", ")}
- Engine Cylinders: ${specOptions.engineCylinders.join(", ")}

Return a JSON with this shape:
{
  "specs": {
    "make": string[],
    "bodyType": string[],
    "fuelType": string[],
    "transmission": string[],
    "driveType": string[],
    "engineSize": string[],
    "engineCylinders": string[]
  },
}`;
};

const callGemini = async (prompt: string) => {
  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" +
      process.env.SAUCE,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    }
  );

  const data = await response.json();
  if (!data) throw new Error("error happened while generating answer");

  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
  console.log("Raw response from Gemini:", raw);

  // Clean up ```json ... ``` wrappers if present
  const cleaned = raw
    .replace(/^```json/, "")
    .replace(/^```/, "")
    .replace(/```$/, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    console.error("Failed to parse Gemini JSON:", cleaned);
    throw new Error("Invalid JSON format from Gemini.");
  }
};

router.post("/", async (req: AuthRequest, res) => {
  try {
    const { prompt } = req.body;
    console.log(prompt);
    const geminiPrompt = buildPrompt(prompt);
    const aiResponse = await callGemini(geminiPrompt);

    const cars = await Car.find({
      "specs.bodyType": { $in: aiResponse.specs.bodyType || [] },
      "specs.fuelType": { $in: aiResponse.specs.fuelType || [] },
      "specs.transmission": { $in: aiResponse.specs.transmission || [] },
      "specs.driveType": { $in: aiResponse.specs.driveType || [] },
      "specs.engine.size": { $in: aiResponse.specs.engineSize || [] },
      "specs.engine.cylinders": {
        $in: aiResponse.specs.engineCylinders?.map(Number) || [],
      },
      make: { $in: aiResponse.specs.make || [] },
    });

    success(res, { message: aiResponse.message, cars });
  } catch (error) {
    console.error("AI Search Error:", error);
    serverError(res, "Failed to process AI search.");
  }
});

router.get("/:carId", check, async (req: AuthRequest, res) => {
  const { carId } = req.params;
  try {
    if (requireField(carId, res, "car id is needed")) return;
    const messages = await Message.find({
      car: carId,
    });
    success(res, messages);
  } catch (error) {
    serverError(res, "error happened while fetching messages", error);
  }
});

export default router;
