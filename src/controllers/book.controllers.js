import { Book } from "../models/book.models.js";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";



const getAllBooks = asyncHandler(async (req, res) => {
    let { limit, page } = req.query;
    if(!(Number(limit)))
    {
        limit = 0;
    }
    if(!(Number(page)))
    {
        page = 0;
    }
    const calculatedLimit = Math.max(parseInt(limit), 30);
    const calculatedPage = Math.max(parseInt(page), 1);
    const skipAhead = (calculatedPage - 1) * calculatedLimit;


    const allBooks = await Book.find({}).skip(skipAhead).limit(calculatedLimit);
    if(!allBooks)
    {
        throw new ApiError(404, "Error getting books");
    }
    return res.status(200)
    .json(new ApiResponse(
        200,
        {
            books: allBooks,
            meta: {
                page: calculatedPage,
                limit: calculatedLimit,
            },
        },
        "All books returned successfully"
    ))
})

const addNewBook = asyncHandler(async (req, res) => {

    const { title, author, genre } = req.body;
    
    const filePath = req.file.path;
    const user = req.user;
    if([title].some(field => field.trim() === ""))
    {
        throw new ApiError(400, "Required fields are missing");
    }
    if(genre.length < 1 || author.length < 1)
    {
        throw new ApiError(400, "Required fields are missing");
    }
    console.log("title, author, genre");
    console.log(user);
    if(!filePath)
    {
        throw new ApiError(500, "Failed to upload file");
    }
    if(!user)
    {
        throw new ApiError(400, "Failed to authenticate.");
    }

    
    if(user.role === "User")
    {
        throw new ApiError(401, "Unauthorized user.")
    }
    console.log(user)

    const data = {
        title,
        author,
        genre,
        coverImageUrl: filePath,
        rating: 0,
        addedBy: user._id,
    }

    console.log(data)

    const book = await Book.create(data);
    

    
    return res.status(200)
    .json(new ApiResponse(200,
        book,
        "New book added"
    ))
})



export {
    getAllBooks,
    addNewBook,

}