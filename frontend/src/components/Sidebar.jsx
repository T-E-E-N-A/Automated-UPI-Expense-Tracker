import { Link, useLocation } from 'react-router-dom';
import { useUser, useClerk } from '@clerk/clerk-react';
import { useApp } from '../context/AppContext';

const Sidebar = () => {
  const { user } = useUser();
  const { signOut } = useClerk();
  const { sidebarOpen, toggleSidebar } = useApp();
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: '📊' },
    { name: 'Expenses', path: '/expenses', icon: '💸' },
    { name: 'Income', path: '/income', icon: '💰' },
    { name: 'Profile', path: '/profile', icon: '👤' },
  ];

  const handleLogout = () => {
    signOut();
  };

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:shadow-none
        w-64
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <Link to="/profile" onClick={() => window.innerWidth < 1024 && toggleSidebar()}>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full overflow-hidden flex items-center justify-center text-white font-semibold">
                  {user?.imageUrl ? (
                    <img src={user.imageUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    (user?.firstName?.charAt(0) || 'U')
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">
                    {user?.firstName || 'User'}
                  </h2>
                  <p className="text-sm text-gray-500">{user?.emailAddresses[0]?.emailAddress}</p>
                </div>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.path}
                    className={`
                      flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200
                      ${location.pathname === item.path
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                      }
                    `}
                    onClick={() => window.innerWidth < 1024 && toggleSidebar()}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span className="font-medium">{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
            >
              <span className="text-xl">🚪</span>
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
