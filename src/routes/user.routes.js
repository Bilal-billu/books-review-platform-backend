import { Router } from "express";
import { loginUser, logoutUser, registerNewUser } from "../controllers/user.controller.js";
import { verifyJWTToken } from "../middleware/userAuth.middleware.js";

const userRouter = Router();
userRouter.route('/register').post(registerNewUser);
userRouter.route('/login').post(loginUser);
userRouter.route('/logout').post(
    verifyJWTToken,
    logoutUser
);

export default userRouter