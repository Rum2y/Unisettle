import createSetupIntent from './createSetupIntent.js';
import createSubscription from './createSubscription.js';
import webhook from './webhook.js';
import cancelSubscription from './cancelSubscription.js';
import getDefaultPayment from './getDefaultPayment.js';
import updateSubscription from './updateSubscription.js';

export default async ({ req, res }) => {
  if (req.path === '/getDefaultPayment') {
    return getDefaultPayment(req, res);
  }
  if (req.path === '/createSetupIntent') {
    return createSetupIntent(req, res);
  }
  if (req.path === '/createSubscription') {
    return createSubscription(req, res);
  }
  if (req.path === '/webhook') {
    return webhook(req, res);
  }
  if (req.path === '/cancelSubscription') {
    return cancelSubscription(req, res);
  }
  if (req.path === '/updateSubscription') {
    return updateSubscription(req, res);
  }
  return res.json({
    message: 'Invalid endpoint',
    status: 404,
  });
};
