import { Router } from "express";
import { verifyJWTToken } from "../middleware/userAuth.middleware.js";
import { postNewReview, updateReview } from "../controllers/review.controllers.js";

const reviewRouter = Router();
reviewRouter.route('/new-review').post(
    verifyJWTToken,
    postNewReview
);

reviewRouter.route('/update-review/:id').patch(
    verifyJWTToken,
    updateReview
)


export default reviewRouter