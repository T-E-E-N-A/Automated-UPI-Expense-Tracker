import User from '../models/User.js';

// Middleware to authenticate Clerk users
export const authenticateClerkUser = async (req, res, next) => {
  try {
    // Allow Clerk identifiers via headers for GET/HEAD requests
    const headerClerkId = req.headers['x-clerk-id'];
    const headerClerkEmail = req.headers['x-clerk-email'];
    const { clerkId: bodyClerkId, clerkEmail: bodyClerkEmail } = req.body || {};
    const clerkId = bodyClerkId || headerClerkId;
    const clerkEmail = bodyClerkEmail || headerClerkEmail;

    if (!clerkId) {
      return res.status(401).json({
        success: false,
        message: 'Clerk ID is required'
      });
    }

    // Find user by Clerk ID
    let user = await User.findOne({ clerkId });

    // If user doesn't exist, create them
    if (!user) {
      if (!clerkEmail) {
        return res.status(400).json({
          success: false,
          message: 'User not found and email is required to create new user'
        });
      }

      // Create new user
      user = new User({
        clerkId,
        email: clerkEmail,
        name: req.body.name || 'User',
        profileImage: req.body.profileImage,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        isActive: true,
        lastLogin: new Date()
      });

      await user.save();
      console.log('New user created:', user.email);
    } else {
      // Update last login
      user.lastLogin = new Date();
      await user.save();
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Clerk authentication error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Middleware for routes that need Clerk user but don't create new users
export const requireClerkUser = async (req, res, next) => {
  try {
    const headerClerkId = req.headers['x-clerk-id'];
    const { clerkId: bodyClerkId } = req.body || {};
    const clerkId = bodyClerkId || headerClerkId;

    if (!clerkId) {
      return res.status(401).json({
        success: false,
        message: 'Clerk ID is required'
      });
    }

    // Find user by Clerk ID
    const user = await User.findOne({ clerkId });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found. Please sign up first.'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Clerk user lookup error:', error);
    res.status(500).json({
      success: false,
      message: 'User lookup failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};
