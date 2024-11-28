import mongoose, { disconnect } from "mongoose";

export const connect = async (MONGO_URI) => {
    mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log(`connected to mongodb`);
  })
  .catch((err) => console.log("Mongodb connection Error:", err));
}



export const closeConnection = async () => mongoose.disconnect();