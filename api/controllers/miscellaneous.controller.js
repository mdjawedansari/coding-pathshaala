import asyncHandler from '../middlewares/asyncHandler.middleware.js';
import User from '../models/user.model.js';
import AppError from '../utils/appError.js';
import sendEmail from '../utils/sendEmail.js';

/**
 * @CONTACT_US
 * @ROUTE @POST {{URL}}/api/v1/contact
 * @ACCESS Public
 */
export const contactUs = asyncHandler(async (req, res, next) => {
  const { name, email, message } = req.body;

  // Check for required fields
  if (!name || !email || !message) {
    return next(new AppError('Name, Email, and Message are required', 400));
  }

  try {
    const subject = 'Contact Us Form';
    const textMessage = `<p><strong>${name}</strong> - ${email} <br /> ${message}</p>`;

    // Send email
    await sendEmail(process.env.CONTACT_US_EMAIL, subject, textMessage);
  } catch (error) {
    console.error('Error sending email:', error); // Improved error logging
    return next(new AppError('Failed to send email, please try again later.', 500));
  }

  res.status(200).json({
    success: true,
    message: 'Your request has been submitted successfully',
  });
});

/**
 * @USER_STATS_ADMIN
 * @ROUTE @GET {{URL}}/api/v1/admin/stats/users
 * @ACCESS Private (ADMIN ONLY)
 */
export const userStats = asyncHandler(async (_req, res, next) => {
  try {
    const allUsersCount = await User.countDocuments();
    const subscribedUsersCount = await User.countDocuments({
      'subscription.status': 'active',
    });

    res.status(200).json({
      success: true,
      message: 'User statistics fetched successfully',
      allUsersCount,
      subscribedUsersCount,
    });
  } catch (error) {
    console.error('Error fetching user statistics:', error); // Improved error logging
    return next(new AppError('Failed to fetch user statistics, please try again later.', 500));
  }
});
