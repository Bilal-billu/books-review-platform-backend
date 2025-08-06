import jwt from "jsonwebtoken";
import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new Schema (
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        password: {
            type: String,
            required: true,
            trim: true,
        },
        role: {
            type: String,
            required: true,
            default: "User",
            enum: ["User", "Admin"],
        },
        refreshToken: {
            type: String,
        }
    },
    {
        timestamps: true,
    }
)

userSchema.pre("save", async function(next){
    // This function checks if any user is being updated/saved

    // If password is among the fields being updated, then it hashes the password
    // before performing the save function
    if(this.isModified("password"))
    {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
})

userSchema.methods.isPasswordCorrect = async function(password) {
    // This function is attached to all of the user instances.
    // It uses bcrypt to compare the password passed as argument and the hashed password.
    return await bcrypt.compare(password, this.password);
}

userSchema.methods.generateAccessToken = async function() {
    // This function is attached to all of the user instances.
    // It generates a token used for user auth.
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            name: this.name,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        },
    )
}

userSchema.methods.generateRefreshToken = async function() {
    // This function is attached to all of the user instances.
    // It generates a token used for user auth.
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        },
    )
}

export const User = mongoose.model("User", userSchema)