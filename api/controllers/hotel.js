import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";
import Stripe from "stripe";

export const createHotel = async (req, res, next) => {
  const newHotel = new Hotel(req.body);

  try {
    const savedHotel = await newHotel.save();
    res.status(200).json(savedHotel);
  } catch (err) {
    next(err);
  }
};
export const updateHotel = async (req, res, next) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    
    // فحص مباشر في جدول الغرف عن أي غرفة تتبع هذا الفندق ولديها حجز
    const roomWithBooking = await Room.findOne({
      hotelId: req.params.id,
      "roomNumbers.unavailableDates.0": { $exists: true } // هل يوجد على الأقل تاريخ واحد؟
    });

    if (roomWithBooking && (req.body.city || req.body.address || req.body.cheapestPrice)) {
      return res.status(400).json({ 
        message: "Action Denied: This hotel has active reservations in room " + roomWithBooking.title
      });
    }

    Object.assign(hotel, req.body);
    await hotel.save();
    res.status(200).json(hotel);
  } catch (err) {
    next(err);
  }
};
export const deleteHotel = async (req, res, next) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    // جلب بيانات كل الغرف التابعة للفندق ده
    const rooms = await Room.find({ _id: { $in: hotel.rooms } });
    
    const hasBookings = rooms.some(room => 
      room.roomNumbers.some(rn => rn.unavailableDates.length > 0)
    );

    if (hasBookings) {
      return res.status(400).json({ message: "This hotel has active bookings in its rooms, cannot delete!" });
    }
    
    await Room.deleteMany({ _id: { $in: hotel.rooms } });
    await Hotel.findByIdAndDelete(req.params.id);
    res.status(200).json("Hotel has been deleted.");
  } catch (err) {
    next(err);
  }
};

export const getHotel = async (req, res, next) => {
  try {
    const hotel = await Hotel.findById(req.params.id).populate("rooms");
    res.status(200).json(hotel);
  } catch (err) {
    next(err);
  }
};
export const getHotels = async (req, res, next) => {
  const { min, max, ...others } = req.query;
  try {
    const hotels = await Hotel.find({
      ...others,
      cheapestPrice: { $gt: min | 1, $lt: max || 999 },
    }).limit(req.query.limit);
    res.status(200).json(hotels);
  } catch (err) {
    next(err);
  }
};

// 🚀 New function for Admin Dashboard - getAdminHotels with pagination
export const getAdminHotels = async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 10; // 🚀 Default limit for admin view
  const page = parseInt(req.query.page) || 1;   // 🚀 Default page for admin view
  const skip = (page - 1) * limit;            // 🚀 Calculate skip for pagination

  const { min, max, ...others } = req.query; // You might still want filtering for admin

  try {
    const query = {
      ...others,
      cheapestPrice: { $gt: min || 1, $lt: max || 9999 },
    };

    const totalCount = await Hotel.countDocuments(query); // 🚀 Get total count for frontend pagination

    const hotels = await Hotel.find(query)
      .skip(skip)   // 🚀 Apply skip for pagination
      .limit(limit); // 🚀 Apply limit for pagination

    // 🚀 Return total count, page, and limit along with hotels
    res.status(200).json({
      total: totalCount,
      page: page,
      limit: limit,
      hotels: hotels
    });
  } catch (err) {
    next(err);
  }
};



export const countByCity = async (req, res, next) => {
  const cities = req.query.cities.split(",");
  try {
    const list = await Promise.all(
      cities.map((city) => {
        return Hotel.countDocuments({ city: city });
      })
    );
    res.status(200).json(list);
  } catch (err) {
    next(err);
  }
};
export const countByType = async (req, res, next) => {
  try {
    const hotelCount = await Hotel.countDocuments({ type: "hotel" });
    const apartmentCount = await Hotel.countDocuments({ type: "apartment" });
    const resortCount = await Hotel.countDocuments({ type: "resort" });
    const villaCount = await Hotel.countDocuments({ type: "villa" });
    const cabinCount = await Hotel.countDocuments({ type: "cabin" });

    res.status(200).json([
      { type: "hotels", count: hotelCount },
      { type: "apartments", count: apartmentCount },
      { type: "resorts", count: resortCount },
      { type: "villas", count: villaCount },
      { type: "cabins", count: cabinCount },
    ]);
  } catch (err) {
    next(err);
  }
};

export const getHotelRooms = async (req, res, next) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    const list = await Promise.all(
      hotel.rooms.map((room) => {
        return Room.findById(room);
      })
    );
    res.status(200).json(list);
  } catch (err) {
    next(err);
  }
};
export const getHotelNames = async (req, res, next) => {
  try {
    const hotels = await Hotel.find({}, "name"); // Retrieve only the 'name' field
    res.status(200).json(hotels);
  } catch (err) {
    next(err);
  }
};

// Fetch all rooms with offers and the hotel name
// File: controllers/hotelController.js (أو roomController.js - يفضل تسميته hotelController.js)



// هذا هو الكنترولر الخاص بك (موجود في مجلد controllers)
// File: controllers/hotelController.js (أو roomController.js حسب تسميتك)



export const getOffersData = async (req, res, next) => {
  try {
    // جلب كل الفنادق التي لديها عروض رئيسية (مثلاً صيفي، شتوي)
    // Populate هنا هتجلب فقط الغرف التي تحتوي على عروض وصفية بداخلها
    const hotelsWithOffers = await Hotel.find({
      'offers.offerKind': { $exists: true, $ne: null } // تأكد أن الفندق لديه offerKind
    }).populate({
      path: 'rooms',    // الحقل الذي يربط الفندق بالغرف
      model: 'Room',    // موديل الغرفة
      select: 'title price offers maxPeople desc roomNumbers', // الحقول المطلوبة من الغرفة
      // هنا هو التعديل الأساسي: قم بفلترة الغرف بحيث تظهر فقط تلك التي لديها عروض وصفية
      match: { 'offers': { $exists: true, $not: { $size: 0 } } } // الغرفة يجب أن تحتوي على مصفوفة offers غير فارغة
    });

    const structuredOffersData = [];

    // معالجة البيانات لتجميعها بالشكل المطلوب للواجهة الأمامية.
    for (const hotel of hotelsWithOffers) {
      // تأكد أن الفندق مازال يحتوي على غرف بعد عملية الفلترة
      if (hotel.rooms && hotel.rooms.length > 0) { // هذا الشرط يضمن أن الفندق الذي تم جلبه لديه غرف بعروض
        // نأخذ نوع العرض الرئيسي من الفندق
        const hotelOfferKind = hotel.offers[0].offerKind; // نفترض أن offerKind الرئيسي هو في أول عرض للفندق

        // نجمع كل الغرف التابعة لهذا الفندق والتي قد تحتوي على عروض وصفية (تم فلترتها بالفعل في الـ populate)
        const hotelRoomsWithDescriptiveOffers = [];
        if (hotel.rooms && hotel.rooms.length > 0) {
          for (const room of hotel.rooms) {
            // هذا الشرط إضافي للتأكد، بالرغم من أن populate بـ match يجب أن يكون قد قام بالفلترة
            if (room.offers && room.offers.length > 0) {
              hotelRoomsWithDescriptiveOffers.push({
                roomId: room._id,
                roomTitle: room.title,
                roomPrice: room.price,
                roomMaxPeople: room.maxPeople,
                roomDescription: room.desc,
                roomNumbers: room.roomNumbers,
                roomDescriptiveOffers: room.offers // العروض الوصفية الخاصة بالغرفة
              });
            }
          }
        }
        
        // فقط أضف الفندق إذا كان لديه غرف بعروض وصفية
        if (hotelRoomsWithDescriptiveOffers.length > 0) {
            structuredOffersData.push({
                hotelId: hotel._id,
                hotelName: hotel.name,
                hotelPhotos: hotel.photos,
                hotelAddress: hotel.address,
                hotelDistance: hotel.distance,
                hotelCheapestPrice: hotel.cheapestPrice,
                hotelCity: hotel.city,
                offerKind: hotelOfferKind, // نوع العرض الرئيسي من الفندق
                hotelOffers: hotel.offers, // كل العروض الوصفية اللي على الفندق (لو فيه)
                roomsWithDescriptiveOffers: hotelRoomsWithDescriptiveOffers // الغرف اللي عليها عروض وصفية من هذا الفندق
            });
        }
      }
    }

    res.status(200).json(structuredOffersData);
  } catch (error) {
    console.error("Error fetching offers data:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

export const getHotelsByType = async (req, res, next) => {
  const { type } = req.params; // Extract 'type' from request parameters

  try {
    // Find hotels that match the specified type
    const hotels = await Hotel.find({ type });

    // If no hotels are found, send a 404 response
    if (!hotels.length) {
      return res
        .status(404)
        .json({ message: "No hotels found with the specified type" });
    }

    // Send the found hotels as the response
    res.status(200).json(hotels);
  } catch (error) {
    // Handle any errors that occur during the database query
    next(error);
  }
};


export const createPaymentIntent = async (req, res, next) => {
  const stripe = new Stripe(process.env.STRIPE_KEY);

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: req.body.amount * 100, // Stripe بيحسب بالـ "سنت"، فلازم نضرب في 100
      currency: "usd", // أو "egp" حسب ما تحبي
      automatic_payment_methods: { enabled: true },
    });

    res.status(200).send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (err) {
    next(err);
  }
};