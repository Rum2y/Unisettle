import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function createSetupIntent(req, res) {
  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

  const { email, userId, name } = body;

  try {
    //Create a new customer if email is provided
    const exisitingCustomer = await stripe.customers.list({
      email,
      limit: 1,
    });
    let customer;
    if (exisitingCustomer.data.length > 0) {
      customer = exisitingCustomer.data[0];
    } else {
      customer = await stripe.customers.create({
        email,
        name,
        metadata: { userId },
      });
    }

    // Create a new SetupIntent
    const setupIntent = await stripe.setupIntents.create({
      customer: customer.id,
      metadata: { userId: userId },
    });

    // Return the client secret
    return res.json({
      clientSecret: setupIntent.client_secret,
      customerId: customer.id,
    });
  } catch (error) {
    console.error('Error creating SetupIntent:', error);
    return res.json({ error: 'Internal Server Error' });
  }
}
