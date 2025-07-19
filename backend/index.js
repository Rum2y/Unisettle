import { Client, Users } from "node-appwrite";
const stripe = require("stripe")("YOUR_STRIPE_SECRET_KEY");

export default async function (req, res) {
  const client = new Client();
  const users = new Users(client);

  client
    .setEndpoint(req.variables["APPWRITE_ENDPOINT"])
    .setProject(req.variables["APPWRITE_PROJECT_ID"])
    .setKey(req.variables["APPWRITE_API_KEY"]);

  const { email, userId, priceId } = JSON.parse(req.body);

  // 1. Create a Stripe customer (or retrieve existing one)
  const customer = await stripe.customers.create({
    email: email,
    metadata: {
      appwriteUserId: userId,
    },
  });

  // 2. Create subscription
  const subscription = await stripe.subscriptions.create({
    customer: customer.id,
    items: [{ price: priceId }],
    payment_behavior: "default_incomplete",
    expand: ["latest_invoice.payment_intent"],
  });

  // 3. Return client secret to frontend
  res.json({
    clientSecret: subscription.latest_invoice.payment_intent.client_secret,
  });
}
