import { OAuth2Client } from "google-auth-library";
import { userModel } from "../model/userModel.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();
//credetials
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const EMAIL_ID = process.env.EMAIL_ID;
const EMAIL_PASSWORD = process.env.EMAIL_APP_PASSWORD;

const client = new OAuth2Client(CLIENT_ID);

//inmenory storage for otps:
const otpStore = new Map();

// Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_ID,
    pass: EMAIL_PASSWORD,
  },
});

//Helper functions
async function verifyToken(token) {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: CLIENT_ID,
  });
  const payload = ticket.getPayload();
  return payload;
}

// Helper to generate 4-digit OTP
async function generateOTP() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

//core fucntions
export default async function signUp(req, res) {
  const { token, name, phoneNumber } = req.body;
  try {
    let user = await verifyToken(token);

    if (user.email_verified == true) {
      const { email } = user;
      console.log("USER:", user);
      user = await userModel.findOne({ email });

      if (user) {
        console.log(`User already exists: ${email}`);
        return res.status(200).json({ message: "User already exists", user });
      }

      user = new userModel({
        name: name,
        email: email,
        phoneNumber: phoneNumber,
      });

      await user.save();

      console.log(`New user created: ${email}`);
      return res.status(201).json({ message: "New user created", user });
    } else {
      return res.status(401).json({
        message:
          "email is not Authorized, please signup using an authorized email id",
      });
    }
  } catch (error) {
    console.error("error while signup :", error);
    return res.status(500).json({ message: "internal server error" });
  }
}

export async function login(req, res) {
  const { email } = req.body;
  try {
    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }
    let user = await userModel.findOne({ email });

    if (!user) {
      return res
        .status(200)
        .json({ message: `User does not exists with email : ${email}`, user });
    }
    const otp = await generateOTP();
    const expiresAt = Date.now() + 3 * 60 * 1000; // 3 minutes from now

    otpStore.set(email, { otp, expiresAt });

    try {
      await transporter.sendMail({
        from: '"Your App Name" <your_email@gmail.com>',
        to: email,
        subject: "Your OTP Code",
        text: `Your OTP is ${otp}. It will expire in 3 minutes.`,
      });

      return res.status(200).json({ message: "OTP sent to email." });
    } catch (error) {
      console.error("Error sending email:", error);
      return res.status(500).json({ message: "Failed to send OTP." });
    }
  } catch (error) {
    console.error("error while login :", error);
    return res.status(500).json({ message: "internal server error" });
  }
}

export async function verifyOTP(req, res) {
  const { email, otp } = req.body;
  let user = await userModel.findOne({ email });
  const record = otpStore.get(email);
  if (!record) {
    return res.status(400).json({ message: "No OTP found for this email." });
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(email);
    return res.status(400).json({ message: "OTP has expired." });
  }

  if (record.otp !== otp) {
    return res.status(400).json({ message: "Invalid OTP." });
  }

  const token = jwt.sign({ email }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  otpStore.delete(email);
  return res
    .status(200)
    .json({ message: "OTP verified. Login successful.", token });
}

export async function getUserProfile(req, res) {
  try {
    const user = await userModel.findOne({ email: req.user.email });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.status(200).json({ user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error." });
  }
}
