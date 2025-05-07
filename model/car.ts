import mongoose, { Schema, Document } from "mongoose";

// Interface to define the structure of a Car document
export interface ICar extends Document {
  company: mongoose.Types.ObjectId; // Linked company
  dealer: mongoose.Types.ObjectId;  // Linked dealer
  make: string;                     // e.g., Toyota
  carmodel: string;                 // e.g., Corolla
  year: number;                     // Model year
  price: number;                    // Price in number (assumed to be in a default currency)

  specs: {
    color?: string;                // Exterior color
    transmission?: string;        // e.g., Automatic
    fuelType?: string;            // e.g., Petrol, Diesel
    mileage?: number;             // Kilometers or miles (even new cars may have delivery mileage)
    driveType?: string;           // e.g., FWD, AWD
    bodyType?: string;            // e.g., SUV, Sedan
    engine?: {
      size?: string;              // e.g., "2.0L"
      cylinders?: number;         // e.g., 4
      horsepower?: number;        // e.g., 180
    };
  };

  vin: string;                     // Unique vehicle identification number
  features?: string[];            // e.g., ["Sunroof", "Bluetooth", "Parking Sensors"]
  warranty?: {
    years?: number;               // e.g., 5
    kilometers?: number;          // e.g., 100000
  };

  images: string[];               // Array of image URLs
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
      mileage: Number,
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
  },
  {
    timestamps: { createdAt: "created", updatedAt: "modified" },
  }
);

export const Car = mongoose.model<ICar>("Car", CarSchema);
