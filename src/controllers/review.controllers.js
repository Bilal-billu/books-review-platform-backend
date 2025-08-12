import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js"
import { Review } from "../models/review.models.js"
import { Book } from "../models/book.models.js";


const calculateBookRating = async (bookId) => {
    try
    {
        const book = await Book.findById(bookId);
        if(!book)
        {
            throw({
                code: 404,
                message: "Could not find book to update review."
            })
        }
        const allReviews = await Review.find({ bookId });
        const totalStars = allReviews?.reduce((acc, r) => acc + r.starsCount, 0) ;
        const averageRating = totalStars / allReviews?.length;
        book.rating = averageRating;
        await book.save();
        return allReviews
    }
    catch(e)
    {
        console.log(e)
        throw new ApiError(e.code || 500, e.message || "Could not update book reviews")
    }
}

const postNewReview = asyncHandler(async (req, res) => {
    const { text, starsCount, bookId } = req.body;
    const user = req.user;

    

    // 1. Validate inputs
    if (!text || text.trim() === "" || !starsCount || !bookId) {
        // res.status(400);
        throw new ApiError(400, 'Text, stars count, and book ID are required.');
    }

    // 2. Check if the book exists
    const book = await Book.findById(bookId);
    if (!book) {
        // res.status();
        throw new ApiError( 404,'Book not found.');
    }

    // 2.5. Check if the user has already reviewed this book
    const existingReview = await Review.findOne({ bookId, userId: user._id });
    if (existingReview) {
        // res.status(400);
        throw new ApiError(400, 'You have already reviewed this book.');
    }
    

    // 3. Create and save the review
    const review = await Review.create({
        text,
        starsCount,
        bookId: book._id,
        userId: user._id,
    });

    // const createdReview = await review.save();

    console.log("Here");

    const updatedBook = await calculateBookRating(bookId);

    // const allReviews = await Review.find({ bookId });
    // const totalStars = allReviews?.reduce((acc, r) => acc + r.starsCount, 0) ;
    // const averageRating = totalStars / allReviews?.length;
    // book.rating = averageRating;
    // await book.save();
    console.log(updatedBook);


    res.status(201).json(new ApiResponse(201, review,
        'Review created successfully.'
    ));
});



const getReviewsByBookId = asyncHandler(async (req, res) => {
    const { bookId } = req.params;

    if (!bookId) {
        // res.status(400);
        throw new ApiError(400, 'Book ID is required.');
    }

    const reviews = await Review.find({ bookId }) // adjust fields as needed

    res.status(200).json(new ApiResponse(
        200,
        reviews,
        "Fetched reviews successfully"
    ));
});

const updateReview = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { text, starsCount } = req.body;
    const user = req.user;
    const review = await Review.findById(id);
    if(!review)
    {
        throw new ApiError(404, "Review not found");
    }

    console.log("user", user);

    console.log("review", review)

    if(!user._id.equals(review.userId))
    {
        throw new ApiError(401, "You can only edit your own reviews.");
    }
    review.text = text;
    review.starsCount = starsCount;
    await review.save();

    const updatedBook = await calculateBookRating(review.bookId);
    console.log(updatedBook);

    return res.status(200)
    .json(new ApiResponse(
        201,
        review,
        "Review updated successfully."
    ))
})


export {
    postNewReview,
    getReviewsByBookId,
    updateReview
};