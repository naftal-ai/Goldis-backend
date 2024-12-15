import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  description:  String,
  images: [String],
  stock: { type: Number, required: true, default: 0 }, 
});

//instance method to update stock
productSchema.methods.updateStock = async function (quantityChange) {
  if (this.stock + quantityChange < 0) {
    throw new Error('Insufficient stock');
  }

  this.stock += quantityChange;
  return this.save();
};



const Product = mongoose.model("Product", productSchema);

export default Product;
