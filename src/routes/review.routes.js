import { Router } from "express";
import { verifyJWTToken } from "../middleware/userAuth.middleware.js";
import { postNewReview } from "../controllers/review.controllers.js";

const reviewRouter = Router();
reviewRouter.route('/new-review').post(
    verifyJWTToken,
    postNewReview
);


export default reviewRouter