import express from 'express';
import User from '../models/User.js';
import { requireClerkUser } from '../middleware/clerkAuth.js';
import { validateUserRegistration, validateUserLogin } from '../middleware/validation.js';

const router = express.Router();

// @route   POST /api/auth/create-user
// @desc    Create user from Clerk authentication
// @access  Public (Clerk handles auth)
router.post('/create-user', async (req, res) => {
  try {
    const { clerkId, name, email, profileImage, firstName, lastName } = req.body;

    // Check if user already exists by Clerk ID
    const existingUser = await User.findOne({ clerkId });
    if (existingUser) {
      return res.json({
        success: true,
        message: 'User already exists',
        user: {
          id: existingUser._id,
          clerkId: existingUser.clerkId,
          name: existingUser.name,
          email: existingUser.email,
          profileImage: existingUser.profileImage,
          createdAt: existingUser.createdAt
        }
      });
    }

    // Create new user
    const user = new User({
      clerkId,
      name: name || `${firstName} ${lastName}`,
      email,
      profileImage,
      firstName,
      lastName,
      isActive: true,
      lastLogin: new Date()
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: {
        id: user._id,
        clerkId: user.clerkId,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create user',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Legacy signup/login kept for non-Clerk flow if needed
router.post('/signup', validateUserRegistration, async (req, res) => {
  return res.status(400).json({ success: false, message: 'Signup disabled. Use Clerk.' });
});

router.post('/login', validateUserLogin, async (req, res) => {
  return res.status(400).json({ success: false, message: 'Login disabled. Use Clerk.' });
});

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', requireClerkUser, async (req, res) => {
  try {
    res.json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        phoneNumber: req.user.phoneNumber,
        profileImage: req.user.profileImage,
        createdAt: req.user.createdAt,
        lastLogin: req.user.lastLogin
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user profile',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', requireClerkUser, async (req, res) => {
  try {
    const { name, firstName, lastName, phoneNumber, profileImage } = req.body;
    const updates = {};

    if (name) updates.name = name.trim();
    if (firstName !== undefined) updates.firstName = firstName?.trim() || '';
    if (lastName !== undefined) updates.lastName = lastName?.trim() || '';
    if (phoneNumber !== undefined) updates.phoneNumber = phoneNumber?.trim() || null;
    if (profileImage !== undefined) updates.profileImage = profileImage || null;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        profileImage: user.profileImage,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private
router.post('/logout', requireClerkUser, (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// @route   DELETE /api/auth/account
// @desc    Delete user account
// @access  Private
router.delete('/account', requireClerkUser, async (req, res) => {
  try {
    // Soft delete - deactivate account
    await User.findByIdAndUpdate(req.user._id, { isActive: false });
    
    res.json({
      success: true,
      message: 'Account deactivated successfully'
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete account',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

export default router;
