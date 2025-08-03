import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Modal } from '../../components/ui/Modal';
import { 
  useGetOrganizationSettingsQuery, 
  useUpdateOrganizationSettingsMutation,
  useToggleFeatureMutation 
} from '../../store/api/apiSlice';
import { 
  Settings, 
  Building, 
  Users, 
  CreditCard, 
  Globe, 
  Shield, 
  Bell,
  Save,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';

export const OrganizationSettings: React.FC = () => {
  const { user, organization } = useSelector((state: RootState) => state.auth);
  const [activeTab, setActiveTab] = useState('general');
  const [showFeatureModal, setShowFeatureModal] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);

  const { data: settings, isLoading } = useGetOrganizationSettingsQuery();
  const [updateSettings, { isLoading: isUpdating }] = useUpdateOrganizationSettingsMutation();
  const [toggleFeature, { isLoading: isTogglingFeature }] = useToggleFeatureMutation();

  const handleFeatureToggle = async (featureName: string, enabled: boolean) => {
    if (user?.role !== 'super_admin' && user?.role !== 'org_admin') {
      return;
    }

    try {
      await toggleFeature({
        organizationId: organization?.id,
        featureName,
        enabled,
      }).unwrap();
    } catch (error) {
      console.error('Failed to toggle feature:', error);
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Building },
    { id: 'features', label: 'Features', icon: Settings },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Organization Settings</h1>
        <p className="text-gray-600">Manage your organization configuration and features</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:w-64">
          <Card className="p-4">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </Card>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {activeTab === 'general' && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-6">General Settings</h2>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Organization Name
                    </label>
                    <Input
                      defaultValue={settings?.name || organization?.name}
                      placeholder="Enter organization name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Organization Slug
                    </label>
                    <Input
                      defaultValue={settings?.slug || organization?.slug}
                      placeholder="organization-slug"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    defaultValue={settings?.description}
                    placeholder="Describe your organization..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Primary Contact Email
                    </label>
                    <Input
                      type="email"
                      defaultValue={settings?.contactEmail}
                      placeholder="contact@organization.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <Input
                      defaultValue={settings?.phoneNumber}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button disabled={isUpdating}>
                    <Save className="w-4 h-4 mr-2" />
                    {isUpdating ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'features' && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-6">Feature Management</h2>
              <div className="space-y-6">
                <div className="grid gap-6">
                  {/* Assisted Purchase Feature */}
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">Assisted Purchase</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Allow customers to request product purchases through your agents
                      </p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="blue" size="sm">Core Feature</Badge>
                        <Badge variant="green" size="sm">Revenue Generator</Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => handleFeatureToggle('assisted_purchase', !settings?.features?.assisted_purchase?.enabled)}
                        disabled={isTogglingFeature}
                        className="flex items-center"
                      >
                        {settings?.features?.assisted_purchase?.enabled ? (
                          <ToggleRight className="w-8 h-8 text-green-600" />
                        ) : (
                          <ToggleLeft className="w-8 h-8 text-gray-400" />
                        )}
                      </button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedFeature('assisted_purchase');
                          setShowFeatureModal(true);
                        }}
                      >
                        Configure
                      </Button>
                    </div>
                  </div>

                  {/* Self Purchase Feature */}
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">Self Purchase</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Allow customers to register their own purchases for forwarding
                      </p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="purple" size="sm">Logistics</Badge>
                        <Badge variant="orange" size="sm">High Volume</Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => handleFeatureToggle('self_purchase', !settings?.features?.self_purchase?.enabled)}
                        disabled={isTogglingFeature}
                        className="flex items-center"
                      >
                        {settings?.features?.self_purchase?.enabled ? (
                          <ToggleRight className="w-8 h-8 text-green-600" />
                        ) : (
                          <ToggleLeft className="w-8 h-8 text-gray-400" />
                        )}
                      </button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedFeature('self_purchase');
                          setShowFeatureModal(true);
                        }}
                      >
                        Configure
                      </Button>
                    </div>
                  </div>

                  {/* Package Consolidation */}
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">Package Consolidation</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Allow customers to combine multiple packages into one shipment
                      </p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="indigo" size="sm">Cost Savings</Badge>
                        <Badge variant="yellow" size="sm">Premium</Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => handleFeatureToggle('package_consolidation', !settings?.features?.package_consolidation?.enabled)}
                        disabled={isTogglingFeature}
                        className="flex items-center"
                      >
                        {settings?.features?.package_consolidation?.enabled ? (
                          <ToggleRight className="w-8 h-8 text-green-600" />
                        ) : (
                          <ToggleLeft className="w-8 h-8 text-gray-400" />
                        )}
                      </button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedFeature('package_consolidation');
                          setShowFeatureModal(true);
                        }}
                      >
                        Configure
                      </Button>
                    </div>
                  </div>

                  {/* Real-time Tracking */}
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">Real-time Tracking</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Provide customers with live package tracking updates
                      </p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="green" size="sm">Customer Experience</Badge>
                        <Badge variant="blue" size="sm">Standard</Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => handleFeatureToggle('realtime_tracking', !settings?.features?.realtime_tracking?.enabled)}
                        disabled={isTogglingFeature}
                        className="flex items-center"
                      >
                        {settings?.features?.realtime_tracking?.enabled ? (
                          <ToggleRight className="w-8 h-8 text-green-600" />
                        ) : (
                          <ToggleLeft className="w-8 h-8 text-gray-400" />
                        )}
                      </button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedFeature('realtime_tracking');
                          setShowFeatureModal(true);
                        }}
                      >
                        Configure
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'users' && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-6">User Management</h2>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{settings?.userStats?.total || 0}</div>
                    <div className="text-sm text-gray-600">Total Users</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{settings?.userStats?.active || 0}</div>
                    <div className="text-sm text-gray-600">Active Users</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{settings?.userStats?.admins || 0}</div>
                    <div className="text-sm text-gray-600">Administrators</div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-4">User Limits & Permissions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Maximum Users
                      </label>
                      <Input
                        type="number"
                        defaultValue={settings?.limits?.maxUsers || 100}
                        placeholder="100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Orders per User per Day
                      </label>
                      <Input
                        type="number"
                        defaultValue={settings?.limits?.ordersPerUserPerDay || 10}
                        placeholder="10"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button>
                    <Save className="w-4 h-4 mr-2" />
                    Save User Settings
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Other tabs would be implemented similarly */}
          {activeTab === 'billing' && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-6">Billing & Subscription</h2>
              <p className="text-gray-600">Billing management features coming soon...</p>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-6">Security Settings</h2>
              <p className="text-gray-600">Security configuration features coming soon...</p>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-6">Notification Settings</h2>
              <p className="text-gray-600">Notification management features coming soon...</p>
            </Card>
          )}
        </div>
      </div>

      {/* Feature Configuration Modal */}
      <Modal
        isOpen={showFeatureModal}
        onClose={() => {
          setShowFeatureModal(false);
          setSelectedFeature(null);
        }}
        title={`Configure ${selectedFeature?.replace('_', ' ').toUpperCase()}`}
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Feature-specific configuration options will be available here.
          </p>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowFeatureModal(false);
                setSelectedFeature(null);
              }}
            >
              Cancel
            </Button>
            <Button>Save Configuration</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};