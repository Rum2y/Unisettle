import createSetupIntent from './createSetupIntent.js';
import createSubscription from './createSubscription.js';
import webhook from './webhook.js';

export default async ({ req, res }) => {
  if (req.path === '/createSetupIntent') {
    return createSetupIntent(req, res);
  }
  if (req.path === '/createSubscription') {
    return createSubscription(req, res);
  }
  if (req.path === '/webhook') {
    return webhook(req, res);
  }
  return res.json({
    message: 'Invalid endpoint',
    status: 404,
  });
};
