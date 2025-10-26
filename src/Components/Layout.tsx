import React from "react";
import { useAuth } from "../hooks/useAuth";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, MessageSquare, Star, Gift, Award, User as UserIcon, LogOut, LayoutDashboard } from "lucide-react"; // Renamed User to UserIcon to avoid conflict
import Notifications from "./Notifications"; // Import the Notifications component

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, profile, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navigation = [
    { name: "Home", href: "/", icon: Home },
    { name: "Loyalty", href: "/loyalty", icon: LayoutDashboard },
    { name: "Feedback", href: "/feedback", icon: MessageSquare },
    { name: "Earn Points", href: "/earn-points", icon: Star },
    { name: "Rewards", href: "/rewards", icon: Gift },
    { name: "Points History", href: "/points-history", icon: Award },
    { name: "Profile", href: "/profile", icon: UserIcon },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b-2 border-red-500 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-lg">た</span>
              </div>
              <div>
                <span className="text-2xl font-bold text-black">
                  Takoyadon
                </span>
                <div className="text-xs text-gray-600 -mt-1">
                  Authentic Japanese Food
                </div>
              </div>
            </Link>

            {user ? (
              <div className="flex items-center space-x-4">
                <Notifications />
                <span className="text-sm text-gray-700">
                  {profile?.google_user_data?.name || user.email}
                </span>
                <button
                  onClick={async () => {
                    await logout();
                    if (location.pathname.startsWith('/admin/')) {
                      navigate('/admin/login');
                    }
                  }}
                  className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/customer/login"
                  className="inline-flex items-center px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-all shadow-md hover:shadow-lg"
                >
                  <UserIcon className="w-4 h-4 mr-2" />
                  Login
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Bottom Navigation for Mobile */}
      {user && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-red-500 md:hidden shadow-lg">
          <div className="flex justify-around py-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                    isActive
                      ? "text-red-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-xs mt-1">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}

      {/* Side Navigation for Desktop */}
      {user && (
        <nav className="hidden md:fixed md:left-0 md:top-16 md:bottom-0 md:w-64 md:bg-white md:border-r-2 md:border-red-500 md:p-6 md:shadow-sm">
          <div className="space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? "bg-red-600 text-white shadow-lg"
                      : "text-gray-700 hover:bg-red-50 hover:text-red-600"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}

      {/* Content padding for desktop sidebar */}
      <div className={user ? "md:ml-64" : ""} />
    </div>
  );
}
