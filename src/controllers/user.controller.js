import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js"


const generateAccessAndRefreshToken = async (userId) => {
    try
    {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({
            validateBeforeSave: false,
        });
        return { accessToken, refreshToken }
    }
    catch(e)
    {
        console.log("Error generating tokens.")
        throw new ApiError(500, "Error generating tokens.")
    }
}

const cookieOptionsSecure = {
    httpOnly: true,
    secure: true,
}



const registerNewUser = asyncHandler(async (req, res) => {
    // console.log(req)
    const { name, email, password } = req.body;
    //check empty
    
    if([name, email, password].some((field) => field.trim() === ""))
    {
        throw new ApiError(400, "Some required fields are missing")
    }
    

    //check existing
    // console.log("error");
    const existingUser = await User.findOne({
        email
    })
    
    if(existingUser)
    {
        throw new ApiError(400, "User already exists")
    }

    //create user
    const newUser = await User.create({
        name,
        email: email.toLowerCase(),
        password,
        // role: 
    })

    //verify creation
    if(!newUser)
    {
        throw new ApiError(500, "Internal Server Error")
    }
    //remove unnecessary info
    if(newUser.password)
    {
        delete newUser.password;
    }
    if(newUser.refreshToken)
    {
        delete newUser.refreshToken;
    }
    // delete newUser.refreshToken;

    // send response
    return res.status(201).json(new ApiResponse(200, newUser, "User created successfully"))
})

const loginUser = asyncHandler(async (req, res) => {
    console.log("login")
    const { email, password } = req.body;
    if([email, password].some(field => field.trim() === ""))
    {
        throw new ApiError(400, "Required fields are missing.")
    }
    const user = await User.findOne({
        email
    })
    if(!user)
    {
        throw new ApiError(404, "User not found.")
    }
    const passwordCheckPassed = await user.isPasswordCorrect(password);
    if(!passwordCheckPassed)
    {
        throw new ApiError(401, "Invalid credentials.")
    }
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);
    let updatedUser = user.toObject();
    if(updatedUser.password)
    {
        delete updatedUser.password;
    }
    if(updatedUser.refreshToken)
    {
        delete updatedUser.refreshToken;
    }

    return res.status(200)
    .cookie("accessToken", accessToken, cookieOptionsSecure)
    .cookie("refreshToken", refreshToken, cookieOptionsSecure)
    .json(
        new ApiResponse(
            200,
            {
                user: updatedUser,
                accessToken,
                refreshToken,
            },
            "User logged in successfully."
        )
    )
    

})

export {
    registerNewUser,
    loginUser,
}