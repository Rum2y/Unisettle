import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function updateSubscription(req, res) {
  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  const { customerId } = body;
  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: 'all',
    limit: 1,
  });

  if (!subscriptions || subscriptions.data.length === 0) {
    return res.json({
      error: 'No active subscriptions found for this customer.',
    });
  }
  const subscriptionId = subscriptions.data[0].id;
  const updatedSubscription = await stripe.subscriptions.update(
    subscriptionId,
    {
      cancel_at_period_end: false,
    }
  );
  return res.json(updatedSubscription);
}
