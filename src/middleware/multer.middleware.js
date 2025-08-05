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
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `${timestamp}_${file.originalname}`;
            cb(null, filename)
        }
    }
)

export const uploadOnMulter = multer({
    storage,
})
