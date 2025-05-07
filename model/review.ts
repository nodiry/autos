import mongoose, { Schema, Document } from "mongoose";

export interface IReview extends Document {
  car: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  company: mongoose.Types.ObjectId;
  rating: number;
  text?: string;
}

const ReviewSchema = new Schema<IReview>(
  {
    car: { type: Schema.Types.ObjectId, ref: "Car", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    company: { type: Schema.Types.ObjectId, ref: "Company", required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    text: String,
  },
  { timestamps: { createdAt: "created" } }
);

export const Review = mongoose.model<IReview>("Review", ReviewSchema);
