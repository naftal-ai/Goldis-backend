import express from "express";
import bodyParser from "body-parser";
import Stripe from "stripe";

import Order from "../models/Order.js";
import Product from "../models/Product.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const router = express.Router();

router.post(
  "/",
  bodyParser.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
      // Verify the event using the signing secret
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);

      // Handle the event
      switch (event.type) {

        case "checkout.session.expired":
          const { orderId } = event.data.object.metadata;
          const order = await Order.findById(orderId);

          if(!order) break; //order already deleted 

          //remove the order after 24 
          if(order.status === "pending"){
            Order.findByIdAndDelete(orderId);
          }
          break;

        case "checkout.session.completed":
          const paymentIntent = event.data.object;

          const { status } = await Order.findByIdAndUpdate(
            paymentIntent.metadata.orderId,
            { status: "paid" }
          );

          // if (status !== "paid") throw new Error("Order status update failed");
          break;

        default:
          console.log(`Unhandled event type ${event.type}`);
      }

      // Acknowledge receipt of the event
      res.status(200).send("Received");
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
  }
);

export default router;
