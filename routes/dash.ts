import "bun";
import express from "express";
import { Car } from "../model/car";
import { serverError, success, badRequest } from "../utils/responder";
import { check } from "../middleware/auth";
import type { AuthRequest } from "../type";
import { User } from "../model/user";
import { requireObject } from "../utils/validators";
import { existsSync, unlinkSync, writeFileSync } from "fs";
import { join } from "path";
import multer from "multer";
import { Company } from "../model/company";
import { Dealer } from "../model/dealer";
const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = express.Router();

// Get all cars
router.get("/cars", async (req, res) => {
  try {
    const cars = await Car.find();
    success(res, { cars });
  } catch (error) {
    serverError(res, "Error while fetching cars", error);
  }
});

// Get a specific car and its reviews
router.get("/cars/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const car = await Car.findById(id);
    if (!car) return badRequest(res, "Car not found");
    const [company, cars, dealer] = await Promise.all([
      Company.findById(car.company),
      Car.find({ company: id }),
      Dealer.findById(car.dealer).select("-password"),
    ]);
    success(res, { car, company, cars, dealer });
  } catch (error) {
    serverError(res, "Error while fetching car and reviews", error);
  }
});

// Get cars listed by the current dealer
router.get("/dealer/cars", check, async (req: AuthRequest, res) => {
  try {
    const cars = await Car.find({ dealer: req.user?.id });
    success(res, { cars });
  } catch (error) {
    serverError(res, "Error while fetching dealer cars", error);
  }
});

// Get favorite cars for the current user
router.get("/favorite", check, async (req: AuthRequest, res) => {
  try {
    const user = await User.findById(req.user?.id);
    if (!user) return badRequest(res, "User not found");

    const cars = await Car.find({ _id: { $in: user.favorites } });
    success(res, { cars });
  } catch (error) {
    serverError(res, "Error while fetching favorite cars", error);
  }
});

// Add a car to favorites
router.post("/favorite", check, async (req: AuthRequest, res) => {
  try {
    const { id } = req.body;
    if (requireObject(id, res, "id for favorite car is required")) return;

    const user = await User.findByIdAndUpdate(
      req.user?.id,
      { $push: { favorites: id } },
      { new: true }
    ).select("-password");

    success(res, { user });
  } catch (error) {
    serverError(res, "Error happened while saving favorite car", error);
  }
});

// Remove a car from favorites
router.delete("/favorite", check, async (req: AuthRequest, res) => {
  try {
    const { id } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user?.id,
      { $pull: { favorites: id } },
      { new: true }
    ).select("-password");

    success(res, { user });
  } catch (error) {
    serverError(
      res,
      "Error happened while removing car from favorite list",
      error
    );
  }
});

// Submit a review for a car
router.post("/review", check, async (req: AuthRequest, res) => {
  try {
    const { text, car, rating } = req.body;

    const review = await Car.findByIdAndUpdate(
      car,
      { review: { text, rating, user: req.user?.id, date: new Date() } },
      { new: true }
    );

    success(res, { review });
  } catch (error) {
    serverError(res, "Error while saving review", error);
  }
});
// Upload car image
router.post(
  "/image",
  check,
  upload.single("image"),
  async (req: AuthRequest, res): Promise<void> => {
    try {
      const file = req.file;
      if (!file) {
        res.status(400).send("No file uploaded");
        return;
      }

      const filename = `${Date.now()}-${file.originalname.replace(
        /\s+/g,
        "-"
      )}`;
      const uploadPath = join(process.cwd(), "public/uploads", filename);

      writeFileSync(uploadPath, file.buffer);

      const url = `uploads/${filename}`;
      res.status(200).json({ url });
    } catch (err) {
      console.error("Upload error:", err);
      res.status(500).send("Server error while uploading image");
    }
  }
);

router.delete("/image", check, async (req: AuthRequest, res): Promise<void> => {
  try {
    const { url } = req.body;

    if (!url || typeof url !== "string" || !url.startsWith("uploads/")) {
      res.status(400).send("Invalid image URL");
      return;
    }

    const filePath = join(process.cwd(), "public", url);

    if (existsSync(filePath)) {
      unlinkSync(filePath); // delete the image
      res.status(200).send("Image deleted");
    } else {
      res.status(404).send("File not found");
    }
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).send("Error deleting image");
  }
});
const regionCoordinates = {
  Tashkent: { lat: 41.3111, lng: 69.2797 },
  Andijan: { lat: 40.7821, lng: 72.3442 },
  Fergana: { lat: 40.3734, lng: 71.7978 },
  Namangan: { lat: 40.9983, lng: 71.6726 },
  Samarkand: { lat: 39.6542, lng: 66.9597 },
  Bukhara: { lat: 39.7684, lng: 64.455 },
  Khorezm: { lat: 41.55, lng: 60.6333 },
  Kashkadarya: { lat: 38.862, lng: 66.2186 },
  Surkhandarya: { lat: 37.94, lng: 67.57 },
  Jizzakh: { lat: 40.125, lng: 67.88 },
  Sirdaryo: { lat: 40.8386, lng: 68.66 },
  Navoi: { lat: 40.0844, lng: 65.3792 },
  Karakalpakstan: { lat: 43.7686, lng: 59.0212 },
};

router.get("/map", async (req, res) => {
  try {
    const companies = await Company.aggregate([
      {
        $group: {
          _id: "$region",
          count: { $sum: 1 },
        },
      },
    ]);

    const dealers = companies
      .filter((entry) => entry._id) // skip entries with null region
      .map((entry) => {
        const region = entry._id;
        const coords = regionCoordinates[region] || { lat: 0, lng: 0 };
        return {
          region,
          count: entry.count,
          lat: coords.lat,
          lng: coords.lng,
        };
      })
      .sort((a, b) => b.count - a.count); // optional: sort by count descending

    res.status(200).json({ dealers });
  } catch (err) {
    console.error("Map route error:", err);
    res.status(500).json({ error: "Failed to fetch regional dealer data" });
  }
});

export default router;
