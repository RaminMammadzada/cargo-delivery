import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../index';
import { 
  Order, 
  Package, 
  User, 
  Organization, 
  Warehouse,
  Payment,
  Document,
  TrackingEvent,
  CreateOrderRequest,
  UpdateOrderStatusRequest,
  OrderFilters,
  PackageFilters,
  PaginatedResponse,
  DashboardMetrics,
  RevenueData,
  OrderStatusDistribution
} from '../../types';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/v1',
    prepareHeaders: (headers, { getState }) => {
      const state = getState() as RootState;
      const token = state.auth.token;
      const orgId = state.organization.current?.id;

      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      if (orgId) {
        headers.set('x-organization-id', orgId);
      }
      headers.set('content-type', 'application/json');
      return headers;
    },
  }),
  tagTypes: [
    'Order', 
    'Package', 
    'User', 
    'Organization', 
    'Warehouse', 
    'Payment', 
    'Document', 
    'TrackingEvent',
    'Analytics'
  ],
  endpoints: (builder) => ({
    // Authentication endpoints
    login: builder.mutation<
      { user: User; token: string; permissions: string[] },
      { email: string; password: string }
    >({
      query: (credentials) => ({
        url: 'auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),

    register: builder.mutation<
      { user: User; token: string },
      { email: string; password: string; firstName: string; lastName: string; organizationId?: string }
    >({
      query: (userData) => ({
        url: 'auth/register',
        method: 'POST',
        body: userData,
      }),
    }),

    logout: builder.mutation<void, void>({
      query: () => ({
        url: 'auth/logout',
        method: 'POST',
      }),
    }),

    // User endpoints
    getUsers: builder.query<PaginatedResponse<User>, { page?: number; limit?: number; search?: string }>({
      query: (params) => ({
        url: 'users',
        params,
      }),
      providesTags: ['User'],
    }),

    getUser: builder.query<User, string>({
      query: (id) => `users/${id}`,
      providesTags: (result, error, id) => [{ type: 'User', id }],
    }),

    updateUser: builder.mutation<User, { id: string; data: Partial<User> }>({
      query: ({ id, data }) => ({
        url: `users/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'User', id }],
    }),

    // Organization endpoints
    getOrganizations: builder.query<PaginatedResponse<Organization>, { page?: number; limit?: number }>({
      query: (params) => ({
        url: 'organizations',
        params,
      }),
      providesTags: ['Organization'],
    }),

    getOrganization: builder.query<Organization, string>({
      query: (id) => `organizations/${id}`,
      providesTags: (result, error, id) => [{ type: 'Organization', id }],
    }),

    updateOrganization: builder.mutation<Organization, { id: string; data: Partial<Organization> }>({
      query: ({ id, data }) => ({
        url: `organizations/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Organization', id }],
    }),

    toggleFeature: builder.mutation<
      Organization,
      { organizationId: string; feature: string; enabled: boolean; config?: Record<string, any> }
    >({
      query: ({ organizationId, feature, enabled, config }) => ({
        url: `organizations/${organizationId}/features/${feature}`,
        method: 'PUT',
        body: { enabled, config },
      }),
      invalidatesTags: (result, error, { organizationId }) => [{ type: 'Organization', id: organizationId }],
    }),

    // Order endpoints
    getOrders: builder.query<PaginatedResponse<Order>, OrderFilters>({
      query: (filters) => ({
        url: 'orders',
        params: filters,
      }),
      providesTags: ['Order'],
    }),

    getOrder: builder.query<Order, string>({
      query: (id) => `orders/${id}`,
      providesTags: (result, error, id) => [{ type: 'Order', id }],
    }),

    createAssistedPurchaseOrder: builder.mutation<Order, CreateOrderRequest>({
      query: (data) => ({
        url: 'orders/assisted-purchase',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Order'],
    }),

    createSelfPurchaseOrder: builder.mutation<Order, CreateOrderRequest>({
      query: (data) => ({
        url: 'orders/self-purchase',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Order'],
    }),

    updateOrderStatus: builder.mutation<Order, { id: string; data: UpdateOrderStatusRequest }>({
      query: ({ id, data }) => ({
        url: `orders/${id}/status`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Order', id }, 'Package'],
    }),

    cancelOrder: builder.mutation<Order, { id: string; reason: string }>({
      query: ({ id, reason }) => ({
        url: `orders/${id}/cancel`,
        method: 'PUT',
        body: { reason },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Order', id }],
    }),

    // Package endpoints
    getPackages: builder.query<PaginatedResponse<Package>, PackageFilters>({
      query: (filters) => ({
        url: 'packages',
        params: filters,
      }),
      providesTags: ['Package'],
    }),

    getPackage: builder.query<Package, string>({
      query: (id) => `packages/${id}`,
      providesTags: (result, error, id) => [{ type: 'Package', id }],
    }),

    getPackagesByOrder: builder.query<Package[], string>({
      query: (orderId) => `orders/${orderId}/packages`,
      providesTags: (result, error, orderId) => [{ type: 'Package', id: `order-${orderId}` }],
    }),

    updatePackageStatus: builder.mutation<Package, { id: string; status: string; location?: string; notes?: string }>({
      query: ({ id, ...data }) => ({
        url: `packages/${id}/status`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Package', id }, 'TrackingEvent'],
    }),

    consolidatePackages: builder.mutation<Package, { packageIds: string[]; instructions?: string }>({
      query: (data) => ({
        url: 'packages/consolidate',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Package'],
    }),

    // Tracking endpoints
    getTrackingEvents: builder.query<TrackingEvent[], string>({
      query: (packageId) => `packages/${packageId}/tracking`,
      providesTags: (result, error, packageId) => [{ type: 'TrackingEvent', id: packageId }],
    }),

    addTrackingEvent: builder.mutation<
      TrackingEvent,
      { packageId: string; eventType: string; description: string; location?: string }
    >({
      query: ({ packageId, ...data }) => ({
        url: `packages/${packageId}/tracking`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { packageId }) => [
        { type: 'TrackingEvent', id: packageId },
        { type: 'Package', id: packageId }
      ],
    }),

    // Warehouse endpoints
    getWarehouses: builder.query<Warehouse[], void>({
      query: () => 'warehouses',
      providesTags: ['Warehouse'],
    }),

    getWarehouse: builder.query<Warehouse, string>({
      query: (id) => `warehouses/${id}`,
      providesTags: (result, error, id) => [{ type: 'Warehouse', id }],
    }),

    createWarehouse: builder.mutation<Warehouse, Partial<Warehouse>>({
      query: (data) => ({
        url: 'warehouses',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Warehouse'],
    }),

    updateWarehouse: builder.mutation<Warehouse, { id: string; data: Partial<Warehouse> }>({
      query: ({ id, data }) => ({
        url: `warehouses/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Warehouse', id }],
    }),

    // Payment endpoints
    getPayments: builder.query<PaginatedResponse<Payment>, { orderId?: string; page?: number; limit?: number }>({
      query: (params) => ({
        url: 'payments',
        params,
      }),
      providesTags: ['Payment'],
    }),

    createPayment: builder.mutation<Payment, { orderId: string; amount: number; paymentMethod: string }>({
      query: (data) => ({
        url: 'payments',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Payment', 'Order'],
    }),

    processRefund: builder.mutation<Payment, { paymentId: string; amount?: number; reason: string }>({
      query: ({ paymentId, ...data }) => ({
        url: `payments/${paymentId}/refund`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Payment', 'Order'],
    }),

    // Document endpoints
    getDocuments: builder.query<Document[], string>({
      query: (orderId) => `orders/${orderId}/documents`,
      providesTags: (result, error, orderId) => [{ type: 'Document', id: `order-${orderId}` }],
    }),

    uploadDocument: builder.mutation<Document, { orderId: string; file: File; documentType: string }>({
      query: ({ orderId, file, documentType }) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('documentType', documentType);
        
        return {
          url: `orders/${orderId}/documents`,
          method: 'POST',
          body: formData,
          formData: true,
        };
      },
      invalidatesTags: (result, error, { orderId }) => [{ type: 'Document', id: `order-${orderId}` }],
    }),

    verifyDocument: builder.mutation<Document, { id: string; status: 'approved' | 'rejected'; notes?: string }>({
      query: ({ id, ...data }) => ({
        url: `documents/${id}/verify`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Document', id }],
    }),

    // Analytics endpoints
    getDashboardMetrics: builder.query<DashboardMetrics, { dateFrom?: string; dateTo?: string }>({
      query: (params) => ({
        url: 'analytics/dashboard',
        params,
      }),
      providesTags: ['Analytics'],
    }),

    getRevenueData: builder.query<RevenueData[], { dateFrom: string; dateTo: string; interval: 'day' | 'week' | 'month' }>({
      query: (params) => ({
        url: 'analytics/revenue',
        params,
      }),
      providesTags: ['Analytics'],
    }),

    getOrderStatusDistribution: builder.query<OrderStatusDistribution[], void>({
      query: () => 'analytics/order-status-distribution',
      providesTags: ['Analytics'],
    }),

    // Utility endpoints
    parseProductUrl: builder.mutation<{ title: string; price: number; currency: string; images: string[] }, { url: string }>({
      query: (data) => ({
        url: 'utils/parse-product-url',
        method: 'POST',
        body: data,
      }),
    }),

    calculateShipping: builder.mutation<
      { cost: number; currency: string; estimatedDays: number },
      { weight: number; dimensions: { length: number; width: number; height: number }; destination: string }
    >({
      query: (data) => ({
        url: 'utils/calculate-shipping',
        method: 'POST',
        body: data,
      }),
    }),

    getExchangeRates: builder.query<Record<string, number>, string>({
      query: (baseCurrency) => `utils/exchange-rates?base=${baseCurrency}`,
    }),
  }),
});

export const {
  // Auth
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  
  // Users
  useGetUsersQuery,
  useGetUserQuery,
  useUpdateUserMutation,
  
  // Organizations
  useGetOrganizationsQuery,
  useGetOrganizationQuery,
  useUpdateOrganizationMutation,
  useToggleFeatureMutation,
  
  // Orders
  useGetOrdersQuery,
  useGetOrderQuery,
  useCreateAssistedPurchaseOrderMutation,
  useCreateSelfPurchaseOrderMutation,
  useUpdateOrderStatusMutation,
  useCancelOrderMutation,
  
  // Packages
  useGetPackagesQuery,
  useGetPackageQuery,
  useGetPackagesByOrderQuery,
  useUpdatePackageStatusMutation,
  useConsolidatePackagesMutation,
  
  // Tracking
  useGetTrackingEventsQuery,
  useAddTrackingEventMutation,
  
  // Warehouses
  useGetWarehousesQuery,
  useGetWarehouseQuery,
  useCreateWarehouseMutation,
  useUpdateWarehouseMutation,
  
  // Payments
  useGetPaymentsQuery,
  useCreatePaymentMutation,
  useProcessRefundMutation,
  
  // Documents
  useGetDocumentsQuery,
  useUploadDocumentMutation,
  useVerifyDocumentMutation,
  
  // Analytics
  useGetDashboardMetricsQuery,
  useGetRevenueDataQuery,
  useGetOrderStatusDistributionQuery,
  
  // Utils
  useParseProductUrlMutation,
  useCalculateShippingMutation,
  useGetExchangeRatesQuery,
} = apiSlice;