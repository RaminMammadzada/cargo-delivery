import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { clsx } from 'clsx';
import {
  Home,
  Package,
  ShoppingCart,
  Truck,
  Users,
  Settings,
  BarChart3,
  FileText,
  CreditCard,
  Building2,
  UserCog,
  Bell,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useOrganization } from '../../hooks/useOrganization';
import { UserRole } from '../../types';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const { userRole, checkRole } = useAuth();
  const { isAssistedPurchaseEnabled, isSelfPurchaseEnabled } = useOrganization();
  const location = useLocation();

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home,
      roles: [UserRole.CUSTOMER, UserRole.WAREHOUSE_STAFF, UserRole.ORG_ADMIN, UserRole.SUPER_ADMIN],
    },
    {
      name: 'Orders',
      href: '/orders',
      icon: ShoppingCart,
      roles: [UserRole.CUSTOMER, UserRole.PURCHASE_AGENT, UserRole.CUSTOMER_SERVICE, UserRole.ORG_ADMIN],
      badge: 'New',
    },
    {
      name: 'Create Order',
      href: '/orders/create',
      icon: Package,
      roles: [UserRole.CUSTOMER],
      show: isAssistedPurchaseEnabled() || isSelfPurchaseEnabled(),
    },
    {
      name: 'Packages',
      href: '/packages',
      icon: Package,
      roles: [UserRole.CUSTOMER, UserRole.WAREHOUSE_STAFF, UserRole.WAREHOUSE_MANAGER, UserRole.ORG_ADMIN],
    },
    {
      name: 'Tracking',
      href: '/tracking',
      icon: Truck,
      roles: [UserRole.CUSTOMER, UserRole.WAREHOUSE_STAFF, UserRole.CUSTOMER_SERVICE],
    },
    {
      name: 'Warehouse',
      href: '/warehouse',
      icon: Building2,
      roles: [UserRole.WAREHOUSE_STAFF, UserRole.WAREHOUSE_MANAGER, UserRole.ORG_ADMIN],
    },
    {
      name: 'Users',
      href: '/users',
      icon: Users,
      roles: [UserRole.ORG_ADMIN, UserRole.SUPER_ADMIN],
    },
    {
      name: 'Organizations',
      href: '/organizations',
      icon: Building2,
      roles: [UserRole.SUPER_ADMIN],
    },
    {
      name: 'Analytics',
      href: '/analytics',
      icon: BarChart3,
      roles: [UserRole.ORG_ADMIN, UserRole.SUPER_ADMIN, UserRole.WAREHOUSE_MANAGER],
    },
    {
      name: 'Payments',
      href: '/payments',
      icon: CreditCard,
      roles: [UserRole.CUSTOMER, UserRole.ORG_ADMIN],
    },
    {
      name: 'Documents',
      href: '/documents',
      icon: FileText,
      roles: [UserRole.CUSTOMER, UserRole.WAREHOUSE_STAFF, UserRole.ORG_ADMIN],
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
      roles: [UserRole.CUSTOMER, UserRole.ORG_ADMIN, UserRole.SUPER_ADMIN],
    },
  ];

  const filteredItems = navigationItems.filter(item => {
    // Check role permissions
    const hasRole = item.roles.some(role => checkRole(role));
    if (!hasRole) return false;

    // Check feature-specific visibility
    if (item.show !== undefined) return item.show;

    return true;
  });

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return location.pathname === '/dashboard' || location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div
        className={clsx(
          'fixed inset-y-0 left-0 z-30 flex flex-col bg-white border-r border-secondary-200 transition-all duration-300 ease-in-out',
          'data-testid="sidebar"',
          isOpen ? 'w-64' : 'w-16',
          'lg:relative lg:translate-x-0',
          !isOpen && 'lg:w-16',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-secondary-200">
          {isOpen && (
            <div className="flex items-center">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <span className="ml-2 text-lg font-semibold text-secondary-900">
                CargoFlow
              </span>
            </div>
          )}
          
          <button
            onClick={onToggle}
            className="p-1.5 rounded-lg hover:bg-secondary-100 transition-colors"
          >
            {isOpen ? (
              <ChevronLeft className="w-5 h-5 text-secondary-600" />
            ) : (
              <ChevronRight className="w-5 h-5 text-secondary-600" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={clsx(
                  'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200',
                  active
                    ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-600'
                    : 'text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900',
                  !isOpen && 'justify-center'
                )}
                title={!isOpen ? item.name : undefined}
              >
                <Icon className={clsx('flex-shrink-0 w-5 h-5', isOpen && 'mr-3')} />
                {isOpen && (
                  <>
                    <span className="flex-1">{item.name}</span>
                    {item.badge && (
                      <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-primary-100 text-primary-700 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-secondary-200">
          <div className="space-y-1">
            <NavLink
              to="/notifications"
              className={clsx(
                'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                'text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900',
                !isOpen && 'justify-center'
              )}
              title={!isOpen ? 'Notifications' : undefined}
            >
              <Bell className={clsx('flex-shrink-0 w-5 h-5', isOpen && 'mr-3')} />
              {isOpen && <span>Notifications</span>}
            </NavLink>
            
            <NavLink
              to="/help"
              className={clsx(
                'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                'text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900',
                !isOpen && 'justify-center'
              )}
              title={!isOpen ? 'Help & Support' : undefined}
            >
              <HelpCircle className={clsx('flex-shrink-0 w-5 h-5', isOpen && 'mr-3')} />
              {isOpen && <span>Help & Support</span>}
            </NavLink>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;