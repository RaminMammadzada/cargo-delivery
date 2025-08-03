import React from 'react';
import { Package, ShoppingCart, Truck, DollarSign, TrendingUp, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import StatusBadge from '../../components/ui/StatusBadge';
import { useAuth } from '../../hooks/useAuth';
import { UserRole } from '../../types';

const DashboardPage: React.FC = () => {
  const { user, userRole } = useAuth();
  
  // Demo data for now
  const metrics = {
    totalOrders: 24,
    totalRevenue: 5420,
    activePackages: 8,
    deliverySuccessRate: 98,
    customerSatisfaction: 4.7,
    averageProcessingTime: 2.5
  };

  const recentOrders = {
    data: [
      {
        id: '1',
        orderNumber: 'CG001234',
        status: 'delivered',
        totalAmount: 150,
        createdAt: new Date().toISOString()
      },
      {
        id: '2', 
        orderNumber: 'CG001235',
        status: 'in_warehouse',
        totalAmount: 89,
        createdAt: new Date().toISOString()
      }
    ]
  };

  const recentPackages = {
    data: [
      {
        id: '1',
        trackingNumber: 'CG123456789',
        status: 'in_transit_to_customer',
        currentLocation: { city: 'Baku' }
      },
      {
        id: '2',
        trackingNumber: 'CG123456790', 
        status: 'in_warehouse',
        currentLocation: { city: 'Germany Warehouse' }
      }
    ]
  };

  const isCustomer = userRole === UserRole.CUSTOMER;
  const isAdmin = userRole === UserRole.ORG_ADMIN || userRole === UserRole.SUPER_ADMIN;
  const isWarehouseStaff = userRole === UserRole.WAREHOUSE_STAFF || userRole === UserRole.WAREHOUSE_MANAGER;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    change, 
    changeType = 'positive',
    loading = false 
  }: {
    title: string;
    value: string | number;
    icon: React.ElementType;
    change?: string;
    changeType?: 'positive' | 'negative' | 'neutral';
    loading?: boolean;
  }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-secondary-600">{title}</p>
            {loading ? (
              <LoadingSpinner size="sm" />
            ) : (
              <p className="text-2xl font-bold text-secondary-900">{value}</p>
            )}
            {change && (
              <p className={`text-sm ${
                changeType === 'positive' ? 'text-green-600' : 
                changeType === 'negative' ? 'text-red-600' : 'text-secondary-600'
              }`}>
                {change}
              </p>
            )}
          </div>
          <div className="p-3 bg-primary-50 rounded-full">
            <Icon className="w-6 h-6 text-primary-600" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          {getGreeting()}, {user?.profile.firstName}!
        </h1>
        <p className="text-primary-100">
          {isCustomer && "Track your orders and manage your shipments"}
          {isAdmin && "Monitor your organization's performance and operations"}
          {isWarehouseStaff && "Manage warehouse operations and package processing"}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isCustomer && (
          <>
            <StatCard
              title="Active Orders"
              value={metrics.totalOrders}
              icon={ShoppingCart}
              change="+2 this week"
            />
            <StatCard
              title="Packages in Transit"
              value={metrics.activePackages}
              icon={Package}
              change="3 arriving soon"
            />
            <StatCard
              title="Total Spent"
              value={`$${metrics.totalRevenue}`}
              icon={DollarSign}
              change="+12% this month"
            />
            <StatCard
              title="Delivery Success"
              value={`${metrics.deliverySuccessRate}%`}
              icon={CheckCircle}
              change="Excellent!"
              changeType="positive"
            />
          </>
        )}

        {isAdmin && (
          <>
            <StatCard
              title="Total Orders"
              value={metrics.totalOrders}
              icon={ShoppingCart}
              change="+15% vs last month"
            />
            <StatCard
              title="Revenue"
              value={`$${metrics.totalRevenue}`}
              icon={DollarSign}
              change="+8.2% vs last month"
            />
            <StatCard
              title="Active Packages"
              value={metrics.activePackages}
              icon={Package}
              change="12 pending processing"
            />
            <StatCard
              title="Customer Satisfaction"
              value={`${metrics.customerSatisfaction}/5`}
              icon={TrendingUp}
              change="↑ 0.2 this month"
              changeType="positive"
            />
          </>
        )}

        {isWarehouseStaff && (
          <>
            <StatCard
              title="Packages to Process"
              value={metrics.activePackages}
              icon={Package}
              change="5 urgent"
              changeType="negative"
            />
            <StatCard
              title="Processed Today"
              value="24"
              icon={CheckCircle}
              change="↑ 20% vs yesterday"
              changeType="positive"
            />
            <StatCard
              title="Average Processing Time"
              value={`${metrics.averageProcessingTime}h`}
              icon={Clock}
              change="↓ 15min vs last week"
              changeType="positive"
            />
            <StatCard
              title="Issues Reported"
              value="3"
              icon={AlertCircle}
              change="2 resolved today"
              changeType="positive"
            />
          </>
        )}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader 
            title="Recent Orders" 
            action={
              <a href="/orders" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                View all
              </a>
            }
          />
          <CardContent>
            <div className="space-y-4">
              {recentOrders.data.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-secondary-900">#{order.orderNumber}</p>
                    <p className="text-sm text-secondary-600">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="font-medium text-secondary-900">
                      ${order.totalAmount}
                    </span>
                    <StatusBadge status={order.status} type="order" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Packages */}
        <Card>
          <CardHeader 
            title="Recent Packages" 
            action={
              <a href="/packages" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                View all
              </a>
            }
          />
          <CardContent>
            <div className="space-y-4">
              {recentPackages.data.map((pkg) => (
                <div key={pkg.id} className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-secondary-900">{pkg.trackingNumber}</p>
                    <p className="text-sm text-secondary-600">
                      {pkg.currentLocation?.city || 'In transit'}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <StatusBadge status={pkg.status} type="package" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader title="Quick Actions" />
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {isCustomer && (
              <>
                <a
                  href="/orders/create"
                  className="flex flex-col items-center p-4 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
                >
                  <ShoppingCart className="w-8 h-8 text-primary-600 mb-2" />
                  <span className="text-sm font-medium text-primary-700">Create Order</span>
                </a>
                <a
                  href="/tracking"
                  className="flex flex-col items-center p-4 bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors"
                >
                  <Truck className="w-8 h-8 text-secondary-600 mb-2" />
                  <span className="text-sm font-medium text-secondary-700">Track Package</span>
                </a>
              </>
            )}
            
            {isAdmin && (
              <>
                <a
                  href="/users"
                  className="flex flex-col items-center p-4 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
                >
                  <Package className="w-8 h-8 text-primary-600 mb-2" />
                  <span className="text-sm font-medium text-primary-700">Manage Users</span>
                </a>
                <a
                  href="/analytics"
                  className="flex flex-col items-center p-4 bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors"
                >
                  <TrendingUp className="w-8 h-8 text-secondary-600 mb-2" />
                  <span className="text-sm font-medium text-secondary-700">View Analytics</span>
                </a>
              </>
            )}

            {isWarehouseStaff && (
              <>
                <a
                  href="/warehouse"
                  className="flex flex-col items-center p-4 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
                >
                  <Package className="w-8 h-8 text-primary-600 mb-2" />
                  <span className="text-sm font-medium text-primary-700">Warehouse</span>
                </a>
                <a
                  href="/packages"
                  className="flex flex-col items-center p-4 bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors"
                >
                  <Truck className="w-8 h-8 text-secondary-600 mb-2" />
                  <span className="text-sm font-medium text-secondary-700">Process Packages</span>
                </a>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPage;