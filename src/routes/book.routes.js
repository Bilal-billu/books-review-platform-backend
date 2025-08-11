import { Router } from "express";
import { verifyJWTToken } from "../middleware/userAuth.middleware.js";
import { uploadOnMulter } from "../middleware/multer.middleware.js";
import {
    addNewBook,
    editBooks,
    getAllBooks,
    getBookById,
    deleteBookById,


} from "../controllers/book.controllers.js";


const bookRouter = Router();

bookRouter.route('/add').post(
    verifyJWTToken,
    uploadOnMulter.single('coverImage'),
    addNewBook
);
bookRouter.route('/').get(getAllBooks)
bookRouter.route('/:id').get(getBookById)
bookRouter.route('/update/:id').patch(
    verifyJWTToken,
    uploadOnMulter.single("coverImage"),
    editBooks
)

bookRouter.route('/:id').delete(
    verifyJWTToken,
    deleteBookById
);

export default bookRouter;