import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useGetOrdersQuery } from '../../store/api/apiSlice';
import { Order, OrderStatus } from '../../types';
import { Search, Filter, Download, Eye, Package, Truck } from 'lucide-react';

export const OrdersListPage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'assisted_purchase' | 'self_purchase'>('all');

  const { data: orders, isLoading, error } = useGetOrdersQuery({
    search: searchTerm,
    status: statusFilter === 'all' ? undefined : statusFilter,
    type: typeFilter === 'all' ? undefined : typeFilter,
  });

  const getStatusColor = (status: OrderStatus) => {
    const colors = {
      pending: 'yellow',
      payment_confirmed: 'blue',
      purchased: 'indigo',
      shipped_to_warehouse: 'purple',
      in_warehouse: 'orange',
      customs_clearance: 'pink',
      local_delivery: 'green',
      delivered: 'emerald',
      cancelled: 'red',
    } as const;
    return colors[status] || 'gray';
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
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
        <div className="text-red-600 mb-4">Failed to load orders</div>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-600">Manage and track all your orders</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button href="/orders/create">
            <Package className="w-4 h-4 mr-2" />
            New Order
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'all')}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="payment_confirmed">Payment Confirmed</option>
            <option value="purchased">Purchased</option>
            <option value="shipped_to_warehouse">Shipped to Warehouse</option>
            <option value="in_warehouse">In Warehouse</option>
            <option value="customs_clearance">Customs Clearance</option>
            <option value="local_delivery">Local Delivery</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as 'all' | 'assisted_purchase' | 'self_purchase')}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            <option value="assisted_purchase">Assisted Purchase</option>
            <option value="self_purchase">Self Purchase</option>
          </select>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            More Filters
          </Button>
        </div>
      </Card>

      {/* Orders List */}
      <div className="space-y-4">
        {orders?.map((order: Order) => (
          <Card key={order.id} className="p-6 hover:shadow-md transition-shadow">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-lg">#{order.orderNumber}</h3>
                  <StatusBadge status={order.status} />
                  <Badge variant={order.orderType === 'assisted_purchase' ? 'blue' : 'green'}>
                    {order.orderType === 'assisted_purchase' ? 'Assisted' : 'Self Purchase'}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Customer:</span> {order.customer?.name || 'N/A'}
                  </div>
                  <div>
                    <span className="font-medium">Created:</span> {new Date(order.createdAt).toLocaleDateString()}
                  </div>
                  <div>
                    <span className="font-medium">Total:</span> {formatCurrency(order.totalAmount, order.totalCurrency)}
                  </div>
                </div>

                {order.orderType === 'assisted_purchase' && order.product && (
                  <div className="mt-2 text-sm text-gray-600">
                    <span className="font-medium">Product:</span> {order.product.title}
                  </div>
                )}

                {order.orderType === 'self_purchase' && order.externalTrackingNumber && (
                  <div className="mt-2 text-sm text-gray-600">
                    <span className="font-medium">Tracking:</span> {order.externalTrackingNumber}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" href={`/orders/${order.id}`}>
                  <Eye className="w-4 h-4 mr-2" />
                  View
                </Button>
                {order.packages && order.packages.length > 0 && (
                  <Button variant="outline" size="sm" href={`/tracking/${order.packages[0].trackingNumber}`}>
                    <Truck className="w-4 h-4 mr-2" />
                    Track
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}

        {orders?.length === 0 && (
          <Card className="p-12 text-center">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Create your first order to get started'}
            </p>
            <Button href="/orders/create">Create Order</Button>
          </Card>
        )}
      </div>
    </div>
  );
};