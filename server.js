import app from "./app.js";
import dotenv from "dotenv";
import connectDb from "./config/database.js";

dotenv.config();
//connection to database
connectDb();
const PORT = process.env.PORT || 5001;

const server = app.listen(PORT, () => {
  console.log(`Server is running on the port ${PORT}`);
});
