import React from 'react';
import { Menu, Search, Bell, User, LogOut, Settings, ChevronDown } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useOrganization } from '../../hooks/useOrganization';
import Button from '../ui/Button';
import { Menu as HeadlessMenu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { Link } from 'react-router-dom';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const { organization } = useOrganization();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="bg-white border-b border-secondary-200 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-lg hover:bg-secondary-100 transition-colors lg:hidden"
          >
            <Menu className="w-5 h-5 text-secondary-600" />
          </button>

          {/* Search */}
          <div className="hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary-400" />
              <input
                type="text"
                placeholder="Search orders, packages..."
                className="pl-10 pr-4 py-2 w-80 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Organization info */}
          {organization && (
            <div className="hidden md:block text-sm text-secondary-600">
              <span className="font-medium">{organization.name}</span>
            </div>
          )}

          {/* Notifications */}
          <button className="relative p-2 rounded-lg hover:bg-secondary-100 transition-colors">
            <Bell className="w-5 h-5 text-secondary-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User menu */}
          <HeadlessMenu as="div" className="relative">
            <HeadlessMenu.Button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-secondary-100 transition-colors">
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="hidden md:block text-left">
                <div className="text-sm font-medium text-secondary-900">
                  {user?.profile.firstName} {user?.profile.lastName}
                </div>
                <div className="text-xs text-secondary-500 capitalize">
                  {user?.role.replace('_', ' ')}
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-secondary-400" />
            </HeadlessMenu.Button>

            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <HeadlessMenu.Items className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-secondary-200 focus:outline-none z-50">
                <div className="py-1">
                  <HeadlessMenu.Item>
                    {({ active }) => (
                      <Link
                        to="/profile"
                        className={`${
                          active ? 'bg-secondary-50' : ''
                        } flex items-center px-4 py-2 text-sm text-secondary-700`}
                      >
                        <User className="w-4 h-4 mr-3" />
                        Profile
                      </Link>
                    )}
                  </HeadlessMenu.Item>
                  
                  <HeadlessMenu.Item>
                    {({ active }) => (
                      <Link
                        to="/settings"
                        className={`${
                          active ? 'bg-secondary-50' : ''
                        } flex items-center px-4 py-2 text-sm text-secondary-700`}
                      >
                        <Settings className="w-4 h-4 mr-3" />
                        Settings
                      </Link>
                    )}
                  </HeadlessMenu.Item>

                  <div className="border-t border-secondary-200 my-1"></div>
                  
                  <HeadlessMenu.Item>
                    {({ active }) => (
                      <button
                        onClick={handleLogout}
                        className={`${
                          active ? 'bg-secondary-50' : ''
                        } flex items-center w-full px-4 py-2 text-sm text-secondary-700`}
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        Sign out
                      </button>
                    )}
                  </HeadlessMenu.Item>
                </div>
              </HeadlessMenu.Items>
            </Transition>
          </HeadlessMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;