import express from "express";
import "dotenv/config";
import cors from "cors";

//services
import { connect } from "./services/db.js";
//routers
import productRouter from "./routes/products.js";
import userRouter from "./routes/users.js";
import orderRouter from "./routes/orders.js";
import categoryRouter from "./routes/category.js";
import webhooksRouter from "./routes/webhooks.js";

const app = express();

const { PORT } = process.env;
const { MONGO_URI } = process.env;

//middlewares
app.use(cors());
app.use("/webhook", webhooksRouter);

app.use(express.json());

//routes
app.use("/goldis/products", productRouter);
app.use("/goldis/user", userRouter);
app.use("/goldis/orders", orderRouter);
app.use("/goldis/categories", categoryRouter);

//connect to mongo
await connect(MONGO_URI);

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
