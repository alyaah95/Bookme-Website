import Review from "../models/Review.js";
import User from "../models/User.js";
import { createError } from "../utils/error.js";
import Hotel from "../models/Hotel.js";




export const createReview = async (req, res, next) => {
  try {
    if (!req.user) return next(createError(401, "You are not authenticated!"));

    const { rating, comment } = req.body;
    const userId = req.user.id || req.user._id;
    const hotelIdFromParams = req.params.id.trim();

    const user = await User.findById(userId);
    if (!user) return next(createError(404, "User not found!"));

    // --- تعديل المقارنة لتطابق هيكل البيانات الفعلي ---
    const hasStayed = user.HistoryBookings.some(booking => {
      // إذا كان الـ hotelId داخل ReservationDetails كما في الفرونت أند:
      const idInHistory = booking.ReservationDetails?.[0]?.hotelId || booking.hotelId;
      
      
      return String(idInHistory) === String(hotelIdFromParams);
    });

    if (!hasStayed) {
      // هذا الخطأ 403 هو ما يجعلك تذهبين لصفحة الـ Login في الفرونت أند
      return next(createError(403, "You must stay at the hotel to review it!"));
    }

    const newReview = new Review({
      userId,
      hotelId: hotelIdFromParams,
      rating,
      comment,
    });

    const savedReview = await newReview.save();
    res.status(201).json(savedReview);

  } catch (err) {
    console.error("Review Error Log:", err.message);
    next(err);
  }
};
export const getHotelReviews = async (req, res, next) => {
  try {
    // جلب كل الريفيوهات للفندق مع عمل populate لبيانات اليوزر (اسمه وصورته)
    const reviews = await Review.find({ hotelId: req.params.id })
                                .populate("userId", "username img");
    
    res.status(200).json(reviews);
  } catch (err) {
    next(err);
  }
};

export const getUserReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ userId: req.params.userId }).populate("hotelId", "name");
    res.status(200).json(reviews);
  } catch (err) { next(err); }
};