import User from "../models/User.js";
import bcrypt from "bcryptjs"; // Add this import

export const updateUser = async (req, res, next) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.status(200).json(updatedUser);
  } catch (err) {
    next(err);
  }
};
export const deleteUser = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json("User has been deleted.");
  } catch (err) {
    next(err);
  }
};
export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};
export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (err) {
    next(err);
  }
};

export const createUsers = async (req, res) => {
  try {
    // 1. Hash the password for security
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // 2. Create a new user instance
    const newuser = new User({
      // FIX: Change req.body.name to req.body.username to match your frontend
      username: req.body.username,
      email: req.body.email,
      country: req.body.country,
      city: req.body.city,
      phone: req.body.phone,
      password: hashedPassword, // Use the hashed password
    });

    // 3. Save the new user to the database
    const user = await newuser.save();

    // 4. Send a success response
    // It's good practice to send the created user details back
    res
      .status(200)
      .json({ message: "User registered successfully", details: user });
  } catch (error) {
    // Log the detailed error on the server side for debugging
    console.error("Error during user registration:", error);

    // Provide more specific error messages to the client
    if (error.code === 11000) {
      // Mongoose duplicate key error code
      // Check if the error relates to username or email being unique
      return res.status(409).json(); // 409 Conflict for duplicates
    } else if (error.name === "ValidationError") {
      // Mongoose validation error (e.g., missing required field)
      return res.status(400).json(); // 400 Bad Request for validation
    }
    // For any other unexpected errors, return a 500 Internal Server Error
    return res
      .status(500)
      .json({
        message: "Internal server error during registration.",
        error: error.message,
      });
  }
};

export const addReviewToUser = async (req, res, next) => {
  const { reviewContent } = req.body; // Assuming the review content is in the request body
  const { userid } = req.body;

  try {
    // Create a new review object
    const newReview = reviewContent;

    // Find the user by ID and update their reviews array
    const user = await User.findByIdAndUpdate(userid, {
      $push: { reviews: newReview },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ message: "Review added successfully", user });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

export const getUserReviews = async (req, res, next) => {
  try {
    // Find the user by ID
    const user = await User.findById(req.params.id);

    // Check if user exists
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // If user exists, get their reviews
    const userReviews = user.reviews;

    // Respond with user's reviews
    res.status(200).json(userReviews);
  } catch (err) {
    // If any error occurs, pass it to the error handler middleware
    next(err);
  }
};

export const getUserCurrentBookings = async (req, res, next) => {
  try {
    // Find the user by ID
    const user = await User.findById(req.params.id);

    // Check if user exists
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // If user exists, get their reviews
    const currentBookings = user.CurrentBookings;

    // Respond with user's reviews
    res.status(200).json(currentBookings);
  } catch (err) {
    // If any error occurs, pass it to the error handler middleware
    next(err);
  }
};

export const addCurrentBookingToUser = async (req, res, next) => {
  const { userId } = req.body;
  const { bookingCard } = req.body;

  try {
    // Create a new booking card object
    const newBooking = bookingCard;

    // Find the user by ID and update their currentBookings array
    const user = await User.findByIdAndUpdate(userId, {
      $push: { CurrentBookings: newBooking },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ message: "Booking added successfully", user });
  } catch (error) {
    console.error(error);
    next(error);
  }
};
export const addHistoryBookingToUser = async (req, res, next) => {
  const userId = req.params.id;
  const bookingCard = req.body.bookingCard;

  try {
    // Find the user by ID and update their HistoryBookings array
    let user = await User.findByIdAndUpdate(
      userId,
      {
        $push: { HistoryBookings: bookingCard },
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Loop through the user's HistoryBookings to remove duplicate bookings
    const uniqueHistoryBookings = [];
    const existingIds = new Set();

    for (const booking of user.HistoryBookings.reverse()) {
      if (!existingIds.has(booking._id)) {
        uniqueHistoryBookings.push(booking);
        existingIds.add(booking._id);
      }
    }

    // Update user's HistoryBookings array with unique bookings
    user = await User.findByIdAndUpdate(
      userId,
      { HistoryBookings: uniqueHistoryBookings },
      { new: true }
    );

    res.status(200).json({ message: "Booking added successfully", user });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

export const getUserHistoryBookings = async (req, res, next) => {
  try {
    // Find the user by ID
    const user = await User.findById(req.params.id);

    // Check if user exists
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // If user exists, get their reviews
    const historyBookings = user.HistoryBookings;

    // Respond with user's reviews
    res.status(200).json(historyBookings);
  } catch (err) {
    // If any error occurs, pass it to the error handler middleware
    next(err);
  }
};

export const removeCurrentBookingFromUser = async (req, res, next) => {
  const userId = req.params.id;
  const { bookingId } = req.body; // Remove object destructuring from body

  try {
    // Find the user by ID and update their CurrentBookings array
    const user = await User.findOneAndUpdate(
      { _id: userId, "CurrentBookings._id": bookingId }, // Find user by ID and bookingId
      { $pull: { CurrentBookings: { _id: bookingId } } }, // Remove the booking with matching ID
      { new: true } // Return the updated document
    );

    if (!user) {
      return res.status(404).json({ error: "User or booking not found" });
    }

    res.status(200).json({ message: "Booking removed successfully" }); // Return bookingId in response
  } catch (error) {
    console.error(error);
    next(error);
  }
};
export const addMessageToUser = async (req, res) => {
  const { name, email, message } = req.body;

  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.Messages.push({ name, email, message });
    await user.save();

    res.status(200).json({ message: "Message sent successfully" });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

export const getUserMessages = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const userMessages = user.Messages;
    res.status(200).json(userMessages);
  } catch (err) {
    console.error(err);
    next(err);
  }
};
