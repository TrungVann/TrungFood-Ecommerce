import { NextFunction, Request, Response } from "express";
import { validateRegistrationData } from "../utils/auth.helper";

//Register a new user
export const userRegistration = async (req: Request, res: Response, next: NextFunction) => {
    validateRegistrationData(req.body, "user")
    const {name, email} = req.body

    const existingUser = await prisma.findUnỉque
}