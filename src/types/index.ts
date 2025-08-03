// Core Types
export interface User {
  id: string;
  email: string;
  role: UserRole;
  organizationId: string;
  profile: UserProfile;
  emailVerified: boolean;
  phoneVerified: boolean;
  twoFactorEnabled: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  language: 'en' | 'az' | 'ru';
  timezone: string;
  notifications: NotificationPreferences;
}

export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
  whatsapp: boolean;
}

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ORG_ADMIN = 'org_admin',
  WAREHOUSE_MANAGER = 'warehouse_manager',
  WAREHOUSE_STAFF = 'warehouse_staff',
  PURCHASE_AGENT = 'purchase_agent',
  CUSTOMER_SERVICE = 'customer_service',
  CUSTOMER = 'customer',
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  settings: OrganizationSettings;
  features: Record<string, FeatureConfig>;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationSettings {
  branding: {
    logo?: string;
    primaryColor: string;
    secondaryColor: string;
  };
  contact: {
    email: string;
    phone: string;
    address: Address;
  };
  business: {
    currency: string;
    timezone: string;
    workingHours: WorkingHours;
  };
}

export interface FeatureConfig {
  enabled: boolean;
  config: Record<string, any>;
}

export interface WorkingHours {
  monday: { start: string; end: string; enabled: boolean };
  tuesday: { start: string; end: string; enabled: boolean };
  wednesday: { start: string; end: string; enabled: boolean };
  thursday: { start: string; end: string; enabled: boolean };
  friday: { start: string; end: string; enabled: boolean };
  saturday: { start: string; end: string; enabled: boolean };
  sunday: { start: string; end: string; enabled: boolean };
}

export interface Address {
  street: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

// Order Types
export interface Order {
  id: string;
  organizationId: string;
  customerId: string;
  orderNumber: string;
  orderType: OrderType;
  status: OrderStatus;
  
  // Assisted Purchase fields
  productId?: string;
  purchaseAssignedTo?: string;
  
  // Self Purchase fields
  externalTrackingNumber?: string;
  declaredValue?: {
    amount: number;
    currency: string;
  };
  
  // Common fields
  sourceWarehouseId?: string;
  destinationWarehouseId?: string;
  shippingAddress: Address;
  totalAmount: number;
  totalCurrency: string;
  paymentStatus: PaymentStatus;
  
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export enum OrderType {
  ASSISTED_PURCHASE = 'assisted_purchase',
  SELF_PURCHASE = 'self_purchase',
}

export enum OrderStatus {
  PENDING = 'pending',
  PAYMENT_CONFIRMED = 'payment_confirmed',
  PURCHASED = 'purchased',
  SHIPPED_TO_WAREHOUSE = 'shipped_to_warehouse',
  IN_WAREHOUSE = 'in_warehouse',
  CUSTOMS_CLEARANCE = 'customs_clearance',
  LOCAL_DELIVERY = 'local_delivery',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

// Product Types
export interface Product {
  id: string;
  organizationId: string;
  externalUrl: string;
  title: string;
  price: {
    amount: number;
    currency: string;
  };
  sourcePlatform: string;
  productData: ProductData;
  createdAt: string;
}

export interface ProductData {
  description?: string;
  images: string[];
  specifications: Record<string, string>;
  availability: boolean;
  seller: string;
  rating?: number;
  reviews?: number;
}

// Package Types
export interface Package {
  id: string;
  organizationId: string;
  orderId: string;
  trackingNumber: string;
  weight?: number; // in grams
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  status: PackageStatus;
  currentLocation?: Location;
  estimatedDelivery?: string;
  actualDelivery?: string;
  createdAt: string;
}

export enum PackageStatus {
  PENDING = 'pending',
  IN_TRANSIT_TO_WAREHOUSE = 'in_transit_to_warehouse',
  ARRIVED_AT_WAREHOUSE = 'arrived_at_warehouse',
  PROCESSING = 'processing',
  READY_FOR_DISPATCH = 'ready_for_dispatch',
  IN_TRANSIT_TO_CUSTOMER = 'in_transit_to_customer',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
  RETURNED = 'returned',
  DAMAGED = 'damaged',
  LOST = 'lost',
}

export interface Location {
  address: string;
  city: string;
  country: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

// Tracking Types
export interface TrackingEvent {
  id: string;
  organizationId: string;
  packageId: string;
  eventType: string;
  description: string;
  location?: Location;
  occurredAt: string;
  source: 'manual' | 'carrier_api' | 'warehouse_scan';
  createdBy?: string;
  createdAt: string;
}

// Warehouse Types
export interface Warehouse {
  id: string;
  organizationId: string;
  name: string;
  countryCode: string;
  address: Address;
  contactInfo: {
    email: string;
    phone: string;
    manager: string;
  };
  timezone: string;
  isActive: boolean;
  createdAt: string;
}

// Payment Types
export interface Payment {
  id: string;
  organizationId: string;
  orderId: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  provider: string;
  providerTransactionId?: string;
  status: PaymentStatus;
  paidAt?: string;
  createdAt: string;
}

export enum PaymentMethod {
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  BANK_TRANSFER = 'bank_transfer',
  DIGITAL_WALLET = 'digital_wallet',
  CASH_ON_DELIVERY = 'cash_on_delivery',
  PREPAID_BALANCE = 'prepaid_balance',
}

// Document Types
export interface Document {
  id: string;
  organizationId: string;
  orderId: string;
  documentType: DocumentType;
  filename: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: string;
  verificationStatus: 'pending' | 'approved' | 'rejected';
  verifiedBy?: string;
  verifiedAt?: string;
  createdAt: string;
}

export enum DocumentType {
  INVOICE = 'invoice',
  RECEIPT = 'receipt',
  CUSTOMS_FORM = 'customs_form',
  PROOF_OF_PURCHASE = 'proof_of_purchase',
  IDENTITY_DOCUMENT = 'identity_document',
  SHIPPING_LABEL = 'shipping_label',
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form Types
export interface CreateOrderRequest {
  orderType: OrderType;
  productUrl?: string;
  quantity?: number;
  externalTrackingNumber?: string;
  declaredValue?: {
    amount: number;
    currency: string;
  };
  shippingAddress: Address;
  notes?: string;
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
  notes?: string;
  trackingNumber?: string;
}

// Filter Types
export interface OrderFilters {
  status?: OrderStatus[];
  orderType?: OrderType[];
  dateFrom?: string;
  dateTo?: string;
  customerId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PackageFilters {
  status?: PackageStatus[];
  warehouseId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  page?: number;
  limit?: number;
}

// Analytics Types
export interface DashboardMetrics {
  totalOrders: number;
  totalRevenue: number;
  activePackages: number;
  deliverySuccessRate: number;
  averageProcessingTime: number;
  customerSatisfaction: number;
}

export interface RevenueData {
  date: string;
  revenue: number;
  orders: number;
}

export interface OrderStatusDistribution {
  status: OrderStatus;
  count: number;
  percentage: number;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  actionUrl?: string;
  createdAt: string;
}

export enum NotificationType {
  ORDER_UPDATE = 'order_update',
  PAYMENT_CONFIRMATION = 'payment_confirmation',
  DELIVERY_NOTIFICATION = 'delivery_notification',
  SYSTEM_ALERT = 'system_alert',
  PROMOTION = 'promotion',
}

// Error Types
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

// WebSocket Types
export interface SocketEvents {
  'tracking:update': (data: TrackingEvent) => void;
  'order:status_changed': (data: { orderId: string; status: OrderStatus; timestamp: string }) => void;
  'payment:completed': (data: { orderId: string; paymentId: string; amount: number }) => void;
  'notification:new': (data: Notification) => void;
}