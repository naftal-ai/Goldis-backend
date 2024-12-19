import {
  getProducts,
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
    const unavailableProducts = products.filter(
      (product) => product.quantity > product.stock
    );


    //return all the products are note in stock
    if (unavailableProducts.length > 0) {
      return res.status(422).json({
        error: "Unprocessable Entity",
        message: "Some products in your order exceed the available stock.",
        details: unavailableProducts.map((product) => ({
          productId: product._id,
          requested: product.quantity,
          available: product.stock,
        })),
      });
    }

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
    const order = await Order.findById(id).populate({
      path: "products.product",
      model: "Product",
    });

    //check if the order belong to this particular user
    if (req.user.role === "admin") {
      return res.status(200).json(order);
    }

    const { orders } = req.user;

    if (orders.includes(id)) {
      return res.status(200).json(order);
    }

    res.status(404).json({ message: "order not found." });
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
    const updatedProducts = products.map((product) => {
      const matchingItem = items.find((item) =>
        item.product.equals(product._id)
      );
      return {
        ...product._doc,
        quantity: matchingItem ? matchingItem.quantity : 0,
      };
    });

    const session = await createSession(updatedProducts, orderId);

    res.status(200).json({ sessionUrl: session.url });
  } catch (error) {
    res.status(404).json({ message: "order not found" });
  }
};
