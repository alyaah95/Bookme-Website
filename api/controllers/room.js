import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";

export const createRoom = async (req, res, next) => {
  const hotelId = req.params.hotelid;
  const newRoom = new Room(req.body);

  try {
    const savedRoom = await newRoom.save();
    try {
      await Hotel.findByIdAndUpdate(hotelId, {
        $push: { rooms: savedRoom._id },
      });
    } catch (err) {
      next(err);
    }
    res.status(200).json(savedRoom);
  } catch (err) {
    next(err);
  }
};

export const updateRoom = async (req, res, next) => {
  try {
    const updatedRoom = await Room.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.status(200).json(updatedRoom);
  } catch (err) {
    next(err);
  }
};
export const updateRoomAvailability = async (req, res, next) => {
  try {
    await Room.updateOne(
      { "roomNumbers._id": req.params.id },
      {
        $push: {
          "roomNumbers.$.unavailableDates": req.body.dates
        },
      }
    );
    res.status(200).json("Room status has been updated.");
  } catch (err) {
    next(err);
  }
};
export const deleteRoom = async (req, res, next) => {
  const hotelId = req.params.hotelid;
  try {
    await Room.findByIdAndDelete(req.params.id);
    try {
      await Hotel.findByIdAndUpdate(hotelId, {
        $pull: { rooms: req.params.id },
      });
    } catch (err) {
      next(err);
    }
    res.status(200).json("Room has been deleted.");
  } catch (err) {
    next(err);
  }
};
export const getRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);
    res.status(200).json(room);
  } catch (err) {
    next(err);
  }
};
export const getRooms = async (req, res, next) => {
  try {
    const rooms = await Room.find();
    res.status(200).json(rooms);
  } catch (err) {
    next(err);
  }
};

// 🚀 New function for Admin Dashboard - getAdminRooms with pagination
export const getAdminRooms = async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 10; // 🚀 Default limit for admin view
  const page = parseInt(req.query.page) || 1;   // 🚀 Default page for admin view
  const skip = (page - 1) * limit;            // 🚀 Calculate skip for pagination

  try {
    const totalCount = await Room.countDocuments({}); // 🚀 Get total count for frontend pagination
    const rooms = await Room.find({})
      .skip(skip)   // 🚀 Apply skip for pagination
      .limit(limit); // 🚀 Apply limit for pagination

    // 🚀 Return total count, page, and limit along with rooms
    res.status(200).json({
      total: totalCount,
      page: page,
      limit: limit,
      rooms: rooms
    });
  } catch (err) {
    next(err);
  }
};


export const getRoomsByIds = async (req, res, next) => {
  try {
    const roomIds = req.body.roomIds; // Assuming the array of room IDs is passed in the request body
    const rooms = await Room.find({ _id: { $in: roomIds } });

    // Extract room titles from the fetched rooms
    const roomTitles = rooms.map(room => room.title);

    res.status(200).json(roomTitles);
  } catch (err) {
    next(err);
  }
};

export const deleteOldDatesFromRooms = async (req, res, next) => {
  try {
    // Define the threshold date for old dates (e.g., today's date minus 1 day)
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - 1);

    // Update all rooms to remove old dates from unavailableDates
    await Room.updateMany(
      { 'roomNumbers.unavailableDates': { $lt: thresholdDate } }, // Find rooms with old dates
      { $pull: { 'roomNumbers.$.unavailableDates': { $lt: thresholdDate } } } // Remove old dates
    );

    res.status(200).json('Old dates have been deleted from room availability.');
  } catch (err) {
    next(err);
  }
};


export const deleteDatesFromRooms = async (req, res, next) => {
  try {
    const { roomDetails, dates } = req.body;

    // Iterate over each room detail
    for (const roomDetail of roomDetails) {
      const { roomid, selectedRoomsId } = roomDetail;

      // Find the room by its ID
      const room = await Room.findById(roomid);
      if (!room) {
        throw new Error(`Room with ID ${roomid} not found.`);
      }

      // Iterate over selected room numbers
      for (const roomNumberId of selectedRoomsId) {
        const roomNumber = room.roomNumbers.find(num => num._id.toString() === roomNumberId);
        if (!roomNumber) {
          throw new Error(`Room number with ID ${roomNumberId} not found in room with ID ${roomid}.`);
        }

        // Remove specified dates from unavailableDates
        roomNumber.unavailableDates = roomNumber.unavailableDates.filter(date => !dates.includes(date.toDateString()));
      }

      // Save the updated room
      await room.save();
    }

    res.status(200).json('Selected dates have been deleted from room availability.');
  } catch (err) {
    next(err);
  }
};
export const getHotelIdByRoomId=async(req,res,next)=> {
  const roomId=req.params.id;
  try {
    const room = await Room.findById(roomId);
    if (!room) {
      throw new Error('Room not found');
    }
    // Assuming each room has a hotelId field pointing to the hotel it belongs to
    res.status(200).json(room.hotelId);
  } catch (error) {
    console.error('Error fetching hotel ID:', error.message);
    throw error;
  }
}
