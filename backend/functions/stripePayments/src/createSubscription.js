import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function createSubscription(req, res) {
  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

  const { paymentMethodId, customerId, trial } = body;

  try {
    // 1. Retrieve Customer
    const customer = await stripe.customers.retrieve(customerId);

    // 2. Attach & Set Default Payment Method
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customer.id,
    });

    await stripe.customers.update(customer.id, {
      invoice_settings: { default_payment_method: paymentMethodId },
    });

    // 3. Create Subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: process.env.STRIPE_PRICE_ID }],
      payment_behavior: 'default_incomplete',
      trial_period_days: trial || 0, // Use provided trial or default to 0
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.confirmation_secret'],
    });

    // 4. Return Client Secret
    const clientSecret =
      subscription?.latest_invoice.confirmation_secret?.client_secret || null;

    if (!clientSecret) {
      // No payment intent — likely due to free trial
      return res.json({
        subscriptionId: subscription.id,
        customerId: customer.id,
        message: 'Trial started – no immediate payment required',
      });
    }

    return res.json({
      clientSecret,
      subscriptionId: subscription.id,
      customerId: customer.id,
    });
  } catch (err) {
    console.error('Stripe Error:', err.type, err.code, err.message);
    return res.json({
      error: err.message,
      type: err.type,
      code: err.code,
    });
  }
}
