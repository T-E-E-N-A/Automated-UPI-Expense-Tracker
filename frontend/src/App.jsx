import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ClerkProvider, ClerkLoaded, useUser } from '@clerk/clerk-react';
import { AppProvider } from './context/AppContext';
import clerkIntegration from './services/clerkIntegration';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import ExpensesPage from './pages/ExpensesPage';
import IncomePage from './pages/IncomePage';
import ProfilePage from './pages/ProfilePage';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';

// Import Clerk publishable key
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// Component to handle Clerk user integration
const ClerkUserHandler = () => {
  const { user, isLoaded } = useUser();

  React.useEffect(() => {
    if (isLoaded && user) {
      clerkIntegration.initializeUser(user);
    }
  }, [user, isLoaded]);

  return null;
};

function App() {
  if (!clerkPubKey) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Configuration Error</h1>
          <p className="text-gray-600">Please set your Clerk publishable key in the environment variables.</p>
        </div>
      </div>
    );
  }

  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <ClerkLoaded>
        <ClerkUserHandler />
        <AppProvider>
          <Router>
            <div className="min-h-screen bg-gray-50">
              <Routes>
                {/* Public routes */}
                <Route path="/sign-in" element={<SignInPage />} />
                <Route path="/sign-up" element={<SignUpPage />} />
                
                {/* Protected routes */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <div className="flex h-screen">
                        <Sidebar />
                        <div className="flex-1 flex flex-col lg:ml-0">
                          <Header />
                          <main className="flex-1 overflow-y-auto">
                            <Dashboard />
                          </main>
                        </div>
                      </div>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <div className="flex h-screen">
                        <Sidebar />
                        <div className="flex-1 flex flex-col lg:ml-0">
                          <Header />
                          <main className="flex-1 overflow-y-auto">
                            <ProfilePage />
                          </main>
                        </div>
                      </div>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/expenses"
                  element={
                    <ProtectedRoute>
                      <div className="flex h-screen">
                        <Sidebar />
                        <div className="flex-1 flex flex-col lg:ml-0">
                          <Header />
                          <main className="flex-1 overflow-y-auto">
                            <ExpensesPage />
                          </main>
                        </div>
                      </div>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/income"
                  element={
                    <ProtectedRoute>
                      <div className="flex h-screen">
                        <Sidebar />
                        <div className="flex-1 flex flex-col lg:ml-0">
                          <Header />
                          <main className="flex-1 overflow-y-auto">
                            <IncomePage />
                          </main>
                        </div>
                      </div>
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </div>
          </Router>
        </AppProvider>
      </ClerkLoaded>
    </ClerkProvider>
  );
}

export default App;