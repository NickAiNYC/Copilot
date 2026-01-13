// backend/stripeWebhook.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

app.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const event = stripe.webhooks.constructEvent(req.body, sig, process.env.WEBHOOK_SECRET);
  
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    await updateUserSubscription(session.client_reference_id, 'premium');
  }
  
  res.json({ received: true });
});
