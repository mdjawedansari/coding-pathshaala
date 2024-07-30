import { Router } from 'express';
import {
  contactUs,
  userStats,
} from '../controllers/miscellaneous.controller.js';
import { authorizeRoles, isLoggedIn } from '../middlewares/auth.middleware.js';

const router = Router();

// Route for contacting support
router.route('/contact').post(contactUs);

// Route for admin stats, protected by authentication and authorization
router
  .route('/admin/stats/users')
  .get(
    isLoggedIn, // Ensure the user is logged in
    authorizeRoles('ADMIN'), // Ensure the user has 'ADMIN' role
    userStats // Fetch user statistics
  );

export default router;
