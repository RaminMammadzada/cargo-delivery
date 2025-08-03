# Architectural Decision Record (ADR)

## Multi-Tenant Cargo Delivery Platform with Configurable Business Models

**Date:** August 2025  
**Status:** Proposed  
**Decision Makers:** Engineering Team, Product Team, Business Stakeholders

---

## Context

We are building a multi-tenant cargo delivery platform that supports both business models simultaneously:

1. **Assisted Purchase Model**: Company purchases products on behalf of customers
2. **Self-Purchase Model**: Customers purchase independently and ship to company warehouses

**Key Requirement**: Super admins can enable/disable these features per client organization, allowing different business models for different customer segments or markets.

### Business Requirements

- Multi-tenant architecture with organization-level feature flags
- Both purchase models available simultaneously
- Comprehensive user management (Super Admin → Org Admin → End Users)
- Multi-country warehouse management
- Real-time package tracking with role-based visibility
- Responsive web design for all device types
- Complete audit trails for compliance
- Scalable payment processing with multi-currency support

---

## Decision 1: Multi-Tenant Architecture Pattern

### Status: **DECIDED**

**Choice:** Shared Database with Tenant Isolation via Row-Level Security

**Alternatives Considered:**

- Separate databases per tenant
- Shared database with application-level filtering
- Schema-per-tenant approach

**Decision Rationale:**

- **Cost Efficiency**: Single database infrastructure
- **Data Analytics**: Cross-tenant reporting and analytics
- **Maintenance**: Single schema to maintain
- **PostgreSQL RLS**: Native row-level security support
- **Feature Flags**: Easy to implement organization-level features

**Implementation:**

```sql
-- Every table includes tenant_id with RLS policies
CREATE POLICY tenant_isolation ON orders
  FOR ALL USING (organization_id = current_setting('app.current_tenant')::UUID);
```

**Consequences:**

- ✅ Cost-effective scaling
- ✅ Simplified maintenance
- ✅ Cross-tenant analytics
- ❌ Security complexity
- ❌ Potential data leakage risk

---

## Decision 2: Database Schema Design

### Status: **DECIDED**

**Choice:** Comprehensive relational schema with JSONB for flexible attributes

**Core Schema Structure:**

```sql
-- Organizations and Multi-tenancy
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    settings JSONB DEFAULT '{}',
    features JSONB DEFAULT '{}', -- Feature flags
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Feature flags configuration
CREATE TABLE organization_features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id),
    feature_name VARCHAR(100) NOT NULL, -- 'assisted_purchase', 'self_purchase', etc.
    enabled BOOLEAN DEFAULT false,
    config JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Management
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL, -- 'super_admin', 'org_admin', 'warehouse_staff', 'customer'
    profile JSONB DEFAULT '{}',
    email_verified BOOLEAN DEFAULT false,
    phone_verified BOOLEAN DEFAULT false,
    two_factor_enabled BOOLEAN DEFAULT false,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Warehouses
CREATE TABLE warehouses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id),
    name VARCHAR(255) NOT NULL,
    country_code VARCHAR(2) NOT NULL,
    address JSONB NOT NULL,
    contact_info JSONB DEFAULT '{}',
    timezone VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products (for assisted purchase model)
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id),
    external_url TEXT NOT NULL,
    title VARCHAR(500) NOT NULL,
    price_amount DECIMAL(12,2) NOT NULL,
    price_currency VARCHAR(3) NOT NULL,
    source_platform VARCHAR(100), -- 'amazon_de', 'ebay_de', etc.
    product_data JSONB DEFAULT '{}', -- Scraped product details
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders (unified for both business models)
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id),
    customer_id UUID REFERENCES users(id),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    order_type VARCHAR(20) NOT NULL, -- 'assisted_purchase', 'self_purchase'
    status VARCHAR(50) NOT NULL DEFAULT 'pending',

    -- Assisted Purchase fields
    product_id UUID REFERENCES products(id),
    purchase_assigned_to UUID REFERENCES users(id), -- Staff member

    -- Self Purchase fields
    external_tracking_number VARCHAR(100),
    declared_value_amount DECIMAL(12,2),
    declared_value_currency VARCHAR(3),

    -- Common fields
    source_warehouse_id UUID REFERENCES warehouses(id),
    destination_warehouse_id UUID REFERENCES warehouses(id),
    shipping_address JSONB NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL,
    total_currency VARCHAR(3) NOT NULL,
    payment_status VARCHAR(50) DEFAULT 'pending',

    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Packages (can have multiple packages per order)
CREATE TABLE packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id),
    order_id UUID REFERENCES orders(id),
    tracking_number VARCHAR(100) UNIQUE,
    weight_grams INTEGER,
    dimensions JSONB, -- {length, width, height} in cm
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    current_location JSONB,
    estimated_delivery TIMESTAMP WITH TIME ZONE,
    actual_delivery TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Package tracking events
CREATE TABLE tracking_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id),
    package_id UUID REFERENCES packages(id),
    event_type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    location JSONB,
    occurred_at TIMESTAMP WITH TIME ZONE NOT NULL,
    source VARCHAR(50), -- 'manual', 'carrier_api', 'warehouse_scan'
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Documents and file management
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id),
    order_id UUID REFERENCES orders(id),
    document_type VARCHAR(50) NOT NULL, -- 'invoice', 'receipt', 'customs_form'
    filename VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    uploaded_by UUID REFERENCES users(id),
    verification_status VARCHAR(50) DEFAULT 'pending',
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id),
    order_id UUID REFERENCES orders(id),
    amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    provider VARCHAR(50) NOT NULL, -- 'stripe', 'local_bank', etc.
    provider_transaction_id VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit log for compliance
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id UUID NOT NULL,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Consequences:**

- ✅ Flexible schema supports both business models
- ✅ Strong data integrity with foreign keys
- ✅ Audit trail for compliance
- ✅ Feature flags enable/disable functionality
- ❌ Complex queries for reporting
- ❌ Schema migration complexity

---

## Decision 3: Authentication & Authorization System

### Status: **DECIDED**

**Choice:** Role-Based Access Control (RBAC) with Organization Scoping

**User Roles Hierarchy:**

```typescript
enum UserRole {
  SUPER_ADMIN = "super_admin", // Platform-wide access
  ORG_ADMIN = "org_admin", // Organization management
  WAREHOUSE_MANAGER = "warehouse_manager", // Warehouse operations
  WAREHOUSE_STAFF = "warehouse_staff", // Package handling
  PURCHASE_AGENT = "purchase_agent", // Assisted purchases
  CUSTOMER_SERVICE = "customer_service", // Customer support
  CUSTOMER = "customer", // End users
}

interface Permission {
  resource: string;
  action: string;
  conditions?: Record<string, any>;
}
```

**Permission Matrix:**

```typescript
const PERMISSIONS = {
  [UserRole.SUPER_ADMIN]: ["*:*"], // All permissions
  [UserRole.ORG_ADMIN]: [
    "organization:read",
    "organization:update",
    "users:*",
    "orders:*",
    "features:toggle",
  ],
  [UserRole.WAREHOUSE_MANAGER]: [
    "warehouse:read",
    "warehouse:update",
    "packages:*",
    "tracking:create",
    "inventory:*",
  ],
  [UserRole.CUSTOMER]: [
    "orders:create",
    "orders:read:own",
    "documents:upload:own",
    "tracking:read:own",
  ],
};
```

**JWT Token Structure:**

```typescript
interface JWTPayload {
  sub: string; // User ID
  org: string; // Organization ID
  role: UserRole;
  permissions: string[];
  features: string[]; // Enabled features for org
  exp: number;
  iat: number;
}
```

**Consequences:**

- ✅ Granular permission control
- ✅ Organization-level isolation
- ✅ Feature-based access control
- ❌ Complex permission management
- ❌ Token size considerations

---

## Decision 4: Frontend Architecture & Responsive Design

### Status: **DECIDED**

**Choice:** React + TypeScript + Tailwind CSS + Mobile-First Design

**Component Structure:**

```typescript
// Feature-flagged components
interface FeatureWrapperProps {
  feature: string;
  organization: Organization;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const FeatureWrapper: React.FC<FeatureWrapperProps> = ({
  feature,
  organization,
  children,
  fallback = null
}) => {
  const isEnabled = organization.features[feature]?.enabled;
  return isEnabled ? <>{children}</> : <>{fallback}</>;
};

// Usage in components
const OrderCreationPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Assisted Purchase Option */}
        <FeatureWrapper feature="assisted_purchase" organization={currentOrg}>
          <AssistedPurchaseForm />
        </FeatureWrapper>

        {/* Self Purchase Option */}
        <FeatureWrapper feature="self_purchase" organization={currentOrg}>
          <SelfPurchaseForm />
        </FeatureWrapper>
      </div>
    </div>
  );
};
```

**Responsive Breakpoints (Tailwind CSS):**

```css
/* Mobile First Approach */
.container {
  @apply px-4; /* Mobile: 16px padding */
  @apply sm:px-6; /* Small: 24px padding */
  @apply md:px-8; /* Medium: 32px padding */
  @apply lg:px-12; /* Large: 48px padding */
  @apply xl:px-16; /* XL: 64px padding */
}

/* Component responsiveness */
.order-grid {
  @apply grid;
  @apply grid-cols-1; /* Mobile: 1 column */
  @apply sm:grid-cols-2; /* Small: 2 columns */
  @apply lg:grid-cols-3; /* Large: 3 columns */
  @apply xl:grid-cols-4; /* XL: 4 columns */
  @apply gap-4;
  @apply sm:gap-6;
  @apply lg:gap-8;
}
```

**Mobile Navigation Pattern:**

```typescript
const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Logo className="h-8 w-auto" />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <NavItems />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500"
            >
              <MenuIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <Transition show={isOpen}>
          <div className="md:hidden">
            <div className="pt-2 pb-3 space-y-1">
              <MobileNavItems />
            </div>
          </div>
        </Transition>
      </div>
    </nav>
  );
};
```

**Consequences:**

- ✅ Consistent design system
- ✅ Mobile-first approach
- ✅ Feature-flag driven UI
- ✅ Accessible components
- ❌ Large bundle size
- ❌ CSS specificity issues

---

## Decision 5: State Management Strategy

### Status: **DECIDED**

**Choice:** Redux Toolkit + RTK Query + Context for UI State

**Store Structure:**

```typescript
interface RootState {
  auth: AuthState;
  organization: OrganizationState;
  orders: OrdersState;
  packages: PackagesState;
  ui: UIState;
}

interface AuthState {
  user: User | null;
  token: string | null;
  permissions: Permission[];
  features: string[];
  isAuthenticated: boolean;
  loading: boolean;
}

interface OrganizationState {
  current: Organization | null;
  features: Record<string, FeatureConfig>;
  warehouses: Warehouse[];
  settings: OrganizationSettings;
}
```

**API Layer with RTK Query:**

```typescript
export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/v1",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      const orgId = (getState() as RootState).organization.current?.id;

      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      if (orgId) {
        headers.set("x-organization-id", orgId);
      }
      return headers;
    },
  }),
  tagTypes: ["Order", "Package", "User", "Organization"],
  endpoints: (builder) => ({
    getOrders: builder.query<Order[], OrderFilters>({
      query: (filters) => ({
        url: "orders",
        params: filters,
      }),
      providesTags: ["Order"],
    }),
    createAssistedPurchaseOrder: builder.mutation<
      Order,
      AssistedPurchaseRequest
    >({
      query: (data) => ({
        url: "orders/assisted-purchase",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Order"],
    }),
  }),
});
```

**Consequences:**

- ✅ Predictable state management
- ✅ Optimistic updates
- ✅ Automatic caching
- ✅ Type-safe API calls
- ❌ Boilerplate code
- ❌ Learning curve

---

## Decision 6: Form Management & Validation

### Status: **DECIDED**

**Choice:** React Hook Form + Zod for validation

**Form Implementation:**

```typescript
// Validation schemas
const assistedPurchaseSchema = z.object({
  productUrl: z.string().url('Invalid product URL'),
  quantity: z.number().min(1).max(10),
  notes: z.string().optional(),
  shippingAddress: addressSchema,
});

const selfPurchaseSchema = z.object({
  externalTrackingNumber: z.string().min(5),
  declaredValue: z.number().positive(),
  currency: z.enum(['USD', 'EUR', 'AZN']),
  invoice: z.instanceof(File),
  shippingAddress: addressSchema,
});

// Form component
const OrderForm = () => {
  const { features } = useOrganization();
  const [orderType, setOrderType] = useState<'assisted' | 'self'>('assisted');

  const schema = orderType === 'assisted'
    ? assistedPurchaseSchema
    : selfPurchaseSchema;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(schema),
    mode: 'onChange',
  });

  const onSubmit = async (data: any) => {
    try {
      if (orderType === 'assisted') {
        await createAssistedPurchaseOrder(data).unwrap();
      } else {
        await createSelfPurchaseOrder(data).unwrap();
      }
      toast.success('Order created successfully!');
    } catch (error) {
      toast.error('Failed to create order');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Order Type Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {features.assisted_purchase?.enabled && (
          <OrderTypeCard
            type="assisted"
            selected={orderType === 'assisted'}
            onClick={() => setOrderType('assisted')}
          />
        )}
        {features.self_purchase?.enabled && (
          <OrderTypeCard
            type="self"
            selected={orderType === 'self'}
            onClick={() => setOrderType('self')}
          />
        )}
      </div>

      {/* Dynamic form fields based on order type */}
      {orderType === 'assisted' ? (
        <AssistedPurchaseFields register={register} errors={errors} />
      ) : (
        <SelfPurchaseFields register={register} errors={errors} />
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2 px-4 rounded-md"
      >
        {isSubmitting ? 'Creating Order...' : 'Create Order'}
      </button>
    </form>
  );
};
```

**Consequences:**

- ✅ Type-safe forms
- ✅ Excellent performance
- ✅ Built-in validation
- ✅ Minimal re-renders
- ❌ Learning curve for complex forms
- ❌ Limited built-in UI components

---

## Decision 7: File Upload & Management

### Status: **DECIDED**

**Choice:** Direct S3 upload with presigned URLs + progress tracking

**Implementation:**

```typescript
interface FileUploadProps {
  onUpload: (fileData: UploadedFile) => void;
  acceptedTypes: string[];
  maxSize: number;
  multiple?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onUpload,
  acceptedTypes,
  maxSize,
  multiple = false,
}) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadFile = async (file: File) => {
    setUploading(true);
    setProgress(0);

    try {
      // Get presigned URL from backend
      const { uploadUrl, fileKey } = await getPresignedUrl({
        filename: file.name,
        contentType: file.type,
        size: file.size,
      });

      // Upload directly to S3 with progress tracking
      await uploadToS3(uploadUrl, file, (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        setProgress(percentCompleted);
      });

      onUpload({
        key: fileKey,
        filename: file.name,
        size: file.size,
        type: file.type,
      });

      toast.success('File uploaded successfully');
    } catch (error) {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
      <Dropzone
        onDrop={uploadFile}
        accept={acceptedTypes}
        maxSize={maxSize}
        multiple={multiple}
        disabled={uploading}
      >
        {({ getRootProps, getInputProps, isDragActive }) => (
          <div {...getRootProps()} className="text-center cursor-pointer">
            <input {...getInputProps()} />
            {uploading ? (
              <UploadProgress progress={progress} />
            ) : (
              <UploadPrompt isDragActive={isDragActive} />
            )}
          </div>
        )}
      </Dropzone>
    </div>
  );
};
```

**Consequences:**

- ✅ Direct upload reduces server load
- ✅ Progress tracking for UX
- ✅ Type validation and size limits
- ✅ Drag and drop support
- ❌ Client-side complexity
- ❌ S3 dependency

---

## Decision 8: Real-time Updates & Notifications

### Status: **DECIDED**

**Choice:** WebSocket with Socket.IO + Redis for scaling + Push notifications

**Implementation:**

```typescript
// WebSocket event types
interface SocketEvents {
  "tracking:update": (data: TrackingUpdate) => void;
  "order:status_changed": (data: OrderStatusUpdate) => void;
  "payment:completed": (data: PaymentUpdate) => void;
  "admin:new_order": (data: NewOrderNotification) => void;
}

// Client-side hook
const useRealTimeUpdates = () => {
  const { user, organization } = useAuth();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_WS_URL, {
      auth: {
        token: getToken(),
        organizationId: organization?.id,
      },
    });

    // Join user-specific room
    socket.emit("join", `user:${user.id}`);

    // Join organization room if admin
    if (isAdmin(user.role)) {
      socket.emit("join", `org:${organization.id}`);
    }

    // Listen for tracking updates
    socket.on("tracking:update", (update) => {
      dispatch(updatePackageTracking(update));
      toast.info(`Package ${update.trackingNumber} updated: ${update.status}`);
    });

    // Listen for order status changes
    socket.on("order:status_changed", (update) => {
      dispatch(updateOrderStatus(update));

      // Show notification based on status
      if (update.status === "delivered") {
        toast.success("Your package has been delivered!");
      }
    });

    return () => socket.disconnect();
  }, [user, organization]);
};

// Push notification integration
const usePushNotifications = () => {
  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      registerServiceWorker();
    }
  }, []);

  const subscribeToPush = async () => {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.NEXT_PUBLIC_VAPID_KEY,
    });

    // Send subscription to backend
    await savePushSubscription(subscription);
  };
};
```

**Consequences:**

- ✅ Real-time user experience
- ✅ Multi-device notifications
- ✅ Scalable with Redis
- ✅ Offline notification support
- ❌ Complex state synchronization
- ❌ Battery usage on mobile

---

## Decision 9: Performance Optimization

### Status: **DECIDED**

**Choice:** Multi-level caching + Code splitting + Image optimization

**Caching Strategy:**

```typescript
// Redis caching layers
const CACHE_KEYS = {
  user: (id: string) => `user:${id}`,
  organization: (id: string) => `org:${id}`,
  features: (orgId: string) => `features:${orgId}`,
  tracking: (trackingNumber: string) => `tracking:${trackingNumber}`,
  exchangeRates: () => 'exchange_rates',
};

// API caching middleware
const cacheMiddleware = (ttl: number) => async (req, res, next) => {
  const cacheKey = generateCacheKey(req);
  const cached = await redis.get(cacheKey);

  if (cached) {
    return res.json(JSON.parse(cached));
  }

  // Override res.json to cache response
  const originalJson = res.json;
  res.json = function(data) {
    redis.setex(cacheKey, ttl, JSON.stringify(data));
    return originalJson.call(this, data);
  };

  next();
};

// Frontend code splitting
const OrderManagement = lazy(() => import('../pages/OrderManagement'));
const PackageTracking = lazy(() => import('../pages/PackageTracking'));
const AdminDashboard = lazy(() => import('../pages/AdminDashboard'));

// Route-based code splitting
const AppRoutes = () => (
  <Suspense fallback={<PageLoader />}>
    <Routes>
      <Route path="/orders" element={<OrderManagement />} />
      <Route path="/tracking" element={<PackageTracking />} />
      <ProtectedRoute role="admin">
        <Route path="/admin" element={<AdminDashboard />} />
      </ProtectedRoute>
    </Routes>
  </Suspense>
);
```

**Image Optimization:**

```typescript
// Next.js Image component with optimization
const OptimizedImage = ({ src, alt, ...props }) => (
  <Image
    src={src}
    alt={alt}
    placeholder="blur"
    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ..."
    quality={85}
    formats={['image/webp', 'image/avif']}
    {...props}
  />
);

// Progressive image loading
const ProgressiveImage = ({ src, placeholder, alt }) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div className="relative">
      <img
        src={placeholder}
        alt={alt}
        className={`transition-opacity duration-300 ${
          imageLoaded ? 'opacity-0' : 'opacity-100'
        }`}
      />
      <img
        src={src}
        alt={alt}
        onLoad={() => setImageLoaded(true)}
        className={`absolute inset-0 transition-opacity duration-300 ${
          imageLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
};
```

**Consequences:**

- ✅ Faster page loads
- ✅ Reduced bandwidth usage
- ✅ Better mobile performance
- ✅ Improved SEO scores
- ❌ Cache invalidation complexity
- ❌ Build time increase

---

## Decision 10: Security Implementation

### Status: **DECIDED**

**Choice:** Defense in depth with multiple security layers

**API Security:**

```typescript
// Rate limiting
const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP",
  standardHeaders: true,
  legacyHeaders: false,
});

// Input validation middleware
const validateInput = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      res.status(400).json({ error: "Invalid input data" });
    }
  };
};

// SQL injection prevention
const safeQuery = async (query: string, params: any[]) => {
  // Use parameterized queries only
  return await db.query(query, params);
};

// XSS prevention
const sanitizeHtml = (content: string) => {
  return DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ["b", "i", "em", "strong"],
    ALLOWED_ATTR: [],
  });
};
```

**Frontend Security:**

```typescript
// CSP headers
const securityHeaders = {
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "connect-src 'self' wss:",
  ].join("; "),
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
};

// Secure token storage
const TokenManager = {
  setToken: (token: string) => {
    // Use httpOnly cookies for refresh tokens
    document.cookie = `refreshToken=${token}; httpOnly; secure; sameSite=strict; path=/`;
    // Use memory for access tokens
    sessionStorage.setItem("accessToken", token);
  },

  getToken: () => {
    return sessionStorage.getItem("accessToken");
  },

  clearTokens: () => {
    document.cookie =
      "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    sessionStorage.removeItem("accessToken");
    localStorage.clear();
  },
};

// CSRF protection
const csrfToken = () => {
  const token = document
    .querySelector('meta[name="csrf-token"]')
    ?.getAttribute("content");
  return token;
};
```

**File Upload Security:**

```typescript
// File validation
const validateFile = (file: File): boolean => {
  const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!allowedTypes.includes(file.type)) {
    throw new Error("File type not allowed");
  }

  if (file.size > maxSize) {
    throw new Error("File too large");
  }

  return true;
};

// Virus scanning integration
const scanFile = async (fileBuffer: Buffer): Promise<boolean> => {
  // Integration with antivirus service
  const scanResult = await antivirusService.scan(fileBuffer);
  return scanResult.clean;
};
```

**Consequences:**

- ✅ Multiple security layers
- ✅ Protection against common attacks
- ✅ Secure file handling
- ✅ Token security best practices
- ❌ Performance overhead
- ❌ User experience friction

---

## Decision 11: Testing Strategy

### Status: **DECIDED**

**Choice:** Comprehensive testing pyramid with automated CI/CD

**Testing Levels:**

```typescript
// Unit Tests (Jest + React Testing Library)
describe('OrderForm', () => {
  it('should show assisted purchase form when feature is enabled', () => {
    const mockOrg = {
      features: { assisted_purchase: { enabled: true } }
    };

    render(<OrderForm organization={mockOrg} />);

    expect(screen.getByText('Assisted Purchase')).toBeInTheDocument();
  });

  it('should validate product URL format', async () => {
    render(<AssistedPurchaseForm />);

    const urlInput = screen.getByLabelText('Product URL');
    fireEvent.change(urlInput, { target: { value: 'invalid-url' } });
    fireEvent.blur(urlInput);

    await waitFor(() => {
      expect(screen.getByText('Invalid product URL')).toBeInTheDocument();
    });
  });
});

// Integration Tests (API Testing)
describe('Orders API', () => {
  let testOrg: Organization;
  let testUser: User;

  beforeEach(async () => {
    testOrg = await createTestOrganization({
      features: { assisted_purchase: { enabled: true } }
    });
    testUser = await createTestUser({ organizationId: testOrg.id });
  });

  it('should create assisted purchase order', async () => {
    const orderData = {
      productUrl: 'https://amazon.de/product/123',
      quantity: 1,
      shippingAddress: testAddress,
    };

    const response = await request(app)
      .post('/api/v1/orders/assisted-purchase')
      .set('Authorization', `Bearer ${testUser.token}`)
      .set('X-Organization-ID', testOrg.id)
      .send(orderData)
      .expect(201);

    expect(response.body.orderType).toBe('assisted_purchase');
    expect(response.body.status).toBe('pending');
  });
});

// E2E Tests (Playwright)
test('complete assisted purchase workflow', async ({ page }) => {
  // Login as customer
  await page.goto('/login');
  await page.fill('#email', 'customer@test.com');
  await page.fill('#password', 'password123');
  await page.click('#login-button');

  // Navigate to create order
  await page.click('[data-testid="create-order"]');

  // Select assisted purchase
  await page.click('[data-testid="assisted-purchase-option"]');

  // Fill order form
  await page.fill('#product-url', 'https://amazon.de/product/123');
  await page.fill('#quantity', '1');
  await page.fill('#shipping-address', 'Test Address, Baku');

  // Submit order
  await page.click('#submit-order');

  // Verify success
  await expect(page.locator('.success-message')).toContainText('Order created successfully');

  // Verify order appears in orders list
  await page.goto('/orders');
  await expect(page.locator('[data-testid="order-item"]')).toBeVisible();
});

// Load Tests (K6)
import http from 'k6/http';
import { check } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 200 }, // Ramp up to 200
    { duration: '5m', target: 200 }, // Stay at 200
    { duration: '2m', target: 0 },   // Ramp down
  ],
};

export default function() {
  const response = http.get('http://localhost:3000/api/v1/orders');
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
}
```

**CI/CD Pipeline:**

```yaml
# .github/workflows/test.yml
name: Test & Deploy

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: cargo_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Run linting
        run: npm run lint

      - name: Run type checking
        run: npm run type-check

      - name: Run unit tests
        run: npm run test:unit
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/cargo_test
          REDIS_URL: redis://localhost:6379

      - name: Run integration tests
        run: npm run test:integration
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/cargo_test
          REDIS_URL: redis://localhost:6379

      - name: Build application
        run: npm run build

      - name: Run E2E tests
        run: npm run test:e2e
        env:
          CI: true

  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Run security audit
        run: npm audit --audit-level high

      - name: Run dependency vulnerability scan
        uses: securecodewarrior/github-action-add-sarif@v1
        with:
          sarif-file: "security-scan-results.sarif"

  deploy:
    needs: [test, security]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - name: Deploy to staging
        run: |
          # Deploy to Kubernetes staging environment
          kubectl apply -f k8s/staging/

      - name: Run smoke tests
        run: npm run test:smoke -- --env=staging

      - name: Deploy to production
        if: success()
        run: |
          # Deploy to production with blue-green deployment
          kubectl apply -f k8s/production/
```

**Consequences:**

- ✅ High code quality assurance
- ✅ Automated quality gates
- ✅ Performance regression detection
- ✅ Security vulnerability scanning
- ❌ Longer CI/CD pipeline times
- ❌ Test maintenance overhead

---

## Decision 12: Monitoring & Observability

### Status: **DECIDED**

**Choice:** Comprehensive observability with metrics, logs, and traces

**Monitoring Stack:**

```typescript
// Application metrics (Prometheus)
import client from "prom-client";

const httpRequestDuration = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status_code", "organization_id"],
});

const orderMetrics = {
  ordersCreated: new client.Counter({
    name: "orders_created_total",
    help: "Total number of orders created",
    labelNames: ["type", "organization_id"],
  }),

  packagesTracked: new client.Gauge({
    name: "packages_in_transit",
    help: "Number of packages currently in transit",
    labelNames: ["status", "organization_id"],
  }),

  paymentProcessingTime: new client.Histogram({
    name: "payment_processing_duration_seconds",
    help: "Time taken to process payments",
    labelNames: ["provider", "currency"],
  }),
};

// Business metrics middleware
const businessMetrics = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestDuration
      .labels(
        req.method,
        req.route?.path || req.path,
        res.statusCode.toString(),
        req.organizationId
      )
      .observe(duration);
  });

  next();
};

// Distributed tracing (OpenTelemetry)
import { trace, context } from "@opentelemetry/api";

const tracer = trace.getTracer("cargo-delivery-service");

const createOrderWithTracing = async (orderData: CreateOrderRequest) => {
  const span = tracer.startSpan("create_order");
  span.setAttributes({
    "order.type": orderData.type,
    "order.organization_id": orderData.organizationId,
    "order.customer_id": orderData.customerId,
  });

  try {
    // Validate order data
    const childSpan1 = tracer.startSpan("validate_order_data", {
      parent: span,
    });
    await validateOrderData(orderData);
    childSpan1.end();

    // Process payment
    const childSpan2 = tracer.startSpan("process_payment", { parent: span });
    const payment = await processPayment(orderData.payment);
    childSpan2.setAttributes({
      "payment.provider": payment.provider,
      "payment.amount": payment.amount,
    });
    childSpan2.end();

    // Create order
    const order = await createOrder(orderData);
    span.setAttributes({
      "order.id": order.id,
      "order.number": order.orderNumber,
    });

    orderMetrics.ordersCreated
      .labels(orderData.type, orderData.organizationId)
      .inc();

    return order;
  } catch (error) {
    span.recordException(error);
    span.setStatus({
      code: trace.SpanStatusCode.ERROR,
      message: error.message,
    });
    throw error;
  } finally {
    span.end();
  }
};

// Error tracking (Sentry)
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  beforeSend(event) {
    // Filter out sensitive data
    if (event.request?.data) {
      delete event.request.data.password;
      delete event.request.data.token;
    }
    return event;
  },
});

// Custom error handling
const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log error with context
  logger.error("Unhandled error", {
    error: error.message,
    stack: error.stack,
    organizationId: req.organizationId,
    userId: req.userId,
    path: req.path,
    method: req.method,
  });

  // Send to Sentry with additional context
  Sentry.withScope((scope) => {
    scope.setTag("organization_id", req.organizationId);
    scope.setUser({ id: req.userId });
    scope.setContext("request", {
      method: req.method,
      url: req.url,
      headers: req.headers,
    });
    Sentry.captureException(error);
  });

  // Return appropriate error response
  const statusCode = error.statusCode || 500;
  res.status(statusCode).json({
    error:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : error.message,
    requestId: req.requestId,
  });
};
```

**Health Checks:**

```typescript
// Health check endpoints
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.APP_VERSION,
  });
});

app.get("/health/detailed", async (req, res) => {
  const checks = await Promise.allSettled([
    checkDatabase(),
    checkRedis(),
    checkS3(),
    checkExternalAPIs(),
  ]);

  const results = {
    database: checks[0].status === "fulfilled" ? "healthy" : "unhealthy",
    redis: checks[1].status === "fulfilled" ? "healthy" : "unhealthy",
    s3: checks[2].status === "fulfilled" ? "healthy" : "unhealthy",
    externalAPIs: checks[3].status === "fulfilled" ? "healthy" : "unhealthy",
  };

  const isHealthy = Object.values(results).every(
    (status) => status === "healthy"
  );

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? "healthy" : "unhealthy",
    checks: results,
    timestamp: new Date().toISOString(),
  });
});

// Readiness probe for Kubernetes
app.get("/ready", async (req, res) => {
  try {
    await db.query("SELECT 1");
    res.json({ status: "ready" });
  } catch (error) {
    res.status(503).json({ status: "not ready" });
  }
});
```

**Alerting Rules:**

```yaml
# Prometheus alerting rules
groups:
  - name: cargo-delivery-alerts
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value }} requests per second"

      - alert: DatabaseConnectionFailure
        expr: up{job="postgres"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Database connection failure"

      - alert: LongOrderProcessingTime
        expr: histogram_quantile(0.95, rate(order_processing_duration_seconds_bucket[5m])) > 30
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Order processing taking too long"

      - alert: LowDiskSpace
        expr: node_filesystem_avail_bytes / node_filesystem_size_bytes < 0.1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Low disk space on {{ $labels.instance }}"
```

**Consequences:**

- ✅ Complete system visibility
- ✅ Proactive issue detection
- ✅ Performance optimization insights
- ✅ Business metrics tracking
- ❌ Operational complexity
- ❌ Storage and processing costs

---

## Implementation Roadmap

### Phase 1: Foundation (Months 1-3)

**Sprint 1-2: Core Infrastructure**

- Multi-tenant database setup with RLS
- Authentication & authorization system
- Basic user management and organization setup
- Feature flag system implementation

**Sprint 3-4: Basic Order Management**

- Order creation forms (both models)
- Basic package tracking
- Document upload functionality
- Payment integration (single provider)

**Sprint 5-6: Admin Dashboard**

- Organization management interface
- Feature toggle controls
- Basic reporting and analytics
- User role management

### Phase 2: Advanced Features (Months 4-6)

**Sprint 7-8: Real-time Features**

- WebSocket implementation for live tracking
- Push notification system
- Real-time dashboard updates
- Mobile app development

**Sprint 9-10: Integration & Automation**

- Shipping carrier API integrations
- Automated tracking updates
- Email/SMS notification system
- Payment provider redundancy

**Sprint 11-12: Enhanced UX**

- Advanced search and filtering
- Bulk operations for admins
- Mobile app completion
- Performance optimization

### Phase 3: Scale & Optimize (Months 7-9)

**Sprint 13-14: Advanced Analytics**

- Business intelligence dashboard
- Predictive analytics for delivery times
- Cost optimization algorithms
- Advanced reporting suite

**Sprint 15-16: International Expansion**

- Multi-currency support
- Localization for additional countries
- Regional warehouse management
- Customs integration

**Sprint 17-18: Enterprise Features**

- API marketplace for third-parties
- White-label solutions
- Advanced security features
- Compliance reporting

---

## Success Metrics & KPIs

### Technical Metrics

| Metric                     | Target      | Measurement          |
| -------------------------- | ----------- | -------------------- |
| System Uptime              | 99.9%       | Monthly availability |
| API Response Time          | <500ms P95  | Prometheus metrics   |
| Mobile App Startup         | <3 seconds  | Firebase Performance |
| Database Query Performance | <100ms P90  | Query analysis       |
| Build & Deploy Time        | <10 minutes | CI/CD pipeline       |

### Business Metrics

| Metric                    | Target    | Measurement              |
| ------------------------- | --------- | ------------------------ |
| Order Processing Time     | <24 hours | Average processing time  |
| Customer Satisfaction     | >4.5/5    | Survey responses         |
| Package Delivery Success  | >95%      | Delivery completion rate |
| Payment Success Rate      | >99%      | Payment processing stats |
| Support Ticket Resolution | <2 hours  | Average response time    |

### User Experience Metrics

| Metric                  | Target | Measurement             |
| ----------------------- | ------ | ----------------------- |
| Registration Completion | >80%   | Funnel analysis         |
| Order Completion Rate   | >90%   | Conversion tracking     |
| Mobile App Rating       | >4.0   | App store ratings       |
| Feature Adoption        | >60%   | Feature usage analytics |
| User Retention (30-day) | >70%   | Cohort analysis         |

---

## Risk Assessment & Mitigation

### Technical Risks

| Risk                             | Probability | Impact   | Mitigation                                                       |
| -------------------------------- | ----------- | -------- | ---------------------------------------------------------------- |
| Database performance degradation | Medium      | High     | Read replicas, query optimization, caching                       |
| Third-party API failures         | High        | Medium   | Circuit breakers, fallback mechanisms, multiple providers        |
| Security vulnerabilities         | Medium      | Critical | Regular security audits, automated scanning, penetration testing |
| Scalability bottlenecks          | Medium      | High     | Load testing, horizontal scaling, microservices architecture     |

### Business Risks

| Risk                 | Probability | Impact | Mitigation                                                           |
| -------------------- | ----------- | ------ | -------------------------------------------------------------------- |
| Regulatory changes   | Medium      | High   | Modular architecture, compliance monitoring, legal consultation      |
| Currency fluctuation | High        | Medium | Real-time exchange rates, hedging strategies, multi-currency support |
| Carrier dependency   | Medium      | Medium | Multiple carrier integrations, backup options, SLA monitoring        |
| Competition          | High        | Medium | Focus on UX, operational efficiency, unique features                 |

### Operational Risks

| Risk                 | Probability | Impact   | Mitigation                                              |
| -------------------- | ----------- | -------- | ------------------------------------------------------- |
| Data loss            | Low         | Critical | Automated backups, disaster recovery, geo-redundancy    |
| Team knowledge silos | Medium      | Medium   | Documentation, code reviews, knowledge sharing sessions |
| Infrastructure costs | Medium      | Medium   | Cost monitoring, resource optimization, auto-scaling    |

---

## Conclusion

This architectural decision record provides a comprehensive foundation for building a scalable, secure, and feature-rich cargo delivery platform that supports multiple business models through configurable feature flags. The proposed architecture emphasizes:

- **Flexibility**: Multi-tenant design with configurable features
- **Scalability**: Microservices architecture with horizontal scaling
- **Security**: Multiple security layers and best practices
- **User Experience**: Responsive design and real-time updates
- **Maintainability**: Clean architecture with comprehensive testing
- **Observability**: Complete monitoring and alerting stack

The implementation roadmap provides a clear path from MVP to enterprise-scale platform, with defined success metrics and risk mitigation strategies to ensure successful delivery and operation.

---

**Document Version:** 2.0  
**Last Updated:** August 2025  
**Next Review:** November 2025  
**Approved By:** Technical Architecture Committee
