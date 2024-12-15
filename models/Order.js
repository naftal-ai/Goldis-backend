import mongoose from "mongoose";
import User from "./User.js";

const { Schema } = mongoose;

const OrderSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  products: [
    {
      product: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        default: 1,
      }
    }
  ],
  totalPrice: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
  }
}, {timestamps: true});

//save the order in the user object when created
OrderSchema.post('save', async function (doc) {
  await User.findByIdAndUpdate(doc.user, {$push: {orders: doc._id}});
})

export default mongoose.model('Order', OrderSchema);