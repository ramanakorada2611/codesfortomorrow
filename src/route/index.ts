import express from "express";
import { login, logout, signup } from "../controller/user-controller";
import { validateLogin, validateSignUp } from "../validation";
import { protectRoute } from "../auth/protect";
const route = express.Router();

route.post("/sign-up", validateSignUp, signup);
route.post("/login", validateLogin, login);
route.post("/logout", protectRoute, logout);

export default route;
