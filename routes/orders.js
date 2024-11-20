//order routes

//create : user
import express from "express";
import Order from "../models/Order.js";
import authenticate from '../middlewares/authenticate.js'; // Adjust path

const router = express.Router();

router.post("/", authenticate, async (req, res) => {
  const { items, totalPrice } = req.body; // Expecting items and totalPrice in the request body

  if (!items || items.length === 0) {
    return res.status(400).json({ message: "Order items are required." });
  }

  try {
    const newOrder = new Order({
      user: req.user._id, // Attach authenticated user's ID
      items,
      totalPrice,
      status: "pending", // Default status
    });

    await newOrder.save();

    res.status(201).json({ message: "Order created successfully", order: newOrder });
  } catch (err) {
    res.status(500).json({ message: "Error creating order", error: err.message });
  }
});

export default router;

//read 

//all : admin

//by user 

//by product : admin

