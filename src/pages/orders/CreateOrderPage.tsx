import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  ShoppingCart, 
  Package, 
  MapPin, 
  CreditCard, 
  FileText,
  ExternalLink,
  Calculator
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useOrganization } from '../../hooks/useOrganization';
import { useCreateAssistedPurchaseOrderMutation, useCreateSelfPurchaseOrderMutation, useParseProductUrlMutation, useCalculateShippingMutation } from '../../store/api/apiSlice';
import { OrderType } from '../../types';
import FeatureWrapper from '../../components/features/FeatureWrapper';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const addressSchema = z.object({
  street: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().optional(),
  postalCode: z.string().min(1, 'Postal code is required'),
  country: z.string().min(1, 'Country is required'),
});

const assistedPurchaseSchema = z.object({
  orderType: z.literal(OrderType.ASSISTED_PURCHASE),
  productUrl: z.string().url('Please enter a valid product URL'),
  quantity: z.number().min(1, 'Quantity must be at least 1').max(10, 'Maximum quantity is 10'),
  notes: z.string().optional(),
  shippingAddress: addressSchema,
});

const selfPurchaseSchema = z.object({
  orderType: z.literal(OrderType.SELF_PURCHASE),
  externalTrackingNumber: z.string().min(5, 'Tracking number must be at least 5 characters'),
  declaredValue: z.object({
    amount: z.number().positive('Declared value must be positive'),
    currency: z.enum(['USD', 'EUR', 'AZN']),
  }),
  notes: z.string().optional(),
  shippingAddress: addressSchema,
});

type AssistedPurchaseFormData = z.infer<typeof assistedPurchaseSchema>;
type SelfPurchaseFormData = z.infer<typeof selfPurchaseSchema>;

const CreateOrderPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAssistedPurchaseEnabled, isSelfPurchaseEnabled, getAvailableWarehouses } = useOrganization();
  const [orderType, setOrderType] = useState<OrderType>(
    isAssistedPurchaseEnabled() ? OrderType.ASSISTED_PURCHASE : OrderType.SELF_PURCHASE
  );
  const [productInfo, setProductInfo] = useState<any>(null);
  const [shippingCost, setShippingCost] = useState<any>(null);

  const [createAssistedOrder] = useCreateAssistedPurchaseOrderMutation();
  const [createSelfOrder] = useCreateSelfPurchaseOrderMutation();
  const [parseProductUrl, { isLoading: parsingUrl }] = useParseProductUrlMutation();
  const [calculateShipping, { isLoading: calculatingShipping }] = useCalculateShippingMutation();

  const schema = orderType === OrderType.ASSISTED_PURCHASE ? assistedPurchaseSchema : selfPurchaseSchema;
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    reset,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      orderType,
      quantity: 1,
      declaredValue: {
        amount: 0,
        currency: 'USD' as const,
      },
      shippingAddress: {
        country: 'AZ',
      },
    },
  });

  const watchedUrl = watch('productUrl');
  const watchedAddress = watch('shippingAddress');

  // Parse product URL when it changes
  React.useEffect(() => {
    if (orderType === OrderType.ASSISTED_PURCHASE && watchedUrl && watchedUrl.length > 10) {
      const timeoutId = setTimeout(async () => {
        try {
          const result = await parseProductUrl({ url: watchedUrl }).unwrap();
          setProductInfo(result);
          toast.success('Product information loaded');
        } catch (error) {
          console.error('Failed to parse product URL:', error);
          setProductInfo(null);
        }
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [watchedUrl, orderType, parseProductUrl]);

  // Calculate shipping when address changes
  React.useEffect(() => {
    if (watchedAddress?.country && watchedAddress?.city) {
      const timeoutId = setTimeout(async () => {
        try {
          const result = await calculateShipping({
            weight: 1000, // Default 1kg
            dimensions: { length: 20, width: 15, height: 10 },
            destination: `${watchedAddress.city}, ${watchedAddress.country}`,
          }).unwrap();
          setShippingCost(result);
        } catch (error) {
          console.error('Failed to calculate shipping:', error);
        }
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [watchedAddress, calculateShipping]);

  const onSubmit = async (data: any) => {
    try {
      let result;
      if (orderType === OrderType.ASSISTED_PURCHASE) {
        result = await createAssistedOrder(data).unwrap();
      } else {
        result = await createSelfOrder(data).unwrap();
      }

      toast.success('Order created successfully!');
      navigate(`/orders/${result.id}`);
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to create order');
    }
  };

  const handleOrderTypeChange = (type: OrderType) => {
    setOrderType(type);
    setProductInfo(null);
    setShippingCost(null);
    reset({
      orderType: type,
      quantity: 1,
      declaredValue: {
        amount: 0,
        currency: 'USD' as const,
      },
      shippingAddress: {
        country: 'AZ',
      },
    });
  };

  if (!isAssistedPurchaseEnabled() && !isSelfPurchaseEnabled()) {
    return (
      <div className="text-center py-12">
        <Package className="w-16 h-16 text-secondary-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-secondary-900 mb-2">
          Order Creation Not Available
        </h2>
        <p className="text-secondary-600">
          Order creation features are currently disabled for your organization.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-secondary-900">Create New Order</h1>
        <p className="text-secondary-600 mt-2">
          Choose your order type and provide the necessary information
        </p>
      </div>

      {/* Order Type Selection */}
      <Card>
        <CardHeader title="Select Order Type" />
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FeatureWrapper feature="assisted_purchase">
              <button
                type="button"
                onClick={() => handleOrderTypeChange(OrderType.ASSISTED_PURCHASE)}
                className={`p-6 border-2 rounded-lg transition-all ${
                  orderType === OrderType.ASSISTED_PURCHASE
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-secondary-200 hover:border-secondary-300'
                }`}
              >
                <ShoppingCart className="w-8 h-8 text-primary-600 mb-3" />
                <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                  Assisted Purchase
                </h3>
                <p className="text-sm text-secondary-600">
                  We purchase the product for you from international websites
                </p>
              </button>
            </FeatureWrapper>

            <FeatureWrapper feature="self_purchase">
              <button
                type="button"
                onClick={() => handleOrderTypeChange(OrderType.SELF_PURCHASE)}
                className={`p-6 border-2 rounded-lg transition-all ${
                  orderType === OrderType.SELF_PURCHASE
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-secondary-200 hover:border-secondary-300'
                }`}
              >
                <Package className="w-8 h-8 text-primary-600 mb-3" />
                <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                  Self Purchase
                </h3>
                <p className="text-sm text-secondary-600">
                  You purchase the product and ship it to our warehouse
                </p>
              </button>
            </FeatureWrapper>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Order Details */}
        <Card>
          <CardHeader title="Order Details" />
          <CardContent className="space-y-4">
            {orderType === OrderType.ASSISTED_PURCHASE && (
              <>
                <div className="relative">
                  <Input
                    {...register('productUrl')}
                    label="Product URL"
                    placeholder="https://amazon.de/product/..."
                    leftIcon={<ExternalLink />}
                    error={errors.productUrl?.message}
                    fullWidth
                  />
                  {parsingUrl && (
                    <div className="absolute right-3 top-9">
                      <LoadingSpinner size="sm" />
                    </div>
                  )}
                </div>

                {productInfo && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start space-x-4">
                      {productInfo.images?.[0] && (
                        <img
                          src={productInfo.images[0]}
                          alt={productInfo.title}
                          className="w-16 h-16 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <h4 className="font-medium text-secondary-900">{productInfo.title}</h4>
                        <p className="text-lg font-bold text-green-600">
                          {productInfo.price} {productInfo.currency}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <Input
                  {...register('quantity', { valueAsNumber: true })}
                  type="number"
                  label="Quantity"
                  min="1"
                  max="10"
                  error={errors.quantity?.message}
                />
              </>
            )}

            {orderType === OrderType.SELF_PURCHASE && (
              <>
                <Input
                  {...register('externalTrackingNumber')}
                  label="Tracking Number"
                  placeholder="Enter the tracking number from merchant"
                  error={errors.externalTrackingNumber?.message}
                  fullWidth
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    {...register('declaredValue.amount', { valueAsNumber: true })}
                    type="number"
                    label="Declared Value"
                    placeholder="0.00"
                    step="0.01"
                    error={errors.declaredValue?.amount?.message}
                  />
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                      Currency
                    </label>
                    <select
                      {...register('declaredValue.currency')}
                      className="block w-full rounded-lg border-secondary-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="AZN">AZN</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Notes (Optional)
              </label>
              <textarea
                {...register('notes')}
                rows={3}
                className="block w-full rounded-lg border-secondary-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                placeholder="Any special instructions or notes..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Shipping Address */}
        <Card>
          <CardHeader title="Shipping Address" />
          <CardContent className="space-y-4">
            <Input
              {...register('shippingAddress.street')}
              label="Street Address"
              placeholder="123 Main Street"
              leftIcon={<MapPin />}
              error={errors.shippingAddress?.street?.message}
              fullWidth
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                {...register('shippingAddress.city')}
                label="City"
                placeholder="Baku"
                error={errors.shippingAddress?.city?.message}
              />
              <Input
                {...register('shippingAddress.state')}
                label="State/Region (Optional)"
                placeholder="Baku"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                {...register('shippingAddress.postalCode')}
                label="Postal Code"
                placeholder="AZ1000"
                error={errors.shippingAddress?.postalCode?.message}
              />
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Country
                </label>
                <select
                  {...register('shippingAddress.country')}
                  className="block w-full rounded-lg border-secondary-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="AZ">Azerbaijan</option>
                  <option value="TR">Turkey</option>
                  <option value="GE">Georgia</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cost Estimate */}
        {(productInfo || shippingCost) && (
          <Card>
            <CardHeader title="Cost Estimate" />
            <CardContent>
              <div className="space-y-3">
                {productInfo && orderType === OrderType.ASSISTED_PURCHASE && (
                  <div className="flex justify-between">
                    <span className="text-secondary-600">Product Cost:</span>
                    <span className="font-medium">
                      {productInfo.price} {productInfo.currency}
                    </span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-secondary-600">Service Fee:</span>
                  <span className="font-medium">
                    {orderType === OrderType.ASSISTED_PURCHASE ? '10%' : '$5.00'}
                  </span>
                </div>

                {shippingCost && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-secondary-600">Shipping Cost:</span>
                      <span className="font-medium">
                        ${shippingCost.cost} {shippingCost.currency}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary-600">Estimated Delivery:</span>
                      <span className="font-medium">
                        {shippingCost.estimatedDays} days
                      </span>
                    </div>
                  </>
                )}

                {calculatingShipping && (
                  <div className="flex justify-between">
                    <span className="text-secondary-600">Calculating shipping...</span>
                    <LoadingSpinner size="sm" />
                  </div>
                )}

                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Estimated Total:</span>
                    <span className="text-primary-600">
                      {productInfo && shippingCost
                        ? `$${(productInfo.price * 1.1 + shippingCost.cost).toFixed(2)}`
                        : 'Calculating...'
                      }
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/orders')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={isSubmitting}
            leftIcon={<ShoppingCart />}
          >
            Create Order
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateOrderPage;