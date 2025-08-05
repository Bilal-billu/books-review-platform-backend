import { Router } from "express";
import { verifyJWTToken } from "../middleware/userAuth.middleware.js";
import { uploadOnMulter } from "../middleware/multer.middleware.js";
import { addNewBook, getAllBooks } from "../controllers/book.controllers.js";


const bookRouter = Router();

bookRouter.route('/add').post(
    verifyJWTToken,
    uploadOnMulter.single('coverImage'),
    addNewBook
);
bookRouter.route('/').get(getAllBooks)


export default bookRouter;