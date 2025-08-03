import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { FeatureWrapper } from '../../components/features/FeatureWrapper';
import { useGetAdminStatsQuery, useGetOrganizationsQuery } from '../../store/api/apiSlice';
import { 
  Users, 
  Package, 
  DollarSign, 
  TrendingUp, 
  Building, 
  Settings, 
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { user, organization } = useSelector((state: RootState) => state.auth);
  const { data: stats, isLoading: statsLoading } = useGetAdminStatsQuery();
  const { data: organizations, isLoading: orgsLoading } = useGetOrganizationsQuery(
    undefined,
    { skip: user?.role !== 'super_admin' }
  );

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">
            {user?.role === 'super_admin' ? 'Platform Overview' : `${organization?.name} Management`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <BarChart3 className="w-4 h-4 mr-2" />
            Reports
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(stats?.revenue?.total || 0)}
              </p>
              <p className={`text-sm ${stats?.revenue?.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatPercentage(stats?.revenue?.growth || 0)} from last month
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.users?.active || 0}</p>
              <p className={`text-sm ${stats?.users?.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatPercentage(stats?.users?.growth || 0)} from last month
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.orders?.total || 0}</p>
              <p className={`text-sm ${stats?.orders?.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatPercentage(stats?.orders?.growth || 0)} from last month
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.deliveryRate || 0}%</p>
              <p className={`text-sm ${stats?.deliveryRateChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatPercentage(stats?.deliveryRateChange || 0)} from last month
              </p>
            </div>
            <div className="p-3 bg-emerald-100 rounded-full">
              <TrendingUp className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Business Model Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FeatureWrapper feature="assisted_purchase">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Assisted Purchase Performance</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Orders This Month</span>
                <span className="font-semibold">{stats?.assistedPurchase?.orders || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Revenue</span>
                <span className="font-semibold">{formatCurrency(stats?.assistedPurchase?.revenue || 0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Avg. Processing Time</span>
                <span className="font-semibold">{stats?.assistedPurchase?.avgProcessingTime || 0}h</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Success Rate</span>
                <Badge variant="green">{stats?.assistedPurchase?.successRate || 0}%</Badge>
              </div>
            </div>
          </Card>
        </FeatureWrapper>

        <FeatureWrapper feature="self_purchase">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Self Purchase Performance</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Packages This Month</span>
                <span className="font-semibold">{stats?.selfPurchase?.packages || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Revenue</span>
                <span className="font-semibold">{formatCurrency(stats?.selfPurchase?.revenue || 0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Avg. Processing Time</span>
                <span className="font-semibold">{stats?.selfPurchase?.avgProcessingTime || 0}h</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Success Rate</span>
                <Badge variant="green">{stats?.selfPurchase?.successRate || 0}%</Badge>
              </div>
            </div>
          </Card>
        </FeatureWrapper>
      </div>

      {/* Super Admin - Organizations Overview */}
      {user?.role === 'super_admin' && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Organizations</h3>
            <Button size="sm">
              <Building className="w-4 h-4 mr-2" />
              Add Organization
            </Button>
          </div>
          
          {orgsLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="space-y-4">
              {organizations?.map((org: any) => (
                <div key={org.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Building className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">{org.name}</h4>
                      <p className="text-sm text-gray-600">{org.slug}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right text-sm">
                      <p className="font-medium">{org.stats?.activeUsers || 0} users</p>
                      <p className="text-gray-600">{org.stats?.monthlyOrders || 0} orders/month</p>
                    </div>
                    
                    <div className="flex gap-2">
                      {org.features?.assisted_purchase?.enabled && (
                        <Badge variant="blue" size="sm">Assisted</Badge>
                      )}
                      {org.features?.self_purchase?.enabled && (
                        <Badge variant="green" size="sm">Self</Badge>
                      )}
                    </div>
                    
                    <Button variant="outline" size="sm">
                      Manage
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Recent Activity & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">System Alerts</h3>
          <div className="space-y-3">
            {stats?.alerts?.map((alert: any, index: number) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className={`p-1 rounded-full ${
                  alert.type === 'error' ? 'bg-red-100' : 
                  alert.type === 'warning' ? 'bg-yellow-100' : 'bg-blue-100'
                }`}>
                  {alert.type === 'error' ? (
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                  ) : alert.type === 'warning' ? (
                    <Clock className="w-4 h-4 text-yellow-600" />
                  ) : (
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{alert.message}</p>
                  <p className="text-xs text-gray-600">{alert.timestamp}</p>
                </div>
              </div>
            )) || (
              <p className="text-gray-600 text-center py-4">No alerts at this time</p>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {stats?.recentActivity?.map((activity: any, index: number) => (
              <div key={index} className="flex items-center gap-3 p-3 border-l-2 border-blue-200 bg-blue-50">
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.description}</p>
                  <p className="text-xs text-gray-600">{activity.timestamp}</p>
                </div>
                <Badge variant="blue" size="sm">{activity.type}</Badge>
              </div>
            )) || (
              <p className="text-gray-600 text-center py-4">No recent activity</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};