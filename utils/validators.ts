import type { Response } from "express";
import { HttpStatus } from "./status";
import { password } from "bun";

// If a condition is true, return error response and stop the chain
const respondIf = (condition: boolean, res: Response, code: HttpStatus, msg: string): boolean => {
    if (condition) {
        res.status(code).json({ message: msg });
        return true;
    }
    return false;
};

// ----------- Field presence checks ----------- //

// General-purpose: if field is null, undefined, or empty string
export const requireField = (field: unknown, res: Response, name: string): boolean =>
    respondIf(field === null || field === undefined || field === "", res, HttpStatus.BAD_REQUEST, `${name} is required`);

export const requireUsername = (username: unknown, res: Response) =>
    requireField(username, res, "Username");

export const requireUserId = (userid: unknown, res: Response) =>
    requireField(userid, res, "Username");

export const requireEmail = (email: unknown, res: Response) =>
    requireField(email, res, "Email");

export const requirePasscode = (code: unknown, res: Response) =>
    requireField(code, res, "Passcode");

// ----------- Value checks ----------- //

export const validateMatch = (a: string | undefined | number | null, b: string | undefined | number, res: Response, msg = "Values do not match") =>
    respondIf(!a || a !== b, res, HttpStatus.BAD_REQUEST, msg);

// This one assumes `rawPassword` is the one user inputs, and `hashedPassword` is from DB
export const validatePassword = (raw: string | undefined, hashed: string | undefined, res: Response, msg = "Invalid password") =>
    respondIf(!raw || !hashed || !password.verify(raw, hashed), res, HttpStatus.BAD_REQUEST, msg);

// Check if user object exists
export const requireUser = (user: any | undefined, res: Response) =>
    respondIf(!user, res, HttpStatus.NOT_FOUND, "User not found");
// Check if user object exists
export const requireObject = (obj: any | undefined, res: Response, msg:string) =>
    respondIf(!obj, res, HttpStatus.NOT_FOUND, `${msg} not found`);
