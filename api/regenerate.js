import mongoose from "mongoose";
import csv from "csv-parser";
import fs from "fs";

//mport * as faker from '@faker-js/faker';
import { faker } from '@faker-js/faker';
import dotenv from 'dotenv';

// import { company, address, random, date } from '@faker-js/faker';
import { readFileSync } from 'fs';
import Hotel from './models/Hotel.js';
import Room from './models/Room.js';


 const company = faker.company;
// const address = faker.address;
// const random = faker.random;
// const date = faker.date;

dotenv.config();

// Connect to MongoDB


// Debugging: Check if the environment variable is loaded
// console.log('MongoDB URI:', process.env.MONGO);

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(`mongodb+srv://lilo:a2002lolo2002@cluster0.mfb98yv.mongodb.net/booking?retryWrites=true&w=majority&appName=Cluster0`, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1); // Exit the process with a status code of 1
  }
};
connectDB();
const deleteAllHotelsAndRooms = async () => {
  try {
    const resultRooms = await Room.deleteMany({});
    const resultHotels = await Hotel.deleteMany({});
    console.log(`Deleted ${resultRooms.deletedCount} rooms.`);
    console.log(`Deleted ${resultHotels.deletedCount} hotels.`);
  } catch (err) {
    console.error("Error deleting hotels and rooms:", err);
  }
};
async function generateHotelData(numHotels, numRooms) {
  const predefinedCities = ['Marsa Allam', 'Sharm El-Sheikh', 'Dahab','Hurgauda','Taba', 'Beirut','Tangier','Rome','Florence','Venice','London','Berlin','Madrid','Cairo','Dubai']; // Add your predefined cities here
  const numCities = predefinedCities.length; // Add this line
  for (let i = 0; i < numHotels; i++) {
    const randomCityIndex = Math.floor(Math.random() * numCities);
    let name = faker.company.name();
    const type = faker.helpers.arrayElement(['hotel', 'apartment', 'resort', 'villa','cabin']);
    if (type === 'villa') {
      name += " Villa";
    } else if (type === 'hotel') {
      name += " Hotel";
    } else if (type === 'apartment') {
      name += " Apartment";
    } else if (type === 'resort') {
      name += " Resort";
    }else if (type === 'cabin') {
        name += " Cabin";
      }
    const city = predefinedCities[randomCityIndex];
    const distance = `${faker.number.int({ min: 1, max: 20 })} km`;
    
    const hotel = new Hotel({
      name,
      type,
      city,
      address: faker.location.streetAddress(),
      distance,
      photos: [
        faker.helpers.arrayElement(hotelImages),
        faker.helpers.arrayElement(hotelImages),
        faker.helpers.arrayElement(hotelImages)
      ],
      title: faker.helpers.arrayElement(hotelTitles),
      desc: faker.helpers.arrayElement(hotelDescriptionTemplates)
              .replace("{name}", name)
              .replace("{type}", type)
              .replace("{city}", city)
              .replace("{distance}", distance),
      rating: faker.number.int({ min: 0, max: 5}),
      rooms: [],
      cheapestPrice: faker.number.int({ min: 50, max: 500 }),
      featured: faker.datatype.boolean(),
      offers: []
    });    // Generate offers for the hotel
        const offerKind = faker.helpers.arrayElement(Object.keys(offerMappings));
        const offer = offerMappings[offerKind];
    
        hotel.offers.push({
          title: offer.title,
          brief: offer.brief,
          details: offer.details,
          offerKind: offerKind
        });
    
        for (let j = 0; j < numRooms; j++) {
          const roomTitle = faker.helpers.arrayElement(roomTypes) + " Room";
          const numBeds = faker.number.int({ min: 1, max: 4 });
          const numBathrooms = faker.number.int({ min: 1, max: 2 });
          const roomNumbersCount = faker.helpers.arrayElement([2, 4]);
    
          const room = new Room({
            title: roomTitle,
            price: faker.number.int({ min: 50, max: 500 }),
            maxPeople: faker.number.int({ min: 1, max: 4 }),
            desc: faker.helpers.arrayElement(roomDescriptionTemplates)
              .replace("{title}", roomTitle)
              .replace("{numBeds}", numBeds)
              .replace("{numBathrooms}", numBathrooms),
            roomNumbers: generateRoomNumbers(roomNumbersCount),
            offers: generateRoomOffers(),
            hotelId: hotel._id
          });
    
          const savedRoom = await room.save();
          hotel.rooms.push(savedRoom._id);
        }
    
        await hotel.save();
      }
    }

const runScript = async () => {
  await connectDB();
  await generateHotelData(10, 5);
  console.log('Rooms and Hotels regenerated!');
  process.exit(0);
};

runScript();

 