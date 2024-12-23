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

// Read : user
export const read = async (req, res) => {
  const { user } = req;

  try {
    const orders = await Order.find({ _id: { $in: user.orders } });
    return res.status(200).json(orders);
  } catch (err) {
    return res.status(401).json({ message: err.message });
  }
};

// Read : admin
export const readAllUsersOrders = async (req, res) => {
  const { status, userId } = req.query;

  const filters = {};

  if (userId) filters.user = userId;
  if (status) filters.status = status;

  try {
    const orders = await Order.find(filters).populate({
      path: "products.product",
      model: "Product",
    });
    res.status(200).json(orders);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// Read : admin | user
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

// reactivate : user
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

//Update quantity : user only for pending orders
export const updateQuantity = async (req, res) => {
  const { orderId } = req.params;
  //items is an array of objects with product id and quantity
  const { items } = req.body;

  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    if (order.status !== "pending") {
      return res.status(400).json({
        message: "You can only update quantities for pending orders.",
      });
    }

    const products = await getProducts(items);

    const unavailableProducts = products.filter(
      (product) => product.quantity > product.stock
    );

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

    await updateStock(items);

    order.products = items;

    //calculate total price
    const total = products.reduce(
      (total, { price, quantity }) => total + price * quantity,
      0
    );

    order.totalPrice = total;

    await order.save();

    res.status(200).json(order);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// Update status : admin
export const updateStatus = async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    order.status = status;
    await order.save();

    res.status(200).json(order);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// Delete if the status is pending : user
export const delete_o = async (req, res) => {
  const { orderId } = req.params;

  try {
    const order = await Order.findById(orderId);
    console.log(order);
    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    if (order.status !== "pending") {
      return res.status(400).json({
        message: "You can only delete pending orders.",
      });
    }

    await Order.findByIdAndDelete(orderId);

    res.status(200).json({ message: "Order deleted." });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
