import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { notificationService } from '@/services/notification.service';
import { Notification } from '@/types';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await notificationService.getNotifications({
        limit: 10,
        is_read: false,
      });
      setNotifications(data.notifications);
      setUnreadCount(data.unread_count);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      loadNotifications();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      loadNotifications();
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="text-2xl font-bold text-primary-600">
              TaskPlanner
            </Link>
            <div className="ml-10 flex space-x-4">
              <Link
                to="/dashboard"
                className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md"
              >
                Dashboard
              </Link>
              <Link
                to="/plans"
                className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md"
              >
                Plans
              </Link>
              <Link
                to="/tasks"
                className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md"
              >
                Tasks
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-gray-600 hover:text-primary-600"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-50">
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-lg font-semibold">Notifications</h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllAsRead}
                          className="text-sm text-primary-600 hover:underline"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">
                          No new notifications
                        </p>
                      ) : (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className="border-b py-3 hover:bg-gray-50 cursor-pointer"
                            onClick={() => handleMarkAsRead(notification.id)}
                          >
                            <p className="font-semibold text-sm">
                              {notification.title}
                            </p>
                            <p className="text-sm text-gray-600">
                              {notification.message}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-3">
              {user?.profile_picture ? (
                <img
                  src={user.profile_picture}
                  alt={user.full_name || user.email}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white">
                  {user?.email[0].toUpperCase()}
                </div>
              )}
              <span className="text-gray-700">{user?.full_name || user?.email}</span>
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-red-600"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
