import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

export const verifyJWTToken = asyncHandler(async (req, _, next) => {
    try
    {
        const accessToken = req.cookies?.accessToken || req?.header("Authorization")?.replace("Bearer ", "");
        if(!accessToken)
        {
            throw({
                message: "Could not verify user.",
            })
        }

        const decodedAccessToken = await jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedAccessToken._id);
        if(!user)
        {
            throw ({
                message: "User not found.",
            })
        }

        // console.log("user", user)

        req.user = user;
        next();
    }
    catch(e)
    {
        throw new ApiError(e?.code || 401, e?.message || "User authentication failed")
    }
})