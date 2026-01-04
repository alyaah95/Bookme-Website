import express from "express";
import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import authRoute from "./routes/auth.js";
import usersRoute from "./routes/users.js";
import hotelsRoute from "./routes/hotels.js";
import roomsRoute from "./routes/rooms.js";
import reviewsRoute from "./routes/reviews.js";
import cookieParser from "cookie-parser";
import cors from "cors";


const app = express();


const connect = async () => {
  try {
    await mongoose.connect(process.env.MONGO);
    console.log("Connected to mongoDB.");
  } catch (error) {
    throw error;
  }
};

mongoose.connection.on("disconnected", () => {
  console.log("mongoDB disconnected!");
});

connect();

//middlewares
app.use(cors({
  origin: "http://localhost:3000", // 🚀 ده لازم يكون الـ Origin بتاع الـ Frontend بتاعك
  credentials: true,               // 🚀 ده لازم يكون True عشان تسمحي باستقبال الـ Cookies
}));
app.use(cookieParser())
app.use(express.json());

app.use("/api/auth", authRoute);
app.use("/api/users", usersRoute);
app.use("/api/hotels", hotelsRoute);
app.use("/api/rooms", roomsRoute);
app.use("/api/reviews", reviewsRoute);

app.use((err, req, res, next) => {
  const errorStatus = err.status || 500;
  const errorMessage = err.message || "Something went wrong!";
  return res.status(errorStatus).json({
    success: false,
    status: errorStatus,
    message: errorMessage,
    stack: err.stack,
  });
});

// app.listen(8800, () => {
//   connect();
//   console.log("Connected to backend.");
// });

export default app;
