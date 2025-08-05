import multer from "multer";

const uploadPath = `./public/temp`
const storage = multer.diskStorage(
    {
        destination: function (req, file, cb)
        {
            cb(null, uploadPath)
        },
        filename: function(req, file, cb)
        {
            const timestampName = new Date().toISOString().replace("T", "_").replace("Z", file.originalname)
            cb(null, timestampName)
        }
    }
)

export const uploadOnMulter = multer({
    storage,
})
