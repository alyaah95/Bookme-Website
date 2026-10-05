import mongoose from "mongoose";
import Hotel from './models/Hotel.js';
import Room from './models/Room.js';
import dotenv from 'dotenv';

dotenv.config();

const fixRelationships = async () => {
  try {
    const mongoURI = process.env.MONGO ;
    
    await mongoose.connect(mongoURI);
    console.log("Connected to MongoDB...");

    const allHotels = await Hotel.find(); 
    console.log(`Found ${allHotels.length} hotels. Starting repair...`);

    for (let hotel of allHotels) {
      if (hotel.rooms && hotel.rooms.length > 0) {
        const result = await Room.updateMany(
          { _id: { $in: hotel.rooms } }, 
          { $set: { hotelId: hotel._id } } 
        );
        console.log(`Hotel [${hotel.name}]: Updated ${result.modifiedCount} rooms.`);
      }
    }

    console.log(" All relationships have been fixed!");
    process.exit(0);
  } catch (err) {
    console.error(" Error fixing data:", err);
    process.exit(1);
  }
};

fixRelationships();