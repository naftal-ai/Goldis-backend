import Product from "../models/Product.js";
import Order from "../models/Order.js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const getProducts = async (items) => {
  const products = await Promise.all(
    items.map(({ id }) => Product.findById(id))
  );

  const replaceIdsWithProducts = () =>
    items.map(({ quantity }, i) => {
      return {
        ...products[i]._doc,
        quantity,
      };
    });

  return replaceIdsWithProducts();
};

export const calculateTotal = (products) => {
  return products.reduce(
    (total, { price, quantity }) => total + price * quantity,
    0
  );
}
export const createOrder = async (user, items, totalPrice) => {
  
  const products = items.map(({ id: product, quantity }) => ({
    product,
    quantity,
  }));

  const order = new Order({
    user,
    products,
    totalPrice,
  });

  await order.save();

  return order;
};

export const createSession = async (products, orderId) => {
  orderId = orderId.toString();
  const lineItems = products.map(
    ({ name, description, images, quantity, price }) => {
      return {
        price_data: {
          currency: "usd",
          product_data: {
            name,
            description,
            images,
          },
          unit_amount: price * 100,
        },

        quantity,
      };
    }
  );

  return stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: lineItems,
    metadata: { orderId },
    mode: "payment",
    success_url: `${process.env.CLIENT_URL}/success?orderId=${orderId}`,
    cancel_url: `${process.env.CLIENT_URL}/cancel?orderId=${orderId}`,
  });
};

export const deleteOrder = async (orderId) => {
  const order = await Order.findById(orderId);
  if (!order) {
    throw new Error("Order not found.");
  }

  if (order.status !== "pending") {
    throw new Error("You can only delete pending orders.");
  }

  await Order.findByIdAndDelete(orderId);
};

export const checkProductsAvailable = async (products) => {

  //make sure products in stock
  const unavailableProducts = products.filter(
    (product) => product.quantity > product.stock
  );
  let error = null;
  
  //return all the products are note in stock
  if (unavailableProducts.length > 0) {
    throw {
      status: 422,
      error: "Unprocessable Entity",
      message: "Some products in your order exceed the available stock.",
      details: unavailableProducts.map((product) => ({
        productId: product._id,
        requested: product.quantity,
        available: product.stock,
      }))
    };
  }
};

// 4. Make sure the payment passed in success
// 5. update the amount in stock of all the products in the order
export const updateStock = async (items) => {
  try {
    
    const updatePromises = items.map(async ({ id, quantity }) => {
      const product = await Product.findById(id);
      product.updateStock(-quantity);
    });
  
    await Promise.all(updatePromises);
  } catch (error) {
    console.log(error);
  }
};

// 6. update the order in the data base with status pending
