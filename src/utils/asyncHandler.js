const asyncHandler = (fn) => async (req, res, next) => {
    try
    {
        console.log(req.body)
        await fn(req, res, next);
    }
    catch(e)
    {
        console.log("asyncHandler", e)
        res.status(e.code || 500).json({
            success: false,
            message: e.message || "An error occurred while handling your request."
        })
    }
}

export default asyncHandler