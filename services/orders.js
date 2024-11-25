import Product from "../models/Product.js";

// 0. the user signed in
// and wants to checkout with the order
// and send all the product ids and quantities
export const getProducts = async (items) => {
  const products = await Promise.all(
    items.map(({ id }) => Product.findById(id))
  );

  const replaceIdsWithProducts = () =>
    items.map(({ id, quantity }) => ({
      product: products.find((p) => p._id.toString() === id),
      quantity: quantity,
    }));

  return replaceIdsWithProducts();
};

// 1. Make sure the products in stock
export const productsInStock = (products) => {
  return products.reduce(
    (prevStock, { product, quantity }) =>
      prevStock && product.stock >= quantity,
    true
  );
};
// 2. Calculate total price
export const calculateTotalPrice = (products) =>
  products.reduce(
    (total, { product, quantity }) => total + product.price * quantity,
    0
  );

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
