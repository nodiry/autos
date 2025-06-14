import "bun";
import express from "express";
import type { AuthRequest } from "../type";
import { check } from "../middleware/auth";
import { badRequest, serverError, success } from "../utils/responder";
import { Car } from "../model/car";
import { Message } from "../model/message";
import { Company } from "../model/company";

const router = express.Router();

// Dealer: update status of an order
router.post("/status", check, async (req: AuthRequest, res) => {
  try {
    const { carid, status, companyid } = req.body;
    let car = await Car.findById(carid);

    if (!car || car.company.toString() !== companyid)
      return badRequest(res, "Not authorized to update this order");
    if (status == "cancelled") {
      await Message.deleteMany({
        car: carid,
        $or: [{ receiver: car.buyer }, { sender: car.buyer }],
      });
    }
    if (status) car.status = status;
    car.saleDate = new Date();
    await car.save();

    success(res, { car });
  } catch (error) {
    serverError(res, "Error while updating sale status", error);
  }
});

// Dealer: add a new car
router.post("/add", check, async (req: AuthRequest, res) => {
  try {
    const { make, carmodel, company, year, price, specs, images, vin } =
      req.body;

    const car = await Car.create({
      dealer: req.user?.id,
      company,
      make,
      carmodel,
      year,
      vin,
      price,
      specs,
      images,
    });

    success(res, { car });
  } catch (error) {
    serverError(res, "Error while saving new car", error);
  }
});

// User: get personal purchase history
router.get("/history", check, async (req: AuthRequest, res) => {
  try {
    const sales = await Car.find({ buyer: req.user?.id });
    success(res, { sales });
  } catch (error) {
    serverError(res, "Error while fetching user purchase history", error);
  }
});

// User: place an order
router.post("/checkout", check, async (req: AuthRequest, res) => {
  try {
    const { carid } = req.body;

    const car = await Car.findByIdAndUpdate(
      carid,
      {
        status: "pending",
        buyer: req.user?.id,
      },
      { new: true }
    );

    success(res, { car });
  } catch (error) {
    serverError(res, "Error while placing order", error);
  }
});
router.delete("/", check, async (req: AuthRequest, res) => {
  try {
    const { carid, companyid } = req.body;

    const company = await Company.findById(companyid);
    if (!company || !company.dealers.includes(req.user?.id)) {
      return badRequest(res, "Not allowed");
    }

    await Car.findByIdAndDelete(carid);
    success(res, { message: "Car deleted successfully" });
  } catch (error) {
    serverError(res, "Error while deleting car", error);
  }
});

export default router;
