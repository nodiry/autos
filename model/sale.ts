import mongoose, { Schema, Document } from "mongoose";

export interface IOrder extends Document {
  user: mongoose.Types.ObjectId;
  company: mongoose.Types.ObjectId; // seller
  car: mongoose.Types.ObjectId; 
  price: number; 
  status: "pending" | "completed" | "cancelled";
  saleDate?: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    company: { type: Schema.Types.ObjectId, ref: "Company", required: true },
    car: { type: Schema.Types.ObjectId, ref: "Car", required: true },
    price: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "completed", "cancelled"],
      default: "pending",
    },
    saleDate: { type: Date },
  },
  {
    timestamps: { createdAt: "created", updatedAt: "modified" },
  }
);

export const Order = mongoose.model<IOrder>("Order", OrderSchema);
