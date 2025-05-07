import "bun";
import express from "express";
import type { AuthRequest } from "../type";
import { Order } from "../model/sale";
import { check } from "../middleware/auth";
import { badRequest, serverError, success } from "../utils/responder";
import { Car } from "../model/car";

const router = express.Router();

// Dealer: get company sales history
router.get("/history/:id", check, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params; // company ID
    const sales = await Order.find({ company: id });
    success(res, { sales });
  } catch (error) {
    serverError(res, "Error while fetching company sales history", error);
  }
});

// Dealer: update status of an order
router.post("/status", check, async (req: AuthRequest, res) => {
  try {
    const { orderid, status, companyid } = req.body;
    const order = await Order.findById(orderid);

    if (!order || order.company.toString() !== companyid) {
      return badRequest(res, "Not authorized to update this order");
    }

    if (status) order.status = status;
    order.saleDate = new Date();
    await order.save();

    success(res, { order });
  } catch (error) {
    serverError(res, "Error while updating sale status", error);
  }
});

// Dealer: add a new car
router.post("/add", check, async (req: AuthRequest, res) => {
  try {
    const { make, carmodel, company, year, price, specs, images, vin } = req.body;

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
    const sales = await Order.find({ user: req.user?.id });
    success(res, { sales });
  } catch (error) {
    serverError(res, "Error while fetching user purchase history", error);
  }
});

// User: place an order
router.post("/checkout", check, async (req: AuthRequest, res) => {
  try {
    const { companyid, carid, price } = req.body;

    const order = await Order.create({
      company: companyid,
      car: carid,
      price,
      user: req.user?.id,
    });

    success(res, { order });
  } catch (error) {
    serverError(res, "Error while placing order", error);
  }
});

export default router;
