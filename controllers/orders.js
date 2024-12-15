import {
  getProducts,
  productsInStock,
  updateStock,
  createOrder,
  createSession,
} from "../services/orders.js";

import Order from "../models/Order.js";
import Product from "../models/Product.js";

// Create : user

export const create = async (req, res) => {
  const { items } = req.body; // Products IDs, and quantities

  if (!items || items.length === 0) {
    return res.status(400).json({ message: "Order items are required." });
  }

  try {
    //get all the products from ids
    const products = await getProducts(items);

    //make sure products in stock
    if (!productsInStock(products))
      throw new Error("not all the products in stock");

    //update the amount in stoke
    await updateStock(items);

    //calculate total price
    const total = products.reduce(
      (total, { price, quantity }) => total + price * quantity,
      0
    );

    //create order with status pending
    const order = await createOrder(req.user, items, total);
    if (!order) throw new Error("unable to create order");

    const session = await createSession(products, order._id);

    res.status(200).json({
      sessionUrl: session.url,
    });
  } catch (err) {

    res.status(500).json({ err });
  }
};

export const read = async (req, res) => {
  const { user } = req;

  try {
    const orders = await Order.find({ _id: { $in: user.orders } });
    return res.status(200).json(orders);
  } catch (err) {
    return res.status(401).json({ message: err.message });
  }
};

export const readAllUsersOrders = async (req, res) => {
  try {
    const orders = await Order.find();
    res.status(200).json(orders);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const readByOrderId = async (req, res) => {
  const { id } = req.params;
  try {
    const order = await Order.findById(id).populate({path: "products.product", model: "Product" });
    
    //check if the order belong to this particular user
    if(req.user.role === "admin"){
      console.log("admin accessed")
      return res.status(200).json(order);  
    }

    const { orders } = req.user;

    if (orders.includes(id)) {
      console.log('includes work with string to object id')
      return res.status(200).json(order);
    }

    res.status(404).json({message: "order not found."});
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const reactivate = async (req, res) => {
  const { orderId } = req.params;
  try {
    const order = await Order.findById(orderId);
    let products = await Product.find({
      _id: { $in: order.products.map((p) => p.product) },
    });
    
    const items = order.products;
    //add quantity field
    const updatedProducts = products.map(product => {
      // Find the corresponding item with the same product ID
      const matchingItem = items.find(item => item.product.equals(product._id));
      return {
        ...product._doc, // Keep all the existing product properties
        quantity: matchingItem ? matchingItem.quantity : 0, // Add the quantity or default to 0 if not found
      };
    });
    
    console.log(updatedProducts);


    const session = await createSession(updatedProducts, orderId);

    res.status(200).json({ sessionUrl: session.url });
  } catch (error) {
    res.status(404).json({ message: "order not found" });
  }
};
