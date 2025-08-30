import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';
import { sideMenuData } from '../../utils/data';

const SideMenu = ({ activeMenu }) => {
  const { user, clearUser } = useContext(UserContext);
  const navigate = useNavigate();

  const handleClick = (route) => {
    if (route === "Logout") {
      handleLogout();
      return;
    }
    navigate(route);
  };

  const handleLogout = () => {
    clearUser();
    navigate('/login');
  };

  return (
    <div className="w-64 h-screen bg-gray-100 shadow-lg p-4 flex flex-col">
      {/* Profile Section */}
      <div className="flex flex-col items-center mb-6">
        {user?.profileImageUrl ? (
          <img
            src={user.profileImageUrl}
            alt="Profile"
            className="w-16 h-16 rounded-full object-cover mb-2"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center mb-2">
            👤
          </div>
        )}
        <h5 className="text-lg font-semibold">
          {user?.name || "Guest"}
        </h5>
      </div>

      {/* Menu Items */}
      <div className="flex flex-col gap-2">
        {sideMenuData.map((item, index) => (
          <button
            key={`menu_${index}`}
            onClick={() => handleClick(item.path)}
            className={`flex items-center gap-2 p-2 rounded-md w-full text-left transition-all duration-200
              ${activeMenu === item.label ? 'bg-blue-500 text-white' : 'hover:bg-gray-200'}`}
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SideMenu;
