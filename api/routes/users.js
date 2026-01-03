import express from "express";
import {
  addCurrentBookingToUser,
  addHistoryBookingToUser,
  addMessageToUser,
  addReviewToUser,
  createUsers,
  deleteUser,
  getUser,
  getUserCurrentBookings,
  getUserHistoryBookings,
  getUserMessages,
  getUserReviews,
  getUsers,
  removeCurrentBookingFromUser,
  updateUser,
  getAdminUsers,
   getAdminUserHistoryBookings
} from "../controllers/user.js";

import { verifyUser } from "../utils/verifyToken.js";
//const user = require("../models/User.js")
const router = express.Router();

router.post("/register", createUsers);


// router.get("/checkauthentication", verifyToken, (req,res,next)=>{
//   res.send("hello user, you are logged in")
// })

// router.get("/checkuser/:id", verifyUser, (req,res,next)=>{
//   res.send("hello user, you are logged in and you can delete your account")
// })

// router.get("/checkadmin/:id", verifyAdmin, (req,res,next)=>{
//   res.send("hello admin, you are logged in and you can delete all accounts")
// })

//UPDATE
router.put("/:id", verifyUser, updateUser);

//DELETE
router.delete("/:id", verifyUser, deleteUser);

router.get("/admin", getAdminUsers); // 🚀 New endpoint for admin users list
router.get("/:id/adminHistoryBookings", getAdminUserHistoryBookings); // 🚀 New endpoint for admin user history bookings
 
//GET
router.get("/:id", getUser);

//GET ALL
router.get("/", getUsers);


//ADD REVIEW
router.post("/:id/reviews", addReviewToUser)

// Define route to get all reviews of a specific user
router.get('/:id/reviews', getUserReviews);

router.post("/:id/currentbookings",addCurrentBookingToUser);
router.delete("/:id/currentbookings",removeCurrentBookingFromUser);
router.get('/:id/currentBookings', getUserCurrentBookings);

router.post("/:id/historybookings",addHistoryBookingToUser);
router.get("/:id/historybookings",getUserHistoryBookings);

router.post('/:id/messages',addMessageToUser);
router.get('/:id/messages',getUserMessages);





export default router;
