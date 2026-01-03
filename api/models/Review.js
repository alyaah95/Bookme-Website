import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // ربط مباشر بموديل اليوزر
    required: true,
  },
  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hotel", // ربط مباشر بموديل الفندق
    required: true,
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true,
  },
  comment: {
    type: String,
    required: true,
  },
}, { timestamps: true }); // هيضيف تاريخ التقييم تلقائياً

export default mongoose.model("Review", ReviewSchema);