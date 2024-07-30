import { Router } from 'express';
import {
  changePassword,
  forgotPassword,
  getLoggedInUserDetails,
  loginUser,
  logoutUser,
  registerUser,
  resetPassword,
  allUsers,
  updateUser,
} from '../controllers/user.controller.js';
import { authorizeRoles, isLoggedIn } from '../middlewares/auth.middleware.js';
import upload from '../middlewares/multer.middleware.js';

const router = Router();

// Route to get all users, accessible only to admin
router.get('/', isLoggedIn, authorizeRoles('ADMIN'), allUsers);

// Route to register a new user, allows file upload for avatar
router.post('/register', upload.single('avatar'), registerUser);

// Route for user login
router.post('/login', loginUser);

// Route for user logout
router.post('/logout', logoutUser);

// Route to get the logged-in user's details
router.get('/me', isLoggedIn, getLoggedInUserDetails);

// Route for initiating password reset
router.post('/reset', forgotPassword);

// Route for resetting password with token
router.post('/reset/:resetToken', resetPassword);

// Route to change password, accessible only to logged-in users
router.post('/change-password', isLoggedIn, changePassword);

// Route to update user details, allows file upload for avatar
router.put('/update/:id', isLoggedIn, upload.single('avatar'), updateUser);

export default router;
