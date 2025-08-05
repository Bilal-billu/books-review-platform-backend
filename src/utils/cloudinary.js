import { v2 as cloudinary } from "cloudinary";
import fs from "fs";


cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET,
});



const uploadFileOnCloudinary = async (localFilePath) => {
    try
    {
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
        });
        return response;
    }
    catch(e)
    {
        console.log("Error uploading file to cloud");
        return null;
    }
    finally
    {
        fs.unlink(localFilePath)
    }
}


export { uploadFileOnCloudinary }