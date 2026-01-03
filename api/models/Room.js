import mongoose from "mongoose";
const RoomSchema = new mongoose.Schema(
  {
    hotelId:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotel",
      required:true
    },
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    maxPeople: {
      type: Number,
      required: true,
    },
    desc: {
      type: String,
      required: true,
    },
    roomNumbers: [{ number: Number, unavailableDates: {type: [Date]}}],
    offers: [
      {
        offerKind:{
          type:String,
          required:true,
        },
        priceBefore: {
          type: Number,
          required: true,
        },
        priceAfter: {
          type: Number,
          required: true,
        },
        percentageSaving: {
          type: Number,
          required: true,
        },
        from: {
          type: Date,
          required: true,
        },
        to: {
          type: Date,
          required: true,
        },
      }
    ],
  },
  { timestamps: true }
);
// Calculate priceAfter based on the discount percentage
RoomSchema.pre("save", function (next) {
  this.offers.forEach(offer => {
    offer.priceBefore = this.price; // Set priceBefore to the actual room price
    offer.priceAfter = this.price * (1 - offer.percentageSaving / 100); // Calculate priceAfter based on the discount percentage
  });
  next();
});


export default mongoose.model("Room", RoomSchema);

