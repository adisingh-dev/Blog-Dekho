const ErrorHandler = (error, req, res, next) => {
    error.statusCode = error.statusCode || 500;
    error.message = error.message || "Something went wrong. Please try again later";
    res.status(error.statusCode).json({
        statusCode: error.statusCode,
        message: error.message
    });
};

export default ErrorHandler;