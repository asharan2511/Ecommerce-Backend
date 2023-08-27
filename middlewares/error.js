import ErrorHandler from "../utils/errorHandler.js";

const errorMiddleware = (err, req, res, next) => {
  console.log("hello");
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";

  //MongoDB error
  if (err.name === "CastError") {
    const message = `Resource not Found. Invalid: ${err.path}`;
    err = new ErrorHandler(message, 404);
  }
  //Mongoose Duplicate key error
  if (err.code === 11000) {
    const message = `Duplicate ${Object.keys(err.keyValue)} Entered`;
    err = new ErrorHandler(message, 404);
  }

  // Wrong JWT error
  if (err.name === "JsonWebTokenError") {
    const message = `Json Web Token is invalid, Try again `;
    err = new ErrorHandler(message, 400);
  }

  // JWT EXPIRE error
  if (err.name === "TokenExpiredError") {
    const message = `Json Web Token is Expired, Try again `;
    err = new ErrorHandler(message, 400);
  }

  res.status(err.statusCode).json({ success: false, error: err.message });
};
export default errorMiddleware;
