import mongoose from "mongoose";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
//file purpose => extract the data & validation

//CREATE
//sign up
export const signup = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use." });
    }

    // Create a new user
    const newUser = new User({ name, email, password, role });
    await newUser.save();

    res
      .status(201)
      .json({
        message: "User created successfully.",
        user: { id: newUser._id, email: newUser.email },
      });
  } catch (error) {
    res.status(500).json({ message: "Error creating user.", error });
  }
};
//sign in
export const signin = async (req, res) => {
  const JWT_SECRET = process.env.JWT_SECRET;

  const { email, password } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    // Compare the password
    const isPasswordValid = await user.comparePassword(password);
    console.log(isPasswordValid);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    // Generate a JWT
    console.log(user);

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({ message: "Sign in successful.", token });
  } catch (error) {
    res.status(500).json({ message: "Error signing in.", error });
  }
};
//sign out

//user privilege
export const user = {
  read: async (req, res) => {
    // const {_id} = req.user;
    res.json(req.user);
  },
  update: null,
  delete_u: null,
};

//READ
//get user data

//UPDATE

//DELETE
