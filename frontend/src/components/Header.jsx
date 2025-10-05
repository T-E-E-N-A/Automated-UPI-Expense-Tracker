import { useApp } from '../context/AppContext';
import { useUser } from '@clerk/clerk-react';
import { useEffect, useState } from 'react';
import api from '../services/api';

const Header = () => {
  const { toggleSidebar } = useApp();
  const { user } = useUser();
  const [alerts, setAlerts] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await api.getNotifications(user);
        setAlerts(res.alerts || []);
      } catch (e) {
        // ignore for header
      }
    };
    if (user) fetchAlerts();
  }, [user]);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 lg:hidden">
      <div className="flex items-center justify-between px-4 py-3">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className="text-xl font-semibold text-gray-800">Expense Tracker</h1>
        <div className="relative">
          <button
            onClick={() => setOpen(!open)}
            className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Notifications"
          >
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {alerts.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-medium leading-none text-white bg-red-600 rounded-full">{alerts.length}</span>
            )}
          </button>
          {open && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              <div className="p-3 border-b border-gray-100 font-medium text-gray-700">Notifications</div>
              <div className="max-h-80 overflow-auto">
                {alerts.length === 0 ? (
                  <div className="p-4 text-gray-500 text-sm">No notifications</div>
                ) : (
                  alerts.map((a, i) => (
                    <div key={i} className="p-3 border-b border-gray-100">
                      <div className="text-sm font-medium text-gray-800">{a.title || a.type}</div>
                      <div className="text-sm text-gray-600">{a.message}</div>
                      {a.action && <div className="text-xs text-gray-400 mt-1">{a.action}</div>}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
