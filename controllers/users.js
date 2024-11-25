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
    
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    // Generate a JWT
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: "12h",
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
    
    res.json(req.user);
  },
  update: null,
  delete_u: null,
};

//READ
//get user data

//UPDATE

//DELETE


//Admin Privilege
//create new admin account

//read 
export const admin = {
  //all users
  readAll : async (req, res) => {
    try {
      const users = await User.find();
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({message: error.message});
    }
  },
  //by id
  readById : async (req, res) => {
    const {id} = req.params;
    try {
      const user = await User.findById(id);
      if(!user) {
        return res.status(401).json({message: 'user not found'});
      }
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({message: error.message});
    }
  },

  //upgrade user privilege
  
  //delete users
  delete_u : async (req, res) => {
    const {id} = req.params;
    try {
      const user = await User.findByIdAndDelete(id);
      if(!user) {
        return res.status(401).json({message: 'user not found'});
      }
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({message: error.message});
    }
  }
}


