import mongoose, { Schema, Document } from "mongoose";

export interface IDealer extends Document {
  username: string;
  firstname: string;
  lastname: string;
  age: number;
  address: string;
  phone: string;
  email: string;
  passportId?: string;
  validated: boolean;
  password: string;
  company: mongoose.Types.ObjectId; // reference to org
  settings: {
    chatEnabled: boolean;
    visible: boolean;
  };
}

const DealerSchema = new Schema<IDealer>(
  {
    username: { type: String, required: true, unique: true, immutable: true },
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    age: { type: Number, min: 18 },
    address: { type: String },
    phone: { type: String},
    email: { type: String, required: true, unique: true },
    passportId: { type: String },
    validated: { type: Boolean, default: false },
    password: { type: String, required: true },
    company: { type: Schema.Types.ObjectId, ref: "Company" },
    settings: {
      chatEnabled: { type: Boolean, default: true },
      visible: { type: Boolean, default: true },
    },
  },
  {
    timestamps: { createdAt: "created", updatedAt: "modified" },
  }
);

export const Dealer = mongoose.model<IDealer>("Dealer", DealerSchema);
