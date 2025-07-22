import { Client, Databases, Query } from 'node-appwrite';
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function webhook(req, res) {
  const rawBody = req.bodyRaw || req.body;
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  const client = new Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(req.headers['x-appwrite-key'] ?? '');
  const databases = new Databases(client);

  let event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    console.error('Error constructing webhook event:', err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const allowedEvents = [
    { id: 'invoice.paid', status: 'active' },
    { id: 'invoice.payment_failed', status: 'past_due' },
    { id: 'customer.subscription.created' },
    { id: 'customer.subscription.updated' },
    { id: 'customer.subscription.deleted', status: 'canceled' },
  ];

  try {
    const allowedEvent = allowedEvents.find((e) => e.id === event.type);
    if (!allowedEvent) {
      console.warn(`Unhandled event type: ${event.type}`);
      return res
        .status(200)
        .json({ received: true, message: 'Event not handled' });
    }

    let customerId;
    let subscription;

    // Handle invoice events
    if (event.type.includes('invoice.')) {
      const invoice = event.data.object;
      customerId = invoice.customer;
      // Optionally fetch the subscription if needed
      if (invoice.subscription) {
        subscription = await stripe.subscriptions.retrieve(
          invoice.subscription
        );
      }
    } else {
      // Handle subscription events
      subscription = event.data.object;
      customerId = subscription.customer;
    }

    const customer = await stripe.customers.retrieve(customerId);
    const users = await databases.listDocuments(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_COLLECTION_ID,
      [Query.equal('customerId', customerId)]
    );

    if (users.total === 0) {
      if (event.type === 'customer.subscription.created') {
        console.log('Creating new user document for customer:', customerId);
        await databases.createDocument(
          process.env.APPWRITE_DATABASE_ID,
          process.env.APPWRITE_COLLECTION_ID,
          'unique()',
          {
            customerId: customerId,
            subscriptionId: subscription.id,
            status: subscription.status,
            name: customer.name || '',
            email: customer.email || '',
            userId: customer.metadata.userId || '',
            freeTrialEnd: subscription.trial_end
              ? new Date(subscription.trial_end * 1000).toISOString()
              : null,
          }
        );
        return res.json({ success: true });
      }
      return res.json({ message: 'User not found' });
    }

    const userDoc = users.documents[0];

    // Handle invoice or subscription deletion events
    if (
      event.type.includes('invoice.') ||
      event.type === 'customer.subscription.deleted'
    ) {
      await databases.updateDocument(
        process.env.APPWRITE_DATABASE_ID,
        process.env.APPWRITE_COLLECTION_ID,
        userDoc.$id,
        {
          status: allowedEvent.status,
        }
      );
      return res.json({ success: true });
    }

    // Handle subscription created/updated events
    if (
      event.type === 'customer.subscription.created' ||
      event.type === 'customer.subscription.updated'
    ) {
      await databases.updateDocument(
        process.env.APPWRITE_DATABASE_ID,
        process.env.APPWRITE_COLLECTION_ID,
        userDoc.$id,
        {
          subscriptionId: subscription.id,
          status: subscription.status,
          customerId: subscription.customer,
          name: customer.name || '',
          email: customer.email || '',
          userId: customer.metadata.userId || '',
          freeTrialEnd: subscription.trial_end
            ? new Date(subscription.trial_end * 1000).toISOString()
            : null,
        }
      );
      return res.json({ success: true });
    }

    return res.json({ received: true, message: 'Event processed' });
  } catch (err) {
    console.error('Error processing webhook:', err);
    return res.json({ error: 'Internal server error' });
  }
}
