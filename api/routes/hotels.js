import express from "express";
import {
  countByCity,
  countByType,
  createHotel,
  deleteHotel,
  getHotel,
  getHotelNames,
  getHotelRooms,
  getHotels,
  getHotelsByType,
  updateHotel,
  getAdminHotels,
  createPaymentIntent,
} from "../controllers/hotel.js";
import { verifyAdmin } from "../utils/verifyToken.js";
import { getOffersData } from "../controllers/hotel.js"
const router = express.Router();

//CREATE
router.post("/", verifyAdmin, createHotel);

//UPDATE
router.put("/:id", verifyAdmin, updateHotel);
//DELETE
router.delete("/:id", verifyAdmin, deleteHotel);

router.get("/admin", getAdminHotels);
//GET
router.get("/find/:id", getHotel);
//GET ALL

router.get("/", getHotels);
router.get("/countByCity", countByCity);
router.get("/countByType", countByType);
router.get("/room/:id", getHotelRooms);
router.get("/name", getHotelNames);
router.get("/offersData", getOffersData);
router.get("/type/:type", getHotelsByType);


router.post("/payment", createPaymentIntent);



export default router;
