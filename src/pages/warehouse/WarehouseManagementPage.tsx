import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useGetWarehouseInventoryQuery, useUpdatePackageStatusMutation } from '../../store/api/apiSlice';
import { Package, Search, Scan, CheckCircle, AlertTriangle, Clock, Truck } from 'lucide-react';

export const WarehouseManagementPage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedPackages, setSelectedPackages] = useState<string[]>([]);

  const { data: inventory, isLoading, error } = useGetWarehouseInventoryQuery({
    search: searchTerm,
    status: statusFilter === 'all' ? undefined : statusFilter,
  });

  const [updatePackageStatus] = useUpdatePackageStatusMutation();

  const handleStatusUpdate = async (packageId: string, newStatus: string) => {
    try {
      await updatePackageStatus({
        packageId,
        status: newStatus,
        updatedBy: user?.id,
      }).unwrap();
    } catch (error) {
      console.error('Failed to update package status:', error);
    }
  };

  const handleBulkStatusUpdate = async (newStatus: string) => {
    try {
      await Promise.all(
        selectedPackages.map(packageId =>
          updatePackageStatus({
            packageId,
            status: newStatus,
            updatedBy: user?.id,
          }).unwrap()
        )
      );
      setSelectedPackages([]);
    } catch (error) {
      console.error('Failed to update package statuses:', error);
    }
  };

  const togglePackageSelection = (packageId: string) => {
    setSelectedPackages(prev =>
      prev.includes(packageId)
        ? prev.filter(id => id !== packageId)
        : [...prev, packageId]
    );
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      'pending': Clock,
      'received': Package,
      'processed': CheckCircle,
      'ready_for_dispatch': Truck,
      'dispatched': Truck,
      'exception': AlertTriangle,
    };
    return icons[status as keyof typeof icons] || Package;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'pending': 'yellow',
      'received': 'blue',
      'processed': 'green',
      'ready_for_dispatch': 'purple',
      'dispatched': 'indigo',
      'exception': 'red',
    };
    return colors[status as keyof typeof colors] || 'gray';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">Failed to load warehouse inventory</div>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Warehouse Management</h1>
          <p className="text-gray-600">Manage packages and inventory</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Scan className="w-4 h-4 mr-2" />
            Scan Package
          </Button>
          <Button variant="outline" size="sm">
            Generate Report
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Packages</p>
              <p className="text-2xl font-bold text-gray-900">{inventory?.stats?.total || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{inventory?.stats?.pending || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Processed</p>
              <p className="text-2xl font-bold text-gray-900">{inventory?.stats?.processed || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Exceptions</p>
              <p className="text-2xl font-bold text-gray-900">{inventory?.stats?.exceptions || 0}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters and Bulk Actions */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by tracking number, order, or customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="received">Received</option>
              <option value="processed">Processed</option>
              <option value="ready_for_dispatch">Ready for Dispatch</option>
              <option value="dispatched">Dispatched</option>
              <option value="exception">Exception</option>
            </select>
          </div>

          {selectedPackages.length > 0 && (
            <div className="flex gap-2">
              <span className="text-sm text-gray-600 py-2">
                {selectedPackages.length} selected
              </span>
              <Button
                size="sm"
                onClick={() => handleBulkStatusUpdate('processed')}
              >
                Mark Processed
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkStatusUpdate('ready_for_dispatch')}
              >
                Ready for Dispatch
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Package List */}
      <div className="space-y-4">
        {inventory?.packages?.map((pkg: any) => {
          const StatusIcon = getStatusIcon(pkg.status);
          const isSelected = selectedPackages.includes(pkg.id);

          return (
            <Card key={pkg.id} className={`p-6 transition-all ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
              <div className="flex items-center gap-4">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => togglePackageSelection(pkg.id)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg">#{pkg.trackingNumber}</h3>
                    <Badge variant={getStatusColor(pkg.status)}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {pkg.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Order:</span> #{pkg.order?.orderNumber}
                    </div>
                    <div>
                      <span className="font-medium">Customer:</span> {pkg.order?.customer?.name}
                    </div>
                    <div>
                      <span className="font-medium">Weight:</span> {pkg.weightGrams}g
                    </div>
                    <div>
                      <span className="font-medium">Received:</span> {new Date(pkg.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  {pkg.dimensions && (
                    <div className="mt-2 text-sm text-gray-600">
                      <span className="font-medium">Dimensions:</span> {pkg.dimensions.length} × {pkg.dimensions.width} × {pkg.dimensions.height} cm
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <select
                    value={pkg.status}
                    onChange={(e) => handleStatusUpdate(pkg.id, e.target.value)}
                    className="px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="received">Received</option>
                    <option value="processed">Processed</option>
                    <option value="ready_for_dispatch">Ready for Dispatch</option>
                    <option value="dispatched">Dispatched</option>
                    <option value="exception">Exception</option>
                  </select>
                  
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}

        {inventory?.packages?.length === 0 && (
          <Card className="p-12 text-center">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No packages found</h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'No packages in warehouse inventory'}
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};