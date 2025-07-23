import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function getDefaultPayment(req, res) {
  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  const { email } = body;

  // Validate the email
  const existingCustomer = await stripe.customers.list({
    email,
    limit: 1,
  });

  const customerGotten = existingCustomer.data[0];
  if (!customerGotten) {
    return res.json({ error: 'Customer not found' });
  }

  try {
    // Retrieve the customer
    const customer = await stripe.customers.retrieve(customerGotten.id);

    // Get the default payment method
    const defaultPaymentMethod =
      customer.invoice_settings?.default_payment_method;

    let defaultPaymentMethodDetails;
    if (defaultPaymentMethod) {
      defaultPaymentMethodDetails =
        await stripe.paymentMethods.retrieve(defaultPaymentMethod);
    }

    return res.json({
      customerId: customer.id,
      defaultPaymentMethod: defaultPaymentMethodDetails,
    });
  } catch (error) {
    console.error('Error retrieving default payment method:', error);
    return res.json({ error: 'Internal Server Error' });
  }
}
