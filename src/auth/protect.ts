import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../config/ormConfig";
import { User } from "../entities/user";
import { verifyToken } from "../utilis";

export const protectRoute = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const token = req.cookies.token;
  // console.log("token", token)
  if (!token)
    return res
      .status(401)
      .json({ status: "fail", statusCode: 401, message: "Unauthorized" });

  try {
    const decoded = verifyToken(token);
    const user = await AppDataSource.getRepository(User).findOne({
      where: { id: decoded.user_id },
    });
    if (!user)
      return res
        .status(401)
        .json({ status: "fail", statusCode: 401, message: "Unauthorized" });

    req.user = user;
    req.user.id = user.id;
    // req.user.email = user.email;
    // console.log(user);
    next();
  } catch (err) {
    res
      .status(401)
      .json({ status: "fail", statusCode: 401, message: "Unauthorized" });
  }
};
