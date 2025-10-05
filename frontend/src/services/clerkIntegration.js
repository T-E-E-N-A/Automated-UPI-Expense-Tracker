import { useUser } from '@clerk/clerk-react';
import apiService from './api';

class ClerkIntegration {
  constructor() {
    this.isInitialized = false;
  }

  // Initialize user in backend when Clerk user is available
  async initializeUser(user) {
    if (!user || this.isInitialized) return;

    try {
      // Check if user exists in backend
      const existingUser = await apiService.getProfile(user);
      console.log('User already exists in backend');
      this.isInitialized = true;
    } catch (error) {
      // User doesn't exist, create them
      if (error.message.includes('User not found') || error.message.includes('404')) {
        try {
          await this.createUserInBackend(user);
          console.log('User created in backend');
        } catch (createError) {
          console.error('Failed to create user in backend:', createError);
        }
      }
    }
  }

  // Create user in backend
  async createUserInBackend(clerkUser) {
    const userData = {
      clerkId: clerkUser.id,
      name: clerkUser.fullName || `${clerkUser.firstName} ${clerkUser.lastName}`,
      email: clerkUser.primaryEmailAddress?.emailAddress,
      profileImage: clerkUser.imageUrl,
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName
    };

    return await apiService.createUser(userData);
  }

  // Get user data from backend
  async getUserData(user) {
    try {
      return await apiService.getProfile(user);
    } catch (error) {
      console.error('Failed to get user data:', error);
      return null;
    }
  }

  // Handle user sign out
  handleSignOut() {
    this.isInitialized = false;
    localStorage.removeItem('authToken');
  }
}

export default new ClerkIntegration();
