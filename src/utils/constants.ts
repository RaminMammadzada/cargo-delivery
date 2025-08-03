// User Roles
export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ORG_ADMIN: 'org_admin',
  WAREHOUSE_MANAGER: 'warehouse_manager',
  WAREHOUSE_STAFF: 'warehouse_staff',
  PURCHASE_AGENT: 'purchase_agent',
  CUSTOMER_SERVICE: 'customer_service',
  CUSTOMER: 'customer',
} as const;

// Order Types
export const ORDER_TYPES = {
  ASSISTED_PURCHASE: 'assisted_purchase',
  SELF_PURCHASE: 'self_purchase',
} as const;

// Order Statuses
export const ORDER_STATUSES = {
  PENDING: 'pending',
  PAYMENT_CONFIRMED: 'payment_confirmed',
  PURCHASED: 'purchased',
  SHIPPED_TO_WAREHOUSE: 'shipped_to_warehouse',
  IN_WAREHOUSE: 'in_warehouse',
  CUSTOMS_CLEARANCE: 'customs_clearance',
  LOCAL_DELIVERY: 'local_delivery',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const;

// Package Statuses
export const PACKAGE_STATUSES = {
  PENDING: 'pending',
  RECEIVED: 'received',
  PROCESSED: 'processed',
  READY_FOR_DISPATCH: 'ready_for_dispatch',
  DISPATCHED: 'dispatched',
  IN_TRANSIT: 'in_transit',
  OUT_FOR_DELIVERY: 'out_for_delivery',
  DELIVERED: 'delivered',
  EXCEPTION: 'exception',
} as const;

// Payment Statuses
export const PAYMENT_STATUSES = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
  CANCELLED: 'cancelled',
} as const;

// Supported Currencies
export const CURRENCIES = {
  USD: 'USD',
  EUR: 'EUR',
  AZN: 'AZN',
  TRY: 'TRY',
  GBP: 'GBP',
} as const;

// Countries
export const COUNTRIES = {
  US: { code: 'US', name: 'United States', flag: '🇺🇸' },
  DE: { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  TR: { code: 'TR', name: 'Turkey', flag: '🇹🇷' },
  AZ: { code: 'AZ', name: 'Azerbaijan', flag: '🇦🇿' },
  GB: { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  CN: { code: 'CN', name: 'China', flag: '🇨🇳' },
} as const;

// Supported E-commerce Platforms
export const ECOMMERCE_PLATFORMS = {
  AMAZON_DE: { name: 'Amazon.de', domain: 'amazon.de', flag: '🇩🇪' },
  AMAZON_US: { name: 'Amazon.com', domain: 'amazon.com', flag: '🇺🇸' },
  EBAY_DE: { name: 'eBay.de', domain: 'ebay.de', flag: '🇩🇪' },
  EBAY_US: { name: 'eBay.com', domain: 'ebay.com', flag: '🇺🇸' },
  ALIEXPRESS: { name: 'AliExpress', domain: 'aliexpress.com', flag: '🇨🇳' },
  TRENDYOL: { name: 'Trendyol', domain: 'trendyol.com', flag: '🇹🇷' },
} as const;

// Feature Flags
export const FEATURES = {
  ASSISTED_PURCHASE: 'assisted_purchase',
  SELF_PURCHASE: 'self_purchase',
  PACKAGE_CONSOLIDATION: 'package_consolidation',
  REALTIME_TRACKING: 'realtime_tracking',
  MULTI_CURRENCY: 'multi_currency',
  BULK_OPERATIONS: 'bulk_operations',
  API_ACCESS: 'api_access',
  WHITE_LABEL: 'white_label',
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    VERIFY_EMAIL: '/auth/verify-email',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },
  USERS: {
    PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
    CHANGE_PASSWORD: '/users/change-password',
    LIST: '/users',
    CREATE: '/users',
    UPDATE: '/users/:id',
    DELETE: '/users/:id',
  },
  ORGANIZATIONS: {
    LIST: '/organizations',
    GET: '/organizations/:id',
    CREATE: '/organizations',
    UPDATE: '/organizations/:id',
    DELETE: '/organizations/:id',
    SETTINGS: '/organizations/:id/settings',
    FEATURES: '/organizations/:id/features',
  },
  ORDERS: {
    LIST: '/orders',
    GET: '/orders/:id',
    CREATE: '/orders',
    UPDATE: '/orders/:id',
    DELETE: '/orders/:id',
    ASSISTED_PURCHASE: '/orders/assisted-purchase',
    SELF_PURCHASE: '/orders/self-purchase',
  },
  PACKAGES: {
    LIST: '/packages',
    GET: '/packages/:id',
    UPDATE: '/packages/:id',
    TRACKING: '/packages/:trackingNumber/tracking',
    CONSOLIDATE: '/packages/consolidate',
  },
  WAREHOUSE: {
    INVENTORY: '/warehouse/inventory',
    RECEIVE: '/warehouse/receive',
    DISPATCH: '/warehouse/dispatch',
    STATS: '/warehouse/stats',
  },
  PAYMENTS: {
    LIST: '/payments',
    CREATE: '/payments',
    PROCESS: '/payments/:id/process',
    REFUND: '/payments/:id/refund',
  },
  ANALYTICS: {
    DASHBOARD: '/analytics/dashboard',
    ORDERS: '/analytics/orders',
    REVENUE: '/analytics/revenue',
    USERS: '/analytics/users',
  },
} as const;

// File Upload Limits
export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.doc', '.docx'],
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
} as const;

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  DISPLAY_WITH_TIME: 'MMM dd, yyyy HH:mm',
  ISO: 'yyyy-MM-dd',
  API: 'yyyy-MM-dd\'T\'HH:mm:ss.SSSxxx',
} as const;

// Validation Rules
export const VALIDATION = {
  PASSWORD: {
    MIN_LENGTH: 8,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_SPECIAL_CHARS: true,
  },
  EMAIL: {
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  PHONE: {
    PATTERN: /^\+?[\d\s\-\(\)]+$/,
  },
  TRACKING_NUMBER: {
    MIN_LENGTH: 5,
    MAX_LENGTH: 50,
    PATTERN: /^[A-Z0-9\-]+$/i,
  },
} as const;

// Cache Keys
export const CACHE_KEYS = {
  USER_PROFILE: 'user_profile',
  ORGANIZATION_SETTINGS: 'organization_settings',
  DASHBOARD_STATS: 'dashboard_stats',
  ORDERS_LIST: 'orders_list',
  WAREHOUSE_INVENTORY: 'warehouse_inventory',
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_PREFERENCES: 'user_preferences',
  THEME: 'theme',
  LANGUAGE: 'language',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SERVER_ERROR: 'An unexpected error occurred. Please try again later.',
  FILE_TOO_LARGE: 'File size exceeds the maximum limit.',
  INVALID_FILE_TYPE: 'File type is not supported.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  ORDER_CREATED: 'Order created successfully!',
  ORDER_UPDATED: 'Order updated successfully!',
  PAYMENT_PROCESSED: 'Payment processed successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  SETTINGS_SAVED: 'Settings saved successfully!',
  FILE_UPLOADED: 'File uploaded successfully!',
  EMAIL_SENT: 'Email sent successfully!',
} as const;