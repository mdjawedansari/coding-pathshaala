import { Router } from 'express';
import {
  addLectureToCourseById,
  createCourse,
  deleteCourseById,
  getAllCourses,
  getLecturesByCourseId,
  removeLectureFromCourse,
  updateCourseById,
} from '../controllers/course.controller.js';
import {
  authorizeRoles,
  authorizeSubscribers,
  isLoggedIn,
} from '../middlewares/auth.middleware.js';
import upload from '../middlewares/multer.middleware.js';

const router = Router();

// Route for handling courses
router
  .route('/')
  .get(getAllCourses) // Fetch all courses
  .post(
    isLoggedIn, // Ensure the user is logged in
    authorizeRoles('ADMIN'), // Ensure the user has 'ADMIN' role
    upload.single('thumbnail'), // Handle single file upload for thumbnail
    createCourse // Create a new course
  );

// Route for handling lectures and course operations
router
  .route('/:id')
  .get(
    isLoggedIn, // Ensure the user is logged in
    authorizeSubscribers, // Ensure the user is authorized (either admin or subscribed)
    getLecturesByCourseId // Fetch lectures by course ID
  )
  .post(
    isLoggedIn, // Ensure the user is logged in
    authorizeRoles('ADMIN'), // Ensure the user has 'ADMIN' role
    upload.single('lecture'), // Handle single file upload for lecture
    addLectureToCourseById // Add lecture to course
  )
  .put(
    isLoggedIn, // Ensure the user is logged in
    authorizeRoles('ADMIN'), // Ensure the user has 'ADMIN' role
    updateCourseById // Update course details
  )
  .delete(
    isLoggedIn, // Ensure the user is logged in
    authorizeRoles('ADMIN'), // Ensure the user has 'ADMIN' role
    deleteCourseById // Delete course by ID
  );

// Route to remove lecture from a course
router
  .route('/remove-lecture/:id')
  .delete(
    isLoggedIn, // Ensure the user is logged in
    authorizeRoles('ADMIN'), // Ensure the user has 'ADMIN' role
    removeLectureFromCourse // Remove lecture from course
  );

export default router;
