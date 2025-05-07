import mongoose, { Schema, Document } from "mongoose";

export interface ICompany extends Document {
  name: string;
  address: string;
  email: string;
  phone: string;
  region: string;
  dealers: mongoose.Types.ObjectId[]; // list of dealer accounts
}

const CompanySchema = new Schema<ICompany>(
  {
    name: { type: String, required: true, unique: true },
    address: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    region: { type: String },
    dealers: [{ type: Schema.Types.ObjectId, ref: "Dealer" }],
  },
  {
    timestamps: { createdAt: "created", updatedAt: "modified" },
  }
);

export const Company = mongoose.model<ICompany>("Company", CompanySchema);
