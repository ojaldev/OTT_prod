const express = require('express');
const userController = require('../controllers/userController');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Get current user profile
router.get('/profile', authenticate, userController.getProfile);

// Update current user profile
router.put('/profile', authenticate, userController.updateProfile);

// Get all users (Admin only)
router.get('/', [authenticate, requireAdmin], userController.getAllUsers);

// Get user by ID (Admin only)
router.get('/:id', [authenticate, requireAdmin], userController.getUserById);

// Update user role (Admin only)
router.put('/:id/role', [authenticate, requireAdmin], userController.updateUserRole);

// Bulk update user roles (Admin only)
router.put('/bulk/roles', [authenticate, requireAdmin], userController.bulkUpdateRoles);

// Toggle user status (Admin only)
router.put('/:id/toggle-status', [authenticate, requireAdmin], userController.toggleUserStatus);

// Bulk toggle user status (Admin only)
router.put('/bulk/status', [authenticate, requireAdmin], userController.bulkToggleStatus);

// Delete user (Admin only)
router.delete('/:id', [authenticate, requireAdmin], userController.deleteUser);

// User activity tracking

// Get activities for a specific user (Admin only)
router.get('/:id/activities', [authenticate, requireAdmin], userController.getUserActivities);

// Get all user activities (Admin only)
router.get('/activities/all', [authenticate, requireAdmin], userController.getAllActivities);

module.exports = router;
