import mongoose, { Schema } from "mongoose";

const bookSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
        },
        author: {
            // A book may have multiple authors
            type: [String],
            required: true,
            // Validator function to see if at least one author is being provided
            validate: {
                validator: function (value) {
                    return Array.isArray(value) && value.length > 0;
                },
                message: 'At least one author is required.'
            },
        },
        genre: {
            // A book may have multiple genres
            type: [String],
            required: true,
            // Validator function to see if at least one genre is being provided
            validate: {
                validator: function (value) {
                    return Array.isArray(value) && value.length > 0;
                },
                message: 'At least one author is required.'
            }
        },
        coverImageUrl: {
            type: String,
        },
        rating: {
            type: Number,
            required: true,
            default: 0,
        },
        addedBy: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: "User",
        },
    },
    {
        timestamps: true,
    }
)

export const Book = mongoose.model("Book", bookSchema);