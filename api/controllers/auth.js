import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { createError } from "../utils/error.js";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";


export const register = async (req, res, next) => {
  try {
    
    const newUser = new User({
      ...req.body,
    });

    await newUser.save();
    res.status(200).send("User has been created.");
  } catch (err) {
    next(err);
  }
};


export const login = async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    if (!user) return next(createError(404, "User not found!"));

    const isPasswordCorrect = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!isPasswordCorrect)
      return next(createError(400, "Wrong password or username!"));

    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.JWT
    );

    const { password, isAdmin, ...otherDetails } = user._doc;
    res
      .cookie("access_token", token, {
        httpOnly: true,
      })
      .status(200)
      .json({ details: { ...otherDetails }, isAdmin });
  } catch (err) {
    next(err);
  }
};

export const forgotPassword = async (req, res, next) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "هذا البريد غير مسجل!" });
    if (req.body.isAdminRequest && !user.isAdmin) {
        return res.status(403).json({ message: "Sorry, you don't have access to this page!" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetOTP = otp;
    user.resetOTPExpires = Date.now() + 15 * 60 * 1000;
    await user.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    // نحاول نرسل، لو فشل نطلع Error ونوقف
    await transporter.sendMail({
      from: `"Booking Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Password Reset Code",
      html: `<b>Your code is: ${otp}</b>`,
    });

    // الرد ده مش هيتبعت إلا لو الإيميل اترسل فعلاً
    if (info.accepted.length > 0) {
      return res.status(200).json("Success");
    } else {
      // لو الإيميل مرفوض فوراً
      throw new Error("Rejected");
    }

  } catch (err) {
    // لو الإيميل وهمي أو فيه مشكلة في السيرفر
    return res.status(500).json({ message: "Failed to send email, please check the email address." });
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({
      email: req.body.email,
      resetOTP: req.body.otp,
      resetOTPExpires: { $gt: Date.now() }, // التأكد إن الكود لسه مخلصش
    });

    if (!user) return next(createError(400, "Invalid OTP or expired"));

    // تحديث الباسوورد (التشفير هيحصل تلقائي في الموديل زي ما عملنا قبل كدا)
    user.password = req.body.newPassword;
    user.resetOTP = undefined;
    user.resetOTPExpires = undefined;

    await user.save();
    res.status(200).json("Password has been updated successfully.");
  } catch (err) { next(err); }
};


