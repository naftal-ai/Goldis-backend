import express from "express";
import mongoose from "mongoose";
import "dotenv/config";
import Stripe from "stripe";
//routers
import productRouter from './routes/products.js';
import userRouter from './routes/users.js';
import orderRouter from './routes/orders.js';
import categoryRouter from './routes/category.js';

const app = express();

const { PORT } = process.env;
const { MONGO_URI } = process.env;
//middlewares
app.use(express.json());

//routes
app.use('/goldis/products', productRouter);
app.use('/goldis/user', userRouter);
app.use('/goldis/orders', orderRouter);
app.use('/goldis/categories', categoryRouter);


const stripe = new Stripe('sk_test_51QMmeILLraYGbqTA1eIFNdWra1Mm80y15VJJL4HySKKrj8xQuMuE5uOkAJMWgO6duvnOZvsJAIh8mCkrMlhRixgW00a6I4vCvv');

// API Endpoint to Create Payment Intent
app.post('/api/payment-intent', async (req, res) => {
  const { amount, currency } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount, // Amount in the smallest currency unit (e.g., cents for USD)
      currency, // E.g., 'usd'
    });

    res.status(200).json({
      clientSecret: paymentIntent.client_secret, // Send this to the front-end
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});


//connect to mongo
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log(`connected to mongodb in port ${PORT}`);
  })
  .catch((err) => console.log("Mongodb connection Error:", err));



// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
