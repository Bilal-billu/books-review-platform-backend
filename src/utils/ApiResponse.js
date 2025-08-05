class ApiResponse
{
    constructor (
        stausCode,
        data,
        message = "Success",
    ) {
        this.message = message;
        this.stausCode = stausCode;
        this.data = data;

        this.success = stausCode < 400;
    }
}

export { ApiResponse }