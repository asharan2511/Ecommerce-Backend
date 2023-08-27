import express from "express";
import productRouter from "./routes/products.js";
import errorMiddleware from "./middlewares/error.js";
import userRouter from "./routes/user.js";
import cookieParser from "cookie-parser";
import orderRouter from "./routes/order.js";
const app = express();

//middlewares
app.use(express.json());

//middleware for Error
app.use(errorMiddleware);
app.use(cookieParser());

//routes
app.use("/api/v1", productRouter);
app.use("/api/v1", userRouter);
app.use("/api/v1", orderRouter);

export default app;
