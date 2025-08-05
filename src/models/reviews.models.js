import mongoose, { Schema } from "mongoose";

const reviewSchema = new Schema(
    {
        text: {
            type: String,
            trim: true,
        },
        starsCount: {
            type: Number,
            required: true,
        },
        userId: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: "User",
        },
        bookId: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: "Book",
        }
    },
    {
        timestamps: true,
    }
)