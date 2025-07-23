import { Client, Databases } from 'node-appwrite';
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function cancelSubscription(req, res) {
  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  const { subscriptionId, docId } = body;

  const client = new Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(req.headers['x-appwrite-key'] ?? '');
  const databases = new Databases(client);

  if (!subscriptionId) {
    return res.json({ error: 'Subscription ID is required' });
  }

  try {
    //Delete the subscription from Stripe
    const deletedSubscription = await stripe.subscriptions.update(
      subscriptionId,
      {
        cancel_at_period_end: true,
      }
    );

    // Update the Appwrite document to indicate cancellation
    await databases.updateDocument(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_COLLECTION_ID,
      docId,
      {
        cancellationRequested: true,
      }
    );
    return res.json({ subscription: deletedSubscription });
  } catch (error) {
    console.error('Error canceling subscription:', error);
    return res.json({ error: 'Failed to cancel subscription' });
  }
}
