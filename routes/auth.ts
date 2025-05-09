import "bun";
import express from "express";
import { User } from "../model/user";
import { hash } from "../utils/hash";
import { HttpStatus } from "../utils/status";
import {
  requireEmail,
  requirePasscode,
  requireUser,
  requireUsername,
  validateMatch,
  validatePassword,
} from "../utils/validators";
import { signToken } from "../utils/token";
import { serverError, success } from "../utils/responder";
import { check } from "../middleware/auth";
import type { AuthRequest } from "../type";
import logger from "../middleware/logger";
import { Dealer } from "../model/dealer";
import { Car } from "../model/car";
import { Company } from "../model/company";
const router = express.Router();

//  Signin
router.post("/signin", async (req, res): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ message: "User does not exist" });
      return;
    }
    if (validatePassword(password, user.password, res)) return;

    const token = signToken({ id: user._id, username: user.username });
    user.password = "";

    res.cookie("Authorization", `Bearer ${token}`, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 day
    });

    success(res, { user });
  } catch (error) {
    serverError(res, "sign in error", error);
  }
});
// Signup
router.post("/signup", async (req, res): Promise<void> => {
  try {
    const { username, lastname, firstname, email, password } = req.body;

    if (requireEmail(email, res)) return;
    if (requireUsername(username, res)) return;
    if (requirePasscode(password, res)) return;

    const exists = await User.findOne({ username });
    if (exists) {
      res.status(HttpStatus.CONFLICT).json({ error: "Username already taken" });
      return;
    }

    const hashed = await hash(password);
    const newUser = new User({
      username,
      password: hashed,
      email,
      lastname,
      firstname,
    });
    await newUser.save();
    success(res);
  } catch (error) {
    serverError(res, "Signup Error:", error);
  }
});
//

router.post("/logout", (req, res) => {
  res.clearCookie("Authorization", {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
  });
  success(res, { message: "Logged out successfully" });
});

//
router.get("/me", check, async (req: AuthRequest, res) => {
  try {
    const user = User.findById(req.user?.id).select("-password");
    if (requireUser(user, res)) return;
    success(res, { user });
  } catch (error) {
    logger.error("error happened while fetching user details");
    serverError(res, "error happened while fetching user details", error);
  }
});

router.put("/me", check, async (req: AuthRequest, res): Promise<void> => {
  try {
    const {
      username,
      firstname,
      lastname,
      age,
      address,
      phone,
      email,
      passportId,
      password,
      interests,
      needs,
      owner,
    } = req.body;
    if (requireUsername(req.user?.username, res)) return;
    if (validateMatch(username, req.user?.username, res)) return;

    let user = await User.findOne({ username });
    if (!user) return;
    if (requireUser(user, res)) return;

    const hashed = password ? await hash(password) : user.password;
    // update fields if they are provided
    if (email) user.email = email;
    if (lastname) user.lastname = lastname;
    if (firstname) user.firstname = firstname;
    if (age) user.age = age;
    if (address) user.address = address;
    if (phone) user.phone = phone;
    if (passportId) user.passportId = passportId;
    if (interests) user.interests = interests;
    if (needs) user.needs = needs;
    if (owner) user.owner = owner;

    user.password = hashed;
    await user.save();
    user.password = "";
    success(res, { user });
  } catch (error) {
    serverError(res, "Error happened while updating user: " + error);
  }
});

router.delete("/me", check, async (req: AuthRequest, res): Promise<void> => {
  try {
    const { username } = req.body;
    if (requireUsername(req.user?.username, res)) return;
    if (requireUsername(username, res)) return;
    if (validateMatch(username, req.user?.username, res)) return;

    const user = await User.findOne({ username });
    if (!user) return;
    if (requireUser(user, res)) return;
    await User.deleteOne({ username });

    res.clearCookie("Authorization", {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
    });
    success(res, { message: "Account deleted successfully" });
  } catch (error) {
    serverError(res, "Error deleting user:", error);
  }
});

// dealer Signin
router.post("/dealer/signin", async (req, res): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (requireEmail(email, res)) return;
    if (requirePasscode(password, res)) return;
    let user = await Dealer.findOne({ email });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    if (validatePassword(password, user.password, res)) return;

    const token = signToken({ id: user._id, username: user.username });
    let company;
    if (user.company) company = await Company.findById(user.company);

    res.cookie("Authorization", `Bearer ${token}`, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 day
    });
    user.password = "";
    success(res, { user, company });
  } catch (error) {
    serverError(res, "Admin Signin Error:", error);
  }
});
// dealer/signup
router.post("/dealer/signup", async (req, res): Promise<void> => {
  try {
    const { username, email, lastname, firstname, password } = req.body;

    if (requireEmail(email, res)) return;
    if (requireUsername(username, res)) return;
    if (requirePasscode(password, res)) return;

    const exists = await Dealer.findOne({ username }).select("-password");
    if (exists) {
      res.status(HttpStatus.CONFLICT).json({ error: "Username already taken" });
      return;
    }

    const hashed = await hash(password);
    const newUser = new Dealer({
      username,
      password: hashed,
      email,
      lastname,
      firstname,
    });
    await newUser.save();

    success(res);
  } catch (error) {
    serverError(res, "Signup Error:", error);
  }
});

router.get("/dealer/me", check, async (req: AuthRequest, res) => {
  try {
    const user = Dealer.findById(req.user?.id).select("-password");
    if (requireUser(user, res)) return;
    success(res, { user });
  } catch (error) {
    logger.error("error happened while fetching user details");
    serverError(res, "error happened while fetching user details", error);
  }
});

router.put(
  "/dealer/me",
  check,
  async (req: AuthRequest, res): Promise<void> => {
    try {
      const {
        username,
        firstname,
        lastname,
        age,
        address,
        phone,
        email,
        passportId,
        password,
      } = req.body;
      if (requireUsername(req.user?.username, res)) return;
      if (validateMatch(username, req.user?.username, res)) return;

      let user = await Dealer.findOne({ username });
      if (!user) return;
      if (requireUser(user, res)) return;

      const hashed = password ? await hash(password) : user.password;
      // update fields if they are provided
      if (email) user.email = email;
      if (lastname) user.lastname = lastname;
      if (firstname) user.firstname = firstname;
      if (age) user.age = age;
      if (address) user.address = address;
      if (phone) user.phone = phone;
      if (passportId) user.passportId = passportId;

      user.password = hashed;
      await user.save();
      user.password = "";

      success(res, { user });
    } catch (error) {
      serverError(res, "Error happened while updating user: " + error);
    }
  }
);

router.delete(
  "/dealer/me",
  check,
  async (req: AuthRequest, res): Promise<void> => {
    try {
      const { username } = req.body;
      if (requireUsername(req.user?.username, res)) return;
      if (requireUsername(username, res)) return;
      if (validateMatch(username, req.user?.username, res)) return;

      const user = await Dealer.findOne({ username });
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }
      await Promise.all([
        Company.findByIdAndDelete(user.company),
        Car.deleteMany({ company: user.company }),
        Dealer.deleteOne({ username }),
      ]);
      res.clearCookie("Authorization", {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        path: "/",
      });
      success(res, { message: "Account deleted successfully" });
    } catch (error) {
      serverError(res, "Error deleting user:", error);
    }
  }
);

export default router;
