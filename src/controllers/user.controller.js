import { Review } from "../models/review.models.js";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js"
import jwt from "jsonwebtoken"


const generateAccessAndRefreshToken = async (userId) => {
    try
    {
        const user = await User.findById(userId);
        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({
            validateBeforeSave: false,
        });
        return { accessToken, refreshToken }
    }
    catch(e)
    {
        console.log("Error generating tokens.")
        console.log(e)
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
    console.log(accessToken, refreshToken);
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

const logoutUser = asyncHandler(async (req, res) => {
    const user = 
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1
            },
        },
        {
            new: true,
        },
    )

    console.log(user)


    
    return res.status(200)
    .clearCookie("accessToken", cookieOptionsSecure)
    .clearCookie("refreshToken", cookieOptionsSecure)
    .json(
        new ApiResponse(
            200,
            {},
            "User logged out successfully"
        )
    )
})

const regenerateAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    try
    {
        if(!incomingRefreshToken)
        {
            throw({
                message: "No token found for user."
            })
        }
        const decodedRefreshToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findById(decodedRefreshToken._id);
        if(!user)
        {
            throw({
                // code: 404,
                message: "User not found.",
            })
        }
        // console.log("incoming", incomingRefreshToken);
        // console.log("user", user.refreshToken);
        
        if(incomingRefreshToken !== user.refreshToken)
        {
            throw({
                message: "Unmatched auth."
            })
        }
        const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);
        return res.status(200)
        .cookie("accessToken", accessToken, cookieOptionsSecure)
        .cookie("refreshToken", refreshToken, cookieOptionsSecure)
        .json(new ApiResponse(
            200,
            {
                accessToken,
                refreshToken,
            },
            "User verified."
        ))
    }
    catch(e)
    {
        throw new ApiError(
            e.code || 401,
            e.message || "Invalid token"
        )
    }
})


const getMe = async (req, res) => {
  try {
    const incomingUser = req.user;
    
    const user = await User.findById(incomingUser.id).select('-password -refreshToken');

    if (!user) {
      return new ApiError(404, 'User not found');
    }

    // Return user data
    return res.status(200)
    .json(new ApiResponse(200, user, "User authenticated"))

  } catch (err) {
    console.error('Auth error:', err.message);
    return new ApiError(401, 'Invalid or expired token');
  }
}



//=============================
const getAllUsers = async (req, res) => {
  try {
    const isAdmin = req.user;
    if(!isAdmin || isAdmin.role !== "Admin" )
    {
        return new ApiError(401, 'Unauthorized');
    }
    const users = await User.find().select('-password -refreshToken');

    return res.status(200).json(new ApiResponse(200, users, 'All users retrieved successfully'));
  } catch (err) {
    console.error('Get all users error:', err.message);
    return new ApiError(500, 'Failed to retrieve users');
  }
};

const deleteUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = req.user;
    if(!user || user.role !== "Admin")
    {
        return new ApiError(401, 'Unauthorized');
    }

    await Review.deleteMany({ userId: userId });

    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return new ApiError(404, 'User not found');
    }

    return res.status(200).json(new ApiResponse(200, null, 'User deleted successfully'));
  } catch (err) {
    console.error('Delete user error:', err.message);
    return new ApiError(500, 'Failed to delete user');
  }
};

const getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const isAdmin = req.user;

    if(!isAdmin || isAdmin.role !== "Admin")
    {
        throw new ApiError(401, "Unauthorized");
    }

    const user = await User.findById(userId).select('-password -refreshToken');

    if (!user) {
      return new ApiError(404, 'User not found');
    }

    return res.status(200).json(new ApiResponse(200, user, 'User retrieved successfully'));
  } catch (err) {
    console.error('Get user by ID error:', err.message);
    return new ApiError(500, 'Failed to retrieve user');
  }
};

const getUserByEmail = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return new ApiError(400, 'Email is required');
    }

    const user = await User.findOne({ email }).select('-password -refreshToken');

    if (!user) {
      return new ApiError(404, 'User not found');
    }

    return res.status(200).json(new ApiResponse(200, user, 'User retrieved successfully'));
  } catch (err) {
    console.error('Get user by email error:', err.message);
    return new ApiError(500, 'Failed to retrieve user');
  }
};


const changeUserRole = async (req, res) => {
  try {
    // const { id: userId } = req.params;
    const { role, userId } = req.body;

    if (!role) {
      return new ApiError(400, 'New role is required');
    }

    const isAdmin = req.user;
    if( !isAdmin || isAdmin.role !== "Admin")
    {
        throw new ApiError(401, "Unauthorized");
    }

    const user = await User.findById(userId);

    if (!user) {
      return new ApiError(404, 'User not found');
    }

    user.role = role;
    await user.save();

    const responseData = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    return res.status(200).json(new ApiResponse(200, responseData, 'User role updated successfully'));
  } catch (err) {
    console.error('Change user role error:', err.message);
    return new ApiError(500, 'Failed to update user role');
  }
};

const updateUserViaAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, role } = req.body;

    const isAdmin = req.user;

    if(!isAdmin || isAdmin.role !== "Admin")
    {
        throw new ApiError(401, "Unauthorized")
    }

    const user = await User.findById(id);

    if (!user) {
      return new ApiError(404, 'User not found');
    }

    // Update fields only if they are provided
    if (name) user.name = name;
    if (email)
    {
        const existingUser = await User.findOne({
            email
        })
    
        if(existingUser && existingUser._id.toString() !== id)
        {
            console.log("No")
            throw new ApiError(400, "User already exists")
        }
        user.email = email.toLowerCase();
    }
    if (role) user.role = role;
    if (password) user.password = password; // Assume pre-save hook hashes password



    await user.save();

    const responseData = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    return res.status(200).json(new ApiResponse(200, responseData, 'User updated successfully'));
  } catch (err) {
    console.error('Update user error:', err.message);
    return new ApiError(500, 'Failed to update user');
  }
};



export {
    registerNewUser,
    loginUser,
    logoutUser,
    regenerateAccessToken,
    getMe,
    getAllUsers,
    deleteUserById,
    getUserById,
    getUserByEmail,
    updateUserViaAdmin,
}