import mongoose, { Schema, Document } from "mongoose";

export interface ICar extends Document {
  company: mongoose.Types.ObjectId; // Linked company
  dealer: mongoose.Types.ObjectId; // Linked dealer
  make: string; // e.g., Toyota
  carmodel: string; // e.g., Corolla
  year: number; // Model year
  price: number; // Price in number (assumed to be in a default currency)

  specs: {
    color?: string; // Exterior color
    transmission?: string; // e.g., Automatic
    fuelType?: string; // e.g., Petrol, Diesel
    range?: number; // Kilometers or miles (even new cars may have delivery mileage)
    driveType?: string; // e.g., FWD, AWD
    bodyType?: string; // e.g., SUV, Sedan
    engine?: {
      size?: string; // e.g., "2.0L"
      cylinders?: number; // e.g., 4
      horsepower?: number; // e.g., 180
    };
  };

  vin: string; // Unique vehicle identification number
  features?: string[]; // e.g., ["Sunroof", "Bluetooth", "Parking Sensors"]
  warranty?: {
    years?: number; // e.g., 5
    kilometers?: number; // e.g., 100000
  };

  images: string[]; // Array of image URLs
  status: "available" | "pending" | "completed" | "cancelled";
  buyer: mongoose.Types.ObjectId;
  saleDate?: Date;
  review: {
    user: mongoose.Types.ObjectId;
    rating: number;
    text?: string;
    date: Date;
  };
}

// Schema definition
const CarSchema = new Schema<ICar>(
  {
    company: { type: Schema.Types.ObjectId, ref: "Company", required: true },
    dealer: { type: Schema.Types.ObjectId, ref: "Dealer", required: true },
    make: { type: String, required: true },
    carmodel: { type: String, required: true },
    year: { type: Number, required: true },
    price: { type: Number, required: true },
    vin: { type: String, required: true, unique: true }, // VIN should be unique

    specs: {
      color: String,
      transmission: String,
      fuelType: String,
      range: Number,
      driveType: String,
      bodyType: String,
      engine: {
        size: String,
        cylinders: Number,
        horsepower: Number,
      },
    },

    features: [String],
    warranty: {
      years: Number,
      kilometers: Number,
    },

    images: [String],
    status: {
      type: String,
      enum: ["available", "pending", "completed", "cancelled"],
      default: "available",
    },
    buyer: { type: Schema.Types.ObjectId, ref: "User" },
    saleDate: { type: Date },
    review: {
      user: { type: Schema.Types.ObjectId, ref: "User" },
      rating: { type: Number, min: 1, max: 5 },
      text: String,
      date: { type: Date },
    },
  },
  {
    timestamps: { createdAt: "created", updatedAt: "modified" },
  }
);

export const Car = mongoose.model<ICar>("Car", CarSchema);
