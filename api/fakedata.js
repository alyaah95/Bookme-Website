import mongoose from "mongoose";
import csv from "csv-parser";
import fs from "fs";
import { readFileSync } from 'fs';
import { faker } from '@faker-js/faker';
import dotenv from 'dotenv';

import Hotel from './models/Hotel.js';
import Room from './models/Room.js';
import User from './models/User.js';
import Review from './models/Review.js';

dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO);
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
  }
};

// Read image URLs from file
function readImageUrls(filename) {
  return readFileSync(filename, 'utf-8').split('\n').filter(Boolean);
}

const hotelImages = readImageUrls('hotel_images.txt');

// Function to read and parse the CSV file
const parseCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    const reviews = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => reviews.push(row))
      .on('end', () => resolve(reviews))
      .on('error', (error) => reject(error));
  });
};

// Offer mappings
const offerMappings = {
  "summer offer" : {
    title: "Summer Sale - save money from 10%",
    brief: "Book now and save on your summer vacation!",
    details: "Enjoy a luxurious stay at our hotel this summer and save 20% on all room bookings."
  },
  "weekend offer": {
    title: "Holiday Special - starts from 20% Off",
    brief: "Celebrate the holidays with our special offer.",
    details: "Celebrate the holidays with us and get 20% off on all room rates."
  }
};

const hotelTitles = [
  "Experience Luxury Like Never Before",
  "A Home Away From Home",
  "Relax and Rejuvenate",
  "Your Perfect Getaway",
  "Unwind in Style"
];

const roomTypes = [
  "Single", "Double", "Deluxe", "Suite", 
  "Executive", "Presidential", "Family", "Superior", "Standard"
];

const hotelDescriptionTemplates = [
  "Welcome to {name}, a premier {type} located in the heart of {city}. Our hotel offers a serene escape with top-notch amenities.",
  "Discover the perfect blend of comfort and convenience at {name}. Situated in {city}, our {type} is just {distance} from the city's main attractions.",
  "Experience elegance and sophistication at {name}, a renowned {type} in {city}.",
  "At {name}, we pride ourselves on offering a unique and memorable experience located in {city}.",
  "Welcome to {name}, your home away from home in {city}. Our {type} combines modern luxury with classic charm."
];

const roomDescriptionTemplates = [
  "The {title} is designed to provide ultimate comfort and relaxation. Includes {numBeds} beds and {numBathrooms} bathroom(s).",
  "Our {title} offers a luxurious and cozy atmosphere. Includes {numBeds} beds and {numBathrooms} bathroom(s).",
  "Experience the perfect blend of style and comfort in our {title}. Includes {numBeds} beds and {numBathrooms} bathroom(s).",
  "The {title} boasts a sophisticated design and top-tier facilities. Includes {numBeds} beds and {numBathrooms} bathroom(s).",
  "Indulge in the luxury of our {title}. Includes {numBeds} beds and {numBathrooms} bathroom(s)."
];

const generateRoomNumbers = (count) => {
  const roomNumbers = [];
  while (roomNumbers.length < count) {
    const randomNumber = faker.number.int({ min: 100, max: 700 });
    if (!roomNumbers.includes(randomNumber)) {
      roomNumbers.push({ number: randomNumber, unavailableDates: [] });
    }
  }
  return roomNumbers.sort((a, b) => a.number - b.number);
};

const generateRoomOffers = () => {
  const randomNumber = faker.number.int({ min: 1, max: 100 });
  if (randomNumber <= 10) {
    return [
      {
        offerKind: faker.helpers.arrayElement(['Discount', 'Last Minute', 'Early Bird']),
        priceBefore: 0,
        priceAfter: 0,
        percentageSaving: faker.number.int({ min: 10, max: 50 }),
        from: faker.date.recent(),
        to: faker.date.future()
      }
    ];
  } else {
    return [];
  }
};

async function generateHotelData(numHotels, numRooms) {
  const predefinedCities = ['Marsa Allam', 'Sharm El-Sheikh', 'Dahab','Hurgauda','Taba', 'Beirut','Tangier','Rome','Florence','Venice','London','Berlin','Madrid','Cairo','Dubai'];
  const numCities = predefinedCities.length;
  
  for (let i = 0; i < numHotels; i++) {
    const randomCityIndex = Math.floor(Math.random() * numCities);
    let name = faker.company.name();
    const type = faker.helpers.arrayElement(['hotel', 'apartment', 'resort', 'villa','cabin']);
    if (type === 'villa') name += " Villa";
    else if (type === 'hotel') name += " Hotel";
    else if (type === 'apartment') name += " Apartment";
    else if (type === 'resort') name += " Resort";
    else if (type === 'cabin') name += " Cabin";

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
      rating: faker.number.int({ min: 1, max: 5}),
      rooms: [],
      cheapestPrice: faker.number.int({ min: 50, max: 500 }),
      featured: faker.datatype.boolean(),
      offers: []
    });

    const offerKind = faker.helpers.arrayElement(Object.keys(offerMappings));
    const offer = offerMappings[offerKind];

    hotel.offers.push({
      title: offer.title,
      brief: offer.brief,
      details: offer.details,
      offerKind: offerKind
    });

    await hotel.save();

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

const createFakeUsers = async (num, reviewsFilePath) => {
  const hotels = await Hotel.find({ rooms: { $exists: true, $not: { $size: 0 } } }).populate('rooms');
  
  if (hotels.length === 0) {
    console.error("❌ No hotels with rooms found!");
    return;
  }

  const today = new Date();
  const reviewsData = await parseCSV(reviewsFilePath);

  for (let i = 0; i < num; i++) {
    const user = new User({
      username: faker.internet.userName(),
      email: faker.internet.email(),
      country: faker.location.country(),
      img: faker.image.avatar(),
      city: faker.location.city(),
      phone: faker.phone.number(),
      password: "password123", 
      CurrentBookings: [],
      HistoryBookings: [],
      isAdmin: false,
    });

    await user.save();

    const historyBookings = [];
    const numHistoryBookings = faker.number.int({ min: 1, max: 4 });

    for (let k = 0; k < numHistoryBookings; k++) {
      const hotel = faker.helpers.arrayElement(hotels);
      const roomId = faker.helpers.arrayElement(hotel.rooms);
      const room = await Room.findById(roomId);

      if (room) {
        const numberOfAdults = faker.number.int({ min: 1, max: 4 });
        const numberOfChildren = faker.number.int({ min: 0, max: 3 });
        const numberOfRooms = faker.number.int({ min: 1, max: 2 });

        const fromDate = faker.date.between({ from: '2023-01-01', to: today });
        const toDate = new Date(fromDate.getTime() + faker.number.int({ min: 2, max: 7 }) * 24 * 60 * 60 * 1000);
        const nights = Math.max(1, Math.ceil((toDate - fromDate) / (1000 * 60 * 60 * 24)));

        let roomPrice = room.price;
        if (room.offers && room.offers.length > 0 && room.offers[0].priceAfter) {
          roomPrice = room.offers[0].priceAfter;
        }

        const totalCost = (roomPrice * numberOfRooms) + (nights * hotel.cheapestPrice);

        const booking = {
          fromDate: fromDate.toISOString().split('T')[0],
          toDate: toDate.toISOString().split('T')[0],
          city: hotel.city,
          numberOfAdults,
          numberOfChildren,
          hotelName: hotel.name,
          numberOfRooms,
          roomNames: [room.title],
          hotelId: hotel._id,
          totalCost,
        };

        historyBookings.push(booking);

        const reviewData = faker.helpers.arrayElement(reviewsData);
        const reviewRating = Number(reviewData.Rating) || faker.number.int({ min: 3, max: 5 });
        const reviewComment = reviewData.Review || "Great stay and clean rooms!";

        const reviewDoc = new Review({
          userId: user._id,
          hotelId: hotel._id,
          rating: reviewRating,
          comment: reviewComment
        });

        await reviewDoc.save();
      }
    }

    user.HistoryBookings = historyBookings;
    await user.save();
  }
};

const reviewsFilePath = 'reviews.csv';

const runSeeder = async () => {
  try {
    await connectDB();
    console.log('Generating Hotels & Rooms...');
    await generateHotelData(40, 3);
    
    console.log('Generating Users, History Bookings & Reviews...');
    await createFakeUsers(20, reviewsFilePath);
    
    console.log(' All Fake Data Generated Successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error generating data:', error);
    process.exit(1);
  }
};

runSeeder();