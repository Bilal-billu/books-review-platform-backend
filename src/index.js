import dotenv from "dotenv";
import connectDB from "./database/index.js";
import { app } from "./app.js"

dotenv.config({
    path: "./.env",
});

const port = process.env.PORT_NUMBER || 8000;

const serverStartMessage = `
 __________________________
|      Server Started      |
 --------------------------
|        PORT: ${port}     |
 ==========================
 __________________________
`

connectDB().then(
    ()=>{
        app.listen(port)
        console.log(`\n\n${serverStartMessage}\n`)
    }
).catch(e => {
    console.log("Error connecting server.\n\n")
    console.log(e)
})
