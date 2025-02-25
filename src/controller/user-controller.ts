import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../entities/user";
import { generateToken } from "../utilis";
import NodeCache from "node-cache";

interface UserType {
  id: number;
  email: string;
  password: string;
}

// Initialize node-cache with a standard TTL of 1 hour and a check period of 2 minutes
const userCache = new NodeCache({ stdTTL: 3600, checkperiod: 120 });

export const signup = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password } = req.body;
    let userCacheData: UserType | undefined = userCache.get<UserType>(email);
    if (userCacheData) {
      return res.status(409).json({
        status: "fail",
        statusCode: 409,
        message: "User with this email already exists. Please Login",
      });
    }
    let dbUser = await User.findOne({ where: { email } });
    if (dbUser) {
      return res.status(409).json({
        status: "fail",
        statusCode: 409,
        message: "User with this email already exists. Please Login",
      });
    }

    const hashedPassword = bcrypt.hashSync(password, 12);
    dbUser = new User();
    dbUser.email = email;
    dbUser.password = hashedPassword;
    await dbUser.save();

    // Cache the user information for this email
    const user: UserType = {
      id: dbUser.id,
      email: dbUser.email,
      password: dbUser.password,
    };
    userCache.set(email, user);

    const token = generateToken(user.id);
    // Broadcast to all clients when a new user signs up
    req.app.get("io").emit("newUserSignup", { userId: dbUser.id, email });

    res.cookie("token", token, { httpOnly: true });
    return res.status(201).json({
      status: "success",
      statusCode: 201,
      message: "User created successfully",
      token,
    });
  } catch (error: any) {
    return res.status(500).json({
      status: "error",
      statusCode: 500,
      message: "An error occurred while creating the user",
      error: error.message,
    });
  }
};
export const login = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password } = req.body;
    let user: UserType | undefined = userCache.get<UserType>(email);

    if (!user) {
      const dbUser = await User.findOne({ where: { email } });
      if (dbUser) {
        user = {
          id: dbUser.id,
          email: dbUser.email,
          password: dbUser.password,
        };
        userCache.set(email, user);
        console.log("User data cached for email:", email);
      }
    }

    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({
        status: "success",
        statusCode: 403,
        message: "Invalid credentials",
      });
    }

    const token = generateToken(user.id);
    // Notify clients in real-time when a user logs in
    req.app
      .get("io")
      .emit("userLoggedIn", { userId: user.id, email: user.email });

    res.cookie("token", token, { httpOnly: true });
    return res.status(200).json({
      status: "success",
      statusCode: 200,
      message: "User logged in successfully",
      token,
    });
  } catch (error: any) {
    return res.status(500).json({
      status: "error",
      statusCode: 500,
      message: "An error occurred while the user login",
      error: error.message,
    });
  }
};

export const logout = async (req: Request, res: Response): Promise<any> => {
  //   console.log("logout", req.user?.id);

  res.clearCookie("token");
  return res.status(200).json({
    status: "success",
    statusCode: 200,
    message: "Logged out successfully",
  });
};
