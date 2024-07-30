import jwt from "jsonwebtoken";
import AppError from "../utils/appError.js";
import asyncHandler from "./asyncHandler.middleware.js";
import User from "../models/user.model.js";

export const isLoggedIn = asyncHandler(async (req, _res, next) => {
  // Extract token from cookies
  const { token } = req.cookies;

  // If no token, send unauthorized message
  if (!token) {
    return next(new AppError("Unauthorized, please login to continue", 401));
  }

  // Decode the token using jwt verify method
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // If no decode, send unauthorized message
  if (!decoded) {
    return next(new AppError("Unauthorized, please login to continue", 401));
  }

  // Store the decoded user info in req object
  req.user = decoded;

  // Proceed to the next middleware
  next();
});

// Middleware to check if user has the required roles
export const authorizeRoles = (...roles) => 
  asyncHandler(async (req, _res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError("You do not have permission to view this route", 403));
    }
    next();
  });

// Middleware to check if user has an active subscription
export const authorizeSubscribers = asyncHandler(async (req, _res, next) => {
  const user = await User.findById(req.user.id);

  // If user is not admin or does not have an active subscription, send an error
  if (user.role !== "ADMIN" && user.subscription.status !== "active") {
    return next(new AppError("Please subscribe to access this route.", 403));
  }

  // Proceed to the next middleware
  next();
});
