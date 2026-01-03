import mongoose from "mongoose";
import Hotel from './models/Hotel.js';
import Room from './models/Room.js';
import dotenv from 'dotenv';

dotenv.config();

const fixRelationships = async () => {
  try {
    // استخدمي الرابط المباشر لو MONGO مش مقروءة من الـ .env
    const mongoURI = process.env.MONGO || `mongodb+srv://lilo:a2002lolo2002@cluster0.mfb98yv.mongodb.net/booking?retryWrites=true&w=majority&appName=Cluster0`;
    
    await mongoose.connect(mongoURI);
    console.log("Connected to MongoDB...");

    // التعديل هنا: نستخدم Hotel (الموديل) وليس hotels
    const allHotels = await Hotel.find(); 
    console.log(`Found ${allHotels.length} hotels. Starting repair...`);

    for (let hotel of allHotels) {
      if (hotel.rooms && hotel.rooms.length > 0) {
        // تحديث كل الغرف اللي الـ ID بتاعها موجود في مصفوفة الفندق ده
        const result = await Room.updateMany(
          { _id: { $in: hotel.rooms } }, 
          { $set: { hotelId: hotel._id } } 
        );
        console.log(`Hotel [${hotel.name}]: Updated ${result.modifiedCount} rooms.`);
      }
    }

    console.log("✅ All relationships have been fixed!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error fixing data:", err);
    process.exit(1);
  }
};

fixRelationships();