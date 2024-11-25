import express from "express";
import mongoose from "mongoose";
import "dotenv/config";

//routers
import productRouter from './routes/products.js';
import userRouter from './routes/users.js';
import orderRouter from './routes/orders.js';
import categoryRouter from './routes/category.js';
import paymentRouter from './routes/payment.js';

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
app.use('/goldis/payment-intent', paymentRouter);



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
