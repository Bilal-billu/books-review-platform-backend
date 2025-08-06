import { Router } from "express";
import { getMe, loginUser, logoutUser, regenerateAccessToken, registerNewUser } from "../controllers/user.controller.js";
import { verifyJWTToken } from "../middleware/userAuth.middleware.js";

const userRouter = Router();
userRouter.route('/register').post(registerNewUser);
userRouter.route('/login').post(loginUser);
userRouter.route('/logout').post(
    verifyJWTToken,
    logoutUser
);
userRouter.route('/regenerate-access-token').post(regenerateAccessToken);


userRouter.route('/auth/me').get(
    verifyJWTToken,
    getMe
);


export default userRouter