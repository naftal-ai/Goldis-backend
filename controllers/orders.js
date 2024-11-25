import Order from "../models/Order.js";
import Product from "../models/Product.js";
import {
  getProducts,
  calculateTotalPrice,
  productsInStock,
  getClientSecret,
  updateStock
} from "../services/orders.js";
// Create : user

export const create = async (req, res) => {
  const { items } = req.body; // Products IDs, and quantities

  if (!items || items.length === 0) {
    return res.status(400).json({ message: "Order items are required." });
  }

  try {
    //get all the products from ids
    const products = await getProducts(items);

    console.log(products);
    
    //make sure products in stock
    if(!productsInStock(products)) throw new Error('not all the products in stock');

    //calculate the total price of the order
    const totalPrice = calculateTotalPrice(products);

    res
      .status(201)
      .json({ message: "Order created successfully", order: products, totalPrice: totalPrice });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error creating order", error: err.message });
  }
};

// 0. the user signed in
// and wants to checkout with the order
// and send all the product ids
// 1. Make sure the products ids are valid and in stock
// 2. Calculate total price
// 3. send a payment intent to the user
// 4. Make sure the payment passed in success
// 5. update the amount in stock of all the products in the order
// 6. update the order in the data base with status pending
