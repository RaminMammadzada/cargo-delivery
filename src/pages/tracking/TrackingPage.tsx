import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useGetPackageTrackingQuery } from '../../store/api/apiSlice';
import { Package, MapPin, Clock, CheckCircle, Truck, Plane, Building } from 'lucide-react';

export const TrackingPage: React.FC = () => {
  const { trackingNumber } = useParams<{ trackingNumber: string }>();
  const [inputTrackingNumber, setInputTrackingNumber] = useState(trackingNumber || '');
  const [activeTrackingNumber, setActiveTrackingNumber] = useState(trackingNumber || '');

  const { data: trackingData, isLoading, error } = useGetPackageTrackingQuery(
    activeTrackingNumber,
    { skip: !activeTrackingNumber }
  );

  const handleTrack = () => {
    if (inputTrackingNumber.trim()) {
      setActiveTrackingNumber(inputTrackingNumber.trim());
      window.history.pushState({}, '', `/tracking/${inputTrackingNumber.trim()}`);
    }
  };

  const getEventIcon = (eventType: string) => {
    const icons = {
      'package_received': Package,
      'in_transit': Truck,
      'customs_clearance': Building,
      'out_for_delivery': Truck,
      'delivered': CheckCircle,
      'flight_departed': Plane,
      'flight_arrived': Plane,
    };
    return icons[eventType as keyof typeof icons] || MapPin;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'pending': 'yellow',
      'in_transit': 'blue',
      'customs_clearance': 'orange',
      'out_for_delivery': 'purple',
      'delivered': 'green',
      'exception': 'red',
    };
    return colors[status as keyof typeof colors] || 'gray';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Package Tracking</h1>
        <p className="text-gray-600">Track your packages in real-time</p>
      </div>

      {/* Tracking Input */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Enter tracking number..."
              value={inputTrackingNumber}
              onChange={(e) => setInputTrackingNumber(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleTrack()}
            />
          </div>
          <Button onClick={handleTrack} disabled={!inputTrackingNumber.trim()}>
            Track Package
          </Button>
        </div>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <Card className="p-12 text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading tracking information...</p>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Card className="p-12 text-center">
          <div className="text-red-600 mb-4">
            <Package className="w-12 h-12 mx-auto mb-4" />
            <h3 className="text-lg font-medium">Tracking number not found</h3>
            <p className="text-sm mt-2">Please check your tracking number and try again</p>
          </div>
        </Card>
      )}

      {/* Tracking Results */}
      {trackingData && (
        <div className="space-y-6">
          {/* Package Summary */}
          <Card className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold mb-2">Package #{trackingData.trackingNumber}</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Status:</span>
                    <Badge variant={getStatusColor(trackingData.status)} className="ml-2">
                      {trackingData.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                  <div>
                    <span className="font-medium">Weight:</span> {trackingData.weightGrams}g
                  </div>
                  <div>
                    <span className="font-medium">Estimated Delivery:</span>{' '}
                    {trackingData.estimatedDelivery
                      ? new Date(trackingData.estimatedDelivery).toLocaleDateString()
                      : 'TBD'}
                  </div>
                </div>
              </div>
              
              {trackingData.currentLocation && (
                <div className="text-right">
                  <div className="text-sm text-gray-600">Current Location</div>
                  <div className="font-medium flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {trackingData.currentLocation.city}, {trackingData.currentLocation.country}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Progress Timeline */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-6">Tracking History</h3>
            <div className="space-y-6">
              {trackingData.events?.map((event, index) => {
                const IconComponent = getEventIcon(event.eventType);
                const isLatest = index === 0;
                
                return (
                  <div key={event.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`p-2 rounded-full ${
                        isLatest ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
                      }`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      {index < (trackingData.events?.length || 0) - 1 && (
                        <div className="w-px h-12 bg-gray-200 mt-2" />
                      )}
                    </div>
                    
                    <div className="flex-1 pb-6">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                          <h4 className={`font-medium ${isLatest ? 'text-blue-600' : 'text-gray-900'}`}>
                            {event.description}
                          </h4>
                          {event.location && (
                            <p className="text-sm text-gray-600 flex items-center mt-1">
                              <MapPin className="w-3 h-3 mr-1" />
                              {event.location.city}, {event.location.country}
                            </p>
                          )}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {new Date(event.occurredAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Delivery Information */}
          {trackingData.order && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Delivery Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Shipping Address</h4>
                  <div className="text-sm text-gray-600">
                    <p>{trackingData.order.shippingAddress.street}</p>
                    <p>{trackingData.order.shippingAddress.city}, {trackingData.order.shippingAddress.postalCode}</p>
                    <p>{trackingData.order.shippingAddress.country}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Order Details</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><span className="font-medium">Order:</span> #{trackingData.order.orderNumber}</p>
                    <p><span className="font-medium">Type:</span> {trackingData.order.orderType.replace('_', ' ')}</p>
                    <p><span className="font-medium">Total:</span> {trackingData.order.totalAmount} {trackingData.order.totalCurrency}</p>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Actions */}
          <Card className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="outline" className="flex-1">
                Share Tracking
              </Button>
              <Button variant="outline" className="flex-1">
                Download Receipt
              </Button>
              <Button variant="outline" className="flex-1">
                Contact Support
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* No tracking number provided */}
      {!activeTrackingNumber && !isLoading && (
        <Card className="p-12 text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Enter a tracking number</h3>
          <p className="text-gray-600">
            Enter your tracking number above to see real-time updates on your package
          </p>
        </Card>
      )}
    </div>
  );
};