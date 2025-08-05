import { Router } from "express";
import { loginUser, registerNewUser } from "../controllers/user.controller.js";

const userRouter = Router();
userRouter.route('/register').post(registerNewUser);
userRouter.route('/login').post(loginUser);


export default userRouter