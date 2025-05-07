import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  username: string; // login name, immutable
  firstname: string;
  lastname: string;
  age: number; // must be >= 18
  address: string;
  phone: string;
  email: string;
  passportId?: string; // optional
  validated: boolean;
  password: string; // hashed
  interests: { brand: string; type: string }[];
  owner: { brand: string; type: string }[];
  needs: {
    price: "affordable" | "medium" | "premium" | "luxury";
    fuel: "gas" | "petroleum" | "diesel" | "electric" | "hydrogen";
    brand: string[]; // list of preferred brands
    color:
      | "yellow"
      | "blue"
      | "white"
      | "black"
      | "pink"
      | "red"
      | "grey"
      | "silver"
      | "green";
  };
  favorites: mongoose.Types.ObjectId[]; // saved cars
}

const UserSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true, immutable: true },
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    age: { type: Number, min: 18 },
    address: { type: String },
    phone: { type: String,  },
    email: { type: String, required: true, unique: true },
    passportId: { type: String },
    password: { type: String, required: true },
    interests: [{ brand: String, type: String }],
    owner: [{ brand: String, type: String }],
    needs: {
      price: {
        type: String,
        enum: ["affordable", "medium", "premium", "luxury"],
        default: "affordable",
      },
      fuel: {
        type: String,
        enum: ["gas", "petroleum", "diesel", "electric", "hydrogen"],
        default: "petroleum",
      },
      brand: [
        {
          type: String,
          enum: [
            "chevrolet",
            "gazelle",
            "honda",
            "toyota",
            "ravon",
            "hyundai",
            "byd",
            "tesla",
            "ford",
            "khan",
          ],
        },
      ],
      color: {
        type: String,
        enum: [
          "yellow",
          "blue",
          "white",
          "black",
          "pink",
          "red",
          "grey",
          "silver",
          "green",
        ],
      },
    },
    favorites: [{ type: Schema.Types.ObjectId, ref: "Car" }],
  },
  {
    timestamps: { createdAt: "created", updatedAt: "modified" },
  }
);

export const User = mongoose.model<IUser>("User", UserSchema);
