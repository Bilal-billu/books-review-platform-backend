import { Book } from "../models/book.models.js";
import { Review } from "../models/review.models.js";
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

    const { title, author, genre, description } = req.body;
    
    const filePath = req.file.path;
    const user = req.user;
    console.log(title)
    if([title, description].some(field => field.trim() === ""))
    {
        throw new ApiError(400, "Required fields are missing");
    }
    if(genre.length < 1 || author.length < 1)
    {
        throw new ApiError(400, "Required fields are missing");
    }
    // console.log("title, author, genre");
    // console.log(user);
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
        description,
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

const editBooks = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { title, author, genre, description } = req.body;
    if(!id)
    {
        return new ApiError(400, 'No id found');
    }

    const user = req.user;
    if(user.role !== "Admin")
    {
        throw new ApiError(401, "Unauthorized")
    }
    if (!title || !author || !genre || !description) {
        return new ApiError(400, 'Title, author, description and genre are required.');
    }
    if (!author.length || !genre.length) {
        return new ApiError(400, 'Author and genre cannot be empty arrays.' );
    }

    const book = await Book.findById(id)
    if (!book) {
      throw new ApiError(404, 'Book not found');
    }

    const filePath = req.file ? req.file.path : null;

    const updateData = {
        title,
        author,
        genre,
        description,
    };
    if (filePath) {
        updateData.filePath = filePath;
    }
    
    const updatedBook = await Book.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedBook) {
        return new ApiError(400, 'Book not found.');
    }

    return res.status(200)
    .json(new ApiResponse(200, updatedBook, 'Book updated successfully'));
})

const getBookById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new ApiError(400, 'Invalid book ID format');
    }

    const book = await Book.findById(id);

    if (!book) {
      throw new ApiError(404, 'Book not found');
    }

    const reviews = await Review.find({ bookId: book._id }).populate("userId", "name email");

    return res.status(200)
    .json(new ApiResponse(
        200, {
            book,
            reviews,
        }, "Book returned."
    ))

})

const deleteBookById = asyncHandler(async (req, res) => {
    try
    {
        const { id } = req.params;
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            throw({
                code: 400,
                message: `Invalid book ID format`
            })
        //   return res.status(400).json({ message: 'Invalid book ID format' });
        }
        const deletedBook = await Book.findByIdAndDelete(id);

        if (!deletedBook) {
            throw({
                code: 404,
                message: `Book not found`
            })
        //   return res.status(404).json({ message: 'Book not found' });
        }

        return res.status(200).json(
            new ApiResponse(200, deletedBook, "Book deleted successfully.")
        );
        }
    catch(e)
    {
        throw new ApiError(e.code || 500, e.message || "Unknown error occurred.")
    }
})


export {
    getAllBooks,
    addNewBook,
    editBooks,
    getBookById,
    deleteBookById,
}