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
import User from './models/User.js';

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

// const deleteFakeDataExceptSome = async () => {
//   try {
//     // Example criteria for hotels to keep
//     const hotelIdsToKeep = ['6648ac6662e57e26848dc1f2']; // Replace with actual IDs
//     const resultHotel = await Hotel.deleteMany({ _id: { $nin: hotelIdsToKeep } });
//     console.log('Hotels except specified ones deleted:', resultHotel.deletedCount);
    
//     // Example criteria for rooms to keep
//     const roomIdsToKeep = ['66490d7c373a7380180ade41', '665610032a5820f69091e66d', '66577a5588215d855b5d1ac7']; // Replace with actual IDs
//     const resultRoom = await Room.deleteMany({ _id: { $nin: roomIdsToKeep } });
//     console.log('Rooms except specified ones deleted:', resultRoom.deletedCount);
    
//     // Uncomment and use the following lines for users if needed
//     // Example criteria for users to keep
//     const userIdsToKeep = ['6574cceb3b420b5aeba458af', '663b5c06c71d6f1ca41545f8','665906708a8a284827121d6d']; // Replace with actual IDs
//     const resultUser = await User.deleteMany({ _id: { $nin: userIdsToKeep } });
//     console.log('Users except specified ones deleted:', resultUser.deletedCount);
    
//   } catch (error) {
//     console.error('Error deleting data:', error);
//   } finally {
//     mongoose.disconnect();
//   }
// };

// const clearDatabaseExceptSome = async () => {
//   await connectDB();
//   await deleteFakeDataExceptSome();
// };

// clearDatabaseExceptSome();



// Read image URLs from file
function readImageUrls(filename) {
  return readFileSync(filename, 'utf-8').split('\n').filter(Boolean);
}

// Load hotel images from file
const hotelImages = readImageUrls('hotel_images.txt');



// Function to read and parse the CSV file
const parseCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    const reviews = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        reviews.push(row);
      })
      .on('end', () => {
        resolve(reviews);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
};


// Offer mappings
const offerMappings = {
  "summer offer" : {
    title: "Summer Sale - save money from 10%",
    brief: "Book now and save on your summer vacation!",
    details: "Enjoy a luxurious stay at our hotel this summer and save 20% on all room bookings. Offer valid for stays between June and August."
  },
  "weekend offer": {
    title: "Holiday Special - starts from 20% Off",
    brief: "Celebrate the holidays with our special offer.",
    details: "Celebrate the holidays with us and get 20% off on all room rates. Offer valid for stays between November and January."
  }
};

const hotelTitles = [
  "Experience Luxury Like Never Before",
  "A Home Away From Home",
  "Relax and Rejuvenate",
  "Your Perfect Getaway",
  "Unwind in Style"
];

// Predefined room type descriptors
const roomTypes = [
  "Single",
  "Double",
  "Deluxe",
  "Suite",
  "Executive",
  "Presidential",
  "Family",
  "Superior",
  "Standard"
];

// Detailed hotel description templates
const hotelDescriptionTemplates = [
  "Welcome to {name}, a premier {type} located in the heart of {city}. Our hotel offers a serene escape with top-notch amenities such as a state-of-the-art fitness center, a relaxing spa, and gourmet dining options. Whether you are here for business or leisure, our luxurious accommodations and prime location ensure a memorable stay. Our friendly staff is dedicated to providing exceptional service, ensuring your comfort and satisfaction throughout your visit.",
  "Discover the perfect blend of comfort and convenience at {name}. Situated in {city}, our {type} is just {distance} from the city's main attractions, including renowned museums, vibrant shopping districts, and scenic parks. Our well-appointed rooms feature modern decor, plush bedding, and high-speed internet. Enjoy a sumptuous breakfast at our in-house restaurant, unwind at our rooftop bar, or take a dip in our heated pool. Experience the best of {city} with ease and style.",
  "Experience elegance and sophistication at {name}, a renowned {type} in {city}. Our hotel features beautifully designed rooms, exquisite dining options, and a range of facilities to cater to all your needs, including a fully equipped business center, conference rooms, and event spaces. Enjoy a seamless stay with us, whether you're here for a romantic getaway, a family vacation, or a corporate event. Indulge in our signature cocktails at the lounge or savor a gourmet meal at our fine dining restaurant.",
  "At {name}, we pride ourselves on offering a unique and memorable experience. Located in the vibrant city of {city}, our {type} is the ideal choice for travelers seeking comfort and style. Our spacious rooms offer panoramic views of the city skyline, and our concierge service is ready to assist you with all your travel needs, from restaurant reservations to sightseeing tours. Relax in our tranquil garden, pamper yourself with a massage at the spa, or explore the local culture with our curated experiences.",
  "Welcome to {name}, your home away from home in {city}. Our {type} combines modern luxury with classic charm, providing a perfect retreat for all guests. Enjoy our spacious rooms, excellent service, and prime location during your stay. Our hotel offers a variety of dining options, including a casual cafe, a chic bistro, and a gourmet restaurant. Take advantage of our complimentary shuttle service to explore nearby attractions, or simply relax in our cozy lounge with a good book."
];

// Detailed room description templates with more details
const roomDescriptionTemplates = [
  "The {title} is designed to provide ultimate comfort and relaxation. Featuring modern amenities, elegant decor, and ample space, this room is perfect for both business and leisure travelers. Enjoy a restful stay with us, complete with high-speed Wi-Fi, a flat-screen TV, and a well-stocked minibar. The en-suite bathroom boasts a rain shower, plush towels, and luxury toiletries. The room includes {numBeds} beds and {numBathrooms} bathroom(s). After a long day, unwind in the comfortable seating area and enjoy the stunning views of the city.",
  "Our {title} offers a luxurious and cozy atmosphere, equipped with all the essentials for a comfortable stay. Unwind in the plush bedding, take advantage of the high-speed internet, and enjoy a range of in-room amenities, including a coffee maker, a safe, and a work desk. The room features contemporary furnishings, a spacious layout, and a large window that floods the space with natural light. Ideal for a relaxing getaway or a productive business trip. The room includes {numBeds} beds and {numBathrooms} bathroom(s).",
  "Experience the perfect blend of style and comfort in our {title}. This room features contemporary furnishings, a spacious layout, and premium amenities such as a Nespresso machine, a Bluetooth speaker, and a complimentary newspaper service. Ideal for a relaxing getaway or a productive business trip, the room also includes a large wardrobe, an iron and ironing board, and a dedicated work area. The room includes {numBeds} beds and {numBathrooms} bathroom(s). Enjoy the serene ambiance and the attentive service provided by our staff.",
  "The {title} boasts a sophisticated design and top-tier facilities to enhance your stay. Relax in the serene environment, enjoy the modern conveniences, and make the most of the exceptional service provided. The room includes a comfortable king-size bed, blackout curtains, and an air conditioning system to ensure a good night's sleep. Refresh in the elegant bathroom equipped with a bathtub, a hairdryer, and complimentary bathrobes. The room includes {numBeds} beds and {numBathrooms} bathroom(s). Start your day with a fresh cup of coffee from the in-room coffee maker.",
  "Indulge in the luxury of our {title}, a room that offers everything you need for a perfect stay. With elegant decor, state-of-the-art amenities, and a comfortable setting, this room ensures a delightful experience. Enjoy the convenience of a mini-fridge, a telephone with direct dial, and a multi-channel satellite TV. The room also features an ergonomic work chair, a laptop-friendly workspace, and a digital safe. The room includes {numBeds} beds and {numBathrooms} bathroom(s). Perfect for families or groups, the room provides ample space and a welcoming atmosphere."
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
  // Generate a random number between 1 and 100
  const randomNumber = faker.number.int({ min: 1, max: 100 });

  // If the random number is 10 or less, generate an offer (10% probability)
  if (randomNumber <= 10) {
    return [
      {
        offerKind: faker.helpers.arrayElement(['Discount', 'Last Minute', 'Early Bird']),
        priceBefore: 0, // Will be calculated in pre-save hook
        priceAfter: 0, // Will be calculated in pre-save hook
        percentageSaving: faker.number.int({ min: 10, max: 50 }),
        from: faker.date.recent(),
        to: faker.date.future()
      }
    ];
  } else {
    // Otherwise, return an empty array (no offer)
    return [];
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
    });

    // Generate offers for the hotel
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

generateHotelData(10, 5)
  .then(() => {
    console.log('Data generation completed.');
    process.exit(0);
    //connection.close();
  })
  .catch((error) => {
    console.error('Error generating data:', error);
    process.exit(1);
  });



  const createFakeUsers = async (num) => {
    const hotels = await Hotel.find({}).populate('rooms');
    const today = new Date();
    const reviewsData = await parseCSV(reviewsFilePath);
  
    for (let i = 0; i < num; i++) {
      
      const historyBookings = [];
  
      
      const numHistoryBookings = faker.number.int({ min: 0, max: 5 });
  
      const generateBooking = async (isHistory) => {
        const hotel = faker.helpers.arrayElement(hotels);
        const roomId = faker.helpers.arrayElement(hotel.rooms);
        const room = await Room.findById(roomId);
  
        if (!room) {
          console.error('Room not found:', roomId);
          return null;
        }
  
        const numberOfAdults = faker.number.int({ min: 1, max: 4 });
        const numberOfChildren = faker.number.int({ min: 0, max: 3 });
        const numberOfRooms = faker.number.int({ min: 1, max: 3 });
  
        let fromDate, toDate;
  
        if (isHistory) {
          fromDate = faker.date.between({ from: '2023-01-01', to: today });
          toDate = faker.date.between({ from: fromDate, to: new Date(fromDate.getTime() + 7 * 24 * 60 * 60 * 1000) });
        }
  
        const nights = (toDate - fromDate) / (1000 * 60 * 60 * 24);
  
        let roomPrice = room.price;
        if (room.offers && room.offers.length > 0) {
          const offer = room.offers[0].priceAfter; // Assume the first offer is the active one
          roomPrice = offer;
        }
  
        // Ensure roomPrice and nights are valid numbers
        if (isNaN(roomPrice) || isNaN(nights) || isNaN(numberOfRooms)) {
          console.error('Invalid data detected:', { hotel, room, roomPrice, nights, numberOfRooms });
          return null;
        }
  
        const totalCost = roomPrice * numberOfRooms + (nights * hotel.cheapestPrice) ;
  
        return {
          fromDate: fromDate.toISOString().split('T')[0],
          toDate: toDate.toISOString().split('T')[0],
          city: hotel.city,
          numberOfAdults,
          numberOfChildren,
          hotelName: hotel.name,
          numberOfRooms,
          roomNames: [room.title],
          hotelId:hotel._id,
          totalCost,
        };
      };
  

      for (let k = 0; k < numHistoryBookings; k++) {
        const booking = await generateBooking(true);
        if (booking) {
          historyBookings.push(booking);
        }
      }

      // Assign reviews to the user from the parsed CSV data
      const userReviews = [];
      for (let booking of historyBookings) {
        const numReviews = 1;
        for (let j = 0; j < numReviews; j++) {
        const reviewData = faker.helpers.arrayElement(reviewsData);
        const toDate = new Date(booking.toDate);
        const reviewDate = new Date(toDate.getTime() + faker.number.int({ min: 1, max: 5 }) * 24 * 60 * 60 * 1000); // Generate a date 1-7 days after toDate
        
        userReviews.push({
          hotelId: booking.hotelId,
          hotelName:booking.hotelName,
          rating: reviewData.Rating,
          comment: reviewData.Review,
          date: reviewDate.toISOString().split('T')[0], // Add the generated date
        });
        // console.log(booking.hotelId)
        // console.log(booking.hotelName)
        }
      }

  
      const user = new User({
        username: faker.internet.userName(),
        email: faker.internet.email(),
        country: faker.location.country(),
        img: faker.image.avatar(),
        city: faker.location.city(),
        phone: faker.phone.number(),
        password: "$2a$10$EsdhE2sBLpqZxlTfmJ/fOebTBFNP3680PD8g3s9DEgnKhTdwn5/Tu", // Specified password
        reviews: userReviews, 
        CurrentBookings: [],
        HistoryBookings: historyBookings,
        isAdmin: false,
      });
  
      await user.save();
    }
  };

  const reviewsFilePath = 'reviews.csv'; // Replace with your CSV file path
  
  /*createFakeUsers(100,reviewsFilePath)
    .then(() => {
      console.log('User generation completed.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Error generating data:', error);
      process.exit(1);
    });*/