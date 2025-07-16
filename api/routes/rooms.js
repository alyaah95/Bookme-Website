import express from "express";
import {
  createRoom,
  deleteDatesFromRooms,
  deleteOldDatesFromRooms,
  deleteRoom,
  getHotelIdByRoomId,
  getRoom,
  getRooms,
  updateRoom,
  updateRoomAvailability,
  getAdminRooms
} from "../controllers/room.js";
import { verifyAdmin } from "../utils/verifyToken.js";

const router = express.Router();
//CREATE
router.post("/:hotelid", verifyAdmin, createRoom);

//UPDATE
router.put("/availability/:id", updateRoomAvailability);
router.put("/:id", verifyAdmin, updateRoom);
//DELETE
router.delete("/:id/:hotelid", verifyAdmin, deleteRoom);
//GET
router.get("/admin", getAdminRooms);

router.get("/:id", getRoom);
//GET ALL

router.get("/", getRooms);

router.delete("/deleteoldAvailability",deleteOldDatesFromRooms);
router.delete("/deletecanceledAvailability",deleteDatesFromRooms);
router.get('/:id/hotel',getHotelIdByRoomId);



export default router;

