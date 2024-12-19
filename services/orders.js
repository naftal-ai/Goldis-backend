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
    success_url: `${process.env.CLIENT_URL}/success`,
    cancel_url: `${process.env.CLIENT_URL}/cancel`,
  });
};

// 3. send a payment intent to the user
export const getClientSecret = async (amount, currency) => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount, // Amount in the smallest currency unit (e.g., cents for USD)
    currency, // E.g., 'usd'
  });

  return paymentIntent.client_secret;
};
// 4. Make sure the payment passed in success

// 5. update the amount in stock of all the products in the order
export const updateStock = async (items) => {
  const updatePromises = items.map(async ({ id, quantity }) => {
    const product = await Product.findById(id);
    product.updateStock(-quantity);
  });

  await Promise.all(updatePromises);
};

// 6. update the order in the data base with status pending
