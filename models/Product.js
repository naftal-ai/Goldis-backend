import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  description: { type: String },
  images: [String],
  colors: [
    {
      color: { type: String, required: true },
      stock: { type: Number, required: true },
    },
  ],
  stock: { type: Number, required: true, default: 0 }, // General stock
});

// Middleware to update stock before saving
productSchema.pre("save", function (next) {
  if (this.colors && this.colors.length > 0) {
    this.stock = this.colors.reduce((total, color) => total + color.stock, 0);
  }
  next();
});

const Product = mongoose.model("Product", productSchema);

export default Product;
