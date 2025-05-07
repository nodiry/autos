import "bun";
import express from "express";
import type { AuthRequest } from "../type";
import { check } from "../middleware/auth";
import { Company } from "../model/company";
import { badRequest, serverError, success } from "../utils/responder";
import { Car } from "../model/car";
import { Order } from "../model/sale";
import { requireObject } from "../utils/validators";
import { Dealer } from "../model/dealer";

const router = express.Router();

// Create Company
router.post("/", check, async (req: AuthRequest, res) => {
  try {
    const { name, address, email, region, phone } = req.body;

    const company = await Company.create({
      name,
      address,
      region,
      email,
      phone,
      dealers: [req.user?.id],
    });
    const user = await Dealer.findByIdAndUpdate(
      req.user?.id,
      { company: company._id },
      { new: true }
    ).select("-password");

    success(res, { company, user });
  } catch (error) {
    serverError(res, "Error creating company", error);
  }
});

// Get Company and Its Cars & Orders
router.get("/:id", check, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const [cars, orders] = await Promise.all([
      Car.find({ company: id }),
      Order.find({ company: id }),
    ]);

    success(res, { cars, orders });
  } catch (error) {
    serverError(res, "Error fetching company info", error);
  }
});

// Update Company
router.put("/:id", check, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { address, region, email, phone, name } = req.body;

    const company = await Company.findById(id);
    if (!company || requireObject(company, res, "company object")) return;

    if (name) company.name = name;
    if (email) company.email = email;
    if (phone) company.phone = phone;
    if (address) company.address = address;
    if (region) company.region = region;

    await company.save();
    success(res, { company });
  } catch (error) {
    serverError(res, "Error updating company info", error);
  }
});

// Delete Company
router.delete("/:id", check, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    await Company.findByIdAndDelete(id);
    success(res);
  } catch (error) {
    serverError(res, "Error deleting company", error);
  }
});

// Add Dealer to Company
router.post("/dealer", check, async (req: AuthRequest, res) => {
  try {
    const { companyid, dealerid } = req.body;

    const company = await Company.findById(companyid);
    if (!company || requireObject(company, res, "company object")) return;

    const dealer = await Dealer.findById(dealerid);
    if (!dealer) return badRequest(res, "Dealer not found");

    const isAuthorized = company.dealers.some(
      (id) => id.toString() === req.user?.id
    );
    if (!isAuthorized) return badRequest(res, "The user is not validated");

    if (!company.dealers.includes(dealerid)) {
      company.dealers.push(dealerid);
    }

    const user = await Dealer.findByIdAndUpdate(
      dealerid,
      { company: companyid },
      { new: true }
    ).select("-password");

    await company.save();
    success(res, { company, user });
  } catch (error) {
    serverError(res, "Error while assigning dealer", error);
  }
});

export default router;
