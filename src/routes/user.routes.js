import { Router } from "express";
import { deleteUserById, getAllUsers, getMe, getUserByEmail, getUserById, loginUser, logoutUser, regenerateAccessToken, registerNewUser, updateUserViaAdmin } from "../controllers/user.controller.js";
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


userRouter.route('/:id').get(
    getUserById
)

userRouter.route('/email').get(
    getUserByEmail
)
///////
userRouter.route('/').get(
    verifyJWTToken,
    getAllUsers
)
userRouter.route('/:id').delete(
    verifyJWTToken,
    deleteUserById
)
userRouter.route('/update-via-admin/:id').patch(
    verifyJWTToken,
    updateUserViaAdmin,
)


export default userRouter