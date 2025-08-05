import mongoose from "mongoose";
import { mongoDBName } from "../constants.js";

const connectDB = async () => {
    try
    {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URL}/${mongoDBName}`);
        console.log(`\n\nMongoDB connected\nDB HOST: ${connectionInstance.connection.host}`)
    }
    catch(e)
    {
        console.log("Error connecting mongoDB with server");
        process.exit(1);
    }
}


export default connectDB;