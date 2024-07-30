import { Router } from 'express';
import {
  getRazorpayApiKey,
  buySubscription,
  verifySubscription,
  cancelSubscription,
  allPayments,
} from '../controllers/payment.controller.js';
import {
  authorizeRoles,
  authorizeSubscribers,
  isLoggedIn,
} from '../middlewares/auth.middleware.js';

const router = Router();

// Route for subscribing to a plan
router.route('/subscribe').post(isLoggedIn, buySubscription);

// Route for verifying the subscription payment
router.route('/verify').post(isLoggedIn, verifySubscription);

// Route for unsubscribing from a plan, requires user to be logged in and subscribed
router.route('/unsubscribe').post(isLoggedIn, authorizeSubscribers, cancelSubscription);

// Route to get Razorpay API key, accessible only to logged-in users
router.route('/razorpay-key').get(isLoggedIn, getRazorpayApiKey);

// Route to get all payments, accessible only to admin users
router.route('/').get(isLoggedIn, authorizeRoles('ADMIN'), allPayments);

export default router;
