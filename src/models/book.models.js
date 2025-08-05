import mongoose, { Schema } from "mongoose";

const bookSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
        },
        author: {
            type: String,
            required: true,
        },
        genre: {
            type: String,
            required: true,
        },
        coverImageUrl: {
            type: String,
        },
        rating: {
            type: Number,
            required: true,
            default: 0,
        }
    },
    {
        timestamps: true,
    }
)

export const Book = mongoose.model("Book", bookSchema);