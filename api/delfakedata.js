import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Hotel from './models/Hotel.js';
import Room from './models/Room.js';
import User from './models/User.js';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const deleteAllData = async () => {
  try {
    const deletedHotels = await Hotel.deleteMany({});
    console.log(`Deleted ${deletedHotels.deletedCount} hotels.`);

    const deletedRooms = await Room.deleteMany({});
    console.log(`Deleted ${deletedRooms.deletedCount} rooms.`);

    const deletedUsers = await User.deleteMany({});
    console.log(`Deleted ${deletedUsers.deletedCount} users.`);

    console.log('All data has been completely erased from the database!');
  } catch (error) {
    console.error('Error deleting data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  }
};

const clearDatabase = async () => {
  await connectDB();
  await deleteAllData();
};

clearDatabase();