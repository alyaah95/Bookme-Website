import mongoose from "mongoose";
import bcrypt from "bcryptjs";
const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    country: {
      type: String,
      required: true,
    },
    img: {
      type: String,
    },
    city: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    CurrentBookings:[{
        fromDate: {type:String},
        toDate: {type:String},
        city: {type:String},
        numberOfAdults: {type:Number},
        numberOfChildren: {type:Number},
        hotelName: {type:String},
        numberOfRooms: {type:Number},
        roomNames: {type:Array},
        ReservationDetails: {type:Array},
        totalCost: {type:Number}
    }
  ],
    HistoryBookings:{
      type:Array
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    Messages: [{
      name: { type: String, required: true },
      email: { type: String, required: true },
      message: { type: String, required: true },
      date: { type: Date, default: Date.now }
    }],
    resetOTP: { type: String },
    resetOTPExpires: { type: Date },
  },
  { timestamps: true }
);
UserSchema.pre("save", async function (next) {
  // لو الباسوورد متعدلش (مثلاً المستخدم غير رقم تليفونه بس)، كمل عادي
  if (!this.isModified("password") || !this.password) {
    return next();
  }

  // لو الباسوورد جديد أو اتعدل، شفره
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

export default mongoose.model("User", UserSchema);
