import express from "express";
import cors from "cors"
import cookieParser from "cookie-parser";

import userRouter from "./routes/user.routes.js";
import bookRouter from "./routes/book.routes.js";

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials:true
}));


app.use(express.json({
    limit: "20kb",
}))

app.use(express.urlencoded({
    extended: true,
    limit: "20kb",
}))

app.use(express.static("public"));
app.use(cookieParser())

const prefix = `/api`


app.use(`${prefix}/user`, userRouter);
app.use(`${prefix}/book`, bookRouter);

export { app }