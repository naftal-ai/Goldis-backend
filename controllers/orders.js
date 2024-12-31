import {
  getProducts,
  updateStock,
  createOrder,
  createSession,
  deleteOrder,
  checkProductsAvailable,
  calculateTotal,
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

    await checkProductsAvailable(products);

    //update the amount in stoke
    await updateStock(items);

    //calculate total price
    const total = calculateTotal(products);

    //create order with status pending
    const order = await createOrder(req.user, items, total);
    if (!order) throw new Error("unable to create order");

    const session = await createSession(products, order._id);

    res.status(200).json({
      sessionUrl: session.url,
    });
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json(err);
    }
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
  const { status, userId, populate } = req.query;

  const filters = {};

  if (userId) filters.user = userId;
  if (status) filters.status = status;

  try {
    // Build the query
    let query = Order.find(filters);

    // Conditionally add populate
    if (populate && populate === "true") {
      query = query.populate({
        path: "products.product",
        model: "Product",
      });
    }

    // Execute the query
    const orders = await query;

    res.status(200).json(orders);
  } catch (error) {
    console.log(error);
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

  try {
    deleteOrder(orderId);
    // create new order
    const { items } = req.body; // Products IDs, and quantities

    //get all the products from ids

    const products = await getProducts(items);

    await checkProductsAvailable(products);

    //update the amount in stoke
    await updateStock(items);

    //calculate total price
    const total = calculateTotal(products);
    //create order with status pending
    const order = await createOrder(req.user, items, total);
    if (!order) throw new Error("unable to create order");

    const session = await createSession(products, order._id);

    res.status(200).json({
      sessionUrl: session.url,
    });
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json(err);
    }
    res.status(500).json({ err });
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
  try {
    const { orderId } = req.params;

    deleteOrder(orderId);
    res.status(200).json({ message: "Order deleted." });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
