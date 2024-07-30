import crypto from 'crypto';
import asyncHandler from '../middlewares/asyncHandler.middleware.js';
import User from '../models/user.model.js';
import AppError from '../utils/appError.js';
import { razorpay } from '../../index.js';
import Payment from '../models/payment.model.js';

/**
 * @ACTIVATE_SUBSCRIPTION
 * @ROUTE @POST {{URL}}/api/v1/payments/subscribe
 * @ACCESS Private (Logged in user only)
 */
export const buySubscription = asyncHandler(async (req, res, next) => {
  const { id } = req.user;

  // Find the user
  const user = await User.findById(id);

  if (!user) {
    return next(new AppError('Unauthorized, please login', 401));
  }

  // Check user role
  if (user.role === 'ADMIN') {
    return next(new AppError('Admin cannot purchase a subscription', 400));
  }

  try {
    // Create subscription
    const subscription = await razorpay.subscriptions.create({
      plan_id: process.env.RAZORPAY_PLAN_ID,
      customer_notify: 1,
      total_count: 12,
    });

    // Update user subscription
    user.subscription.id = subscription.id;
    user.subscription.status = subscription.status;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Subscribed successfully',
      subscription_id: subscription.id,
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    return next(new AppError('Subscription creation failed, please try again.', 500));
  }
});

/**
 * @VERIFY_SUBSCRIPTION
 * @ROUTE @POST {{URL}}/api/v1/payments/verify
 * @ACCESS Private (Logged in user only)
 */
export const verifySubscription = asyncHandler(async (req, res, next) => {
  const { id } = req.user;
  const { razorpay_payment_id, razorpay_subscription_id, razorpay_signature } = req.body;

  // Find the user
  const user = await User.findById(id);
  if (!user) {
    return next(new AppError('Unauthorized, please login', 401));
  }

  // Generate the expected signature
  const subscriptionId = user.subscription.id;
  const generatedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_SECRET)
    .update(`${razorpay_payment_id}|${subscriptionId}`)
    .digest('hex');

  // Verify the signature
  if (generatedSignature !== razorpay_signature) {
    return next(new AppError('Payment verification failed', 400));
  }

  try {
    // Save payment details
    await Payment.create({
      razorpay_payment_id,
      razorpay_subscription_id,
      razorpay_signature,
    });

    // Update user subscription status
    user.subscription.status = 'active';
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    return next(new AppError('Payment verification failed, please try again.', 500));
  }
});

/**
 * @CANCEL_SUBSCRIPTION
 * @ROUTE @POST {{URL}}/api/v1/payments/unsubscribe
 * @ACCESS Private (Logged in user only)
 */
export const cancelSubscription = asyncHandler(async (req, res, next) => {
  const { id } = req.user;

  // Find the user
  const user = await User.findById(id);
  if (!user) {
    return next(new AppError('Unauthorized, please login', 401));
  }

  if (user.role === 'ADMIN') {
    return next(new AppError('Admin cannot cancel subscriptions', 400));
  }

  const subscriptionId = user.subscription.id;

  try {
    // Cancel subscription
    const subscription = await razorpay.subscriptions.cancel(subscriptionId);

    // Update user subscription status
    user.subscription.status = subscription.status;
    await user.save();

    // Find payment record
    const payment = await Payment.findOne({ razorpay_subscription_id: subscriptionId });
    if (!payment) {
      return next(new AppError('Payment record not found', 404));
    }

    const timeSinceSubscribed = Date.now() - payment.createdAt;
    const refundPeriod = 14 * 24 * 60 * 60 * 1000; // 14 days

    if (timeSinceSubscribed > refundPeriod) {
      return next(new AppError('Refund period has expired', 400));
    }

    // Refund the payment
    await razorpay.payments.refund(payment.razorpay_payment_id, { speed: 'optimum' });

    // Remove subscription and payment records
    user.subscription.id = undefined;
    user.subscription.status = undefined;
    await user.save();
    await payment.remove();

    res.status(200).json({
      success: true,
      message: 'Subscription canceled successfully',
    });
  } catch (error) {
    console.error('Error canceling subscription:', error);
    return next(new AppError('Subscription cancellation failed, please try again.', 500));
  }
});

/**
 * @GET_RAZORPAY_ID
 * @ROUTE @POST {{URL}}/api/v1/payments/razorpay-key
 * @ACCESS Public
 */
export const getRazorpayApiKey = asyncHandler(async (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Razorpay API key',
    key: process.env.RAZORPAY_KEY_ID,
  });
});

/**
 * @GET_ALL_PAYMENTS
 * @ROUTE @GET {{URL}}/api/v1/payments
 * @ACCESS Private (ADMIN only)
 */
export const allPayments = asyncHandler(async (req, res, next) => {
  const { count = 10, skip = 0 } = req.query;

  try {
    // Fetch all payments
    const allPayments = await razorpay.subscriptions.all({ count, skip });

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];

    const finalMonths = monthNames.reduce((acc, month) => {
      acc[month] = 0;
      return acc;
    }, {});

    // Count payments per month
    allPayments.items.forEach(payment => {
      const month = new Date(payment.start_at * 1000).toLocaleString('default', { month: 'long' });
      if (finalMonths.hasOwnProperty(month)) {
        finalMonths[month] += 1;
      }
    });

    const monthlySalesRecord = monthNames.map(month => finalMonths[month]);

    res.status(200).json({
      success: true,
      message: 'All payments',
      allPayments,
      finalMonths,
      monthlySalesRecord,
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    return next(new AppError('Failed to fetch payments, please try again.', 500));
  }
});
