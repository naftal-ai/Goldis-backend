const stripe = require('stripe')('your-secret-key');

// API Endpoint to Create Payment Intent
app.post('/api/payment-intent', async (req, res) => {
  const { amount, currency } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount, // Amount in the smallest currency unit (e.g., cents for USD)
      currency, // E.g., 'usd'
    });

    res.status(200).json({
      clientSecret: paymentIntent.client_secret, // Send this to the front-end
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});
