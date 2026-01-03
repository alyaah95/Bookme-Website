import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import csv from "csv-parser";
import User from "./models/User.js";
import Hotel from "./models/Hotel.js";
import Review from "./models/Review.js";

dotenv.config();

const loadCSVReviews = () => {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream("reviews.csv")
      .pipe(csv())
      .on("data", (data) => {
        // تأكدي من مسميات الأعمدة في الـ CSV (لو Review و Rating كابيتال سيبيهم كدة)
        if (data.Review && data.Rating) {
          results.push({
            comment: data.Review,
            rating: parseInt(data.Rating)
          });
        }
      })
      .on("end", () => resolve(results))
      .on("error", (err) => reject(err));
  });
};

const massSeedWithCSV = async () => {
  try {
    await mongoose.connect(process.env.MONGO);
    console.log("Connected to MongoDB...");

    const csvReviews = await loadCSVReviews();
    console.log(`Loaded ${csvReviews.length} reviews from CSV.`);

    // 1. تنظيف الداتا القديمة
    await Review.deleteMany({});
    await User.updateMany({}, { $set: { HistoryBookings: [], CurrentBookings: [] } });

    const allUsers = await User.find();
    const allHotels = await Hotel.find();

    for (const user of allUsers) {
      // اختيار فنادق عشوائية لكل مستخدم
      const shuffledHotels = allHotels.sort(() => 0.5 - Math.random());
      const selectedForHistory = shuffledHotels.slice(0, 2);
      const selectedForCurrent = shuffledHotels.slice(2, 3);

      // 2. إنشاء بيانات الحجوزات يدوياً عشان نضمن الـ structure
      const historyEntries = selectedForHistory.map(hotel => ({
        fromDate: "2024-03-01",
        toDate: "2024-03-05",
        city: hotel.city || "City",
        hotelName: hotel.name,
        totalCost: 1200,
        ReservationDetails: [{ 
            hotelId: hotel._id.toString(), 
            selectedRoomsNums: ["201"], 
            roomtitle: "Standard Room" 
        }]
      }));

      const currentEntries = selectedForCurrent.map(hotel => ({
        fromDate: "2025-06-01",
        toDate: "2025-06-10",
        city: hotel.city || "City",
        hotelName: hotel.name,
        totalCost: 2000,
        ReservationDetails: [{ 
            hotelId: hotel._id.toString(), 
            selectedRoomsNums: ["305"], 
            roomtitle: "Deluxe Room" 
        }]
      }));

      // 3. تحديث اليوزر
      await User.findByIdAndUpdate(user._id, {
        $set: { 
            HistoryBookings: historyEntries,
            CurrentBookings: currentEntries
        }
      });

      // 4. إنشاء الريفيوهات (هنا كان الخطأ، دلوقتي بنستخدم historyEntries مباشرة)
      for (const entry of historyEntries) {
        if (csvReviews.length > 0) {
          const randomCSV = csvReviews[Math.floor(Math.random() * csvReviews.length)];
          
          const realReview = new Review({
            userId: user._id,
            hotelId: entry.ReservationDetails[0].hotelId, // السطر ده بقى آمن
            rating: randomCSV.rating || 5,
            comment: randomCSV.comment || "Good experience!"
          });
          await realReview.save();
        }
      }
      console.log(`User ${user.username} - Bookings & Reviews Synced.`);
    }

    console.log("✅ DONE! Database is now populated with real CSV reviews.");
    process.exit();
  } catch (err) {
    console.error("❌ Seeding failed:", err.message);
    process.exit(1);
  }
};

massSeedWithCSV();