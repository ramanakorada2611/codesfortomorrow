import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { User } from "../entities/user";
export const generateToken = (user_id: number): string => {
  return jwt.sign({ user_id }, process.env.SECRET_KEY!, { expiresIn: "1h" });
};

export const verifyToken = (token: string): any => {
  return jwt.verify(token, process.env.SECRET_KEY!);
};

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // console.log('Global error middleware:', err.message, err.stack, err.status);
  err.statusCode = err.statusCode || 500;
  err.status = err.status;
  res.status(err.statusCode).json({
    succuss: "fail",
    message: err.message,
    error: err.stack,
  });
};

declare global {
  namespace Express {
    interface Request {
      user?: User; // Add the `user` property to the `Request` type
    }
  }
}
