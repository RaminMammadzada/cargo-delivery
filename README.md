# CargoFlow - Multi-Tenant Cargo Delivery Platform

A comprehensive cargo delivery platform supporting both assisted purchase and self-purchase business models with multi-tenant architecture.

## 🚀 Features

### Core Features
- **Multi-Tenant Architecture**: Support multiple organizations with isolated data
- **Dual Business Models**: Assisted purchase and self-purchase workflows
- **Real-time Tracking**: Live package tracking with WebSocket updates
- **Role-Based Access Control**: Granular permissions for different user types
- **Responsive Design**: Mobile-first approach with excellent UX
- **Feature Flags**: Enable/disable features per organization

### User Roles
- **Super Admin**: Platform-wide management
- **Organization Admin**: Organization management and settings
- **Warehouse Manager**: Warehouse operations oversight
- **Warehouse Staff**: Package handling and processing
- **Purchase Agent**: Assisted purchase order processing
- **Customer Service**: Customer support and issue resolution
- **Customer**: End-user order creation and tracking

### Business Models

#### Assisted Purchase
- Customers provide product URLs
- Company purchases on behalf of customers
- Automatic product information parsing
- Purchase agent workflow
- Commission-based pricing

#### Self Purchase
- Customers purchase independently
- Ship to company warehouses
- Package registration and tracking
- Document verification workflow
- Fixed service fee pricing

## 🛠 Technology Stack

### Frontend
- **React 18** with TypeScript
- **Redux Toolkit** for state management
- **RTK Query** for API calls and caching
- **React Router** for navigation
- **React Hook Form** with Zod validation
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Lucide React** for icons

### Backend (Planned)
- **Node.js** with Express
- **PostgreSQL** with Row Level Security
- **Supabase** for authentication and real-time features
- **Redis** for caching and sessions
- **Socket.IO** for real-time updates

### Infrastructure
- **Vite** for development and building
- **Docker** for containerization
- **Kubernetes** for orchestration
- **AWS/GCP** for cloud hosting

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account (for backend services)

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cargo-delivery-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   - Supabase URL and keys
   - API endpoints
   - External service keys

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Access the application**
   - Open http://localhost:5173
   - Use demo credentials from the login page

## 🏗 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Basic UI components (Button, Input, etc.)
│   ├── layout/         # Layout components (Sidebar, Header)
│   ├── auth/           # Authentication components
│   └── features/       # Feature-specific components
├── pages/              # Page components
│   ├── auth/           # Authentication pages
│   ├── dashboard/      # Dashboard pages
│   ├── orders/         # Order management pages
│   └── ...
├── store/              # Redux store configuration
│   ├── slices/         # Redux slices
│   └── api/            # RTK Query API definitions
├── hooks/              # Custom React hooks
├── types/              # TypeScript type definitions
├── lib/                # Utility libraries
└── utils/              # Helper functions
```

## 🔐 Authentication & Authorization

### Authentication Flow
1. User logs in with email/password
2. JWT token issued with user info and permissions
3. Token stored securely and included in API requests
4. Organization context set for multi-tenancy

### Permission System
- Role-based permissions with hierarchy
- Feature-based access control
- Organization-level isolation
- Row-level security in database

### Demo Accounts
- **Customer**: customer@demo.com / password123
- **Admin**: admin@demo.com / password123  
- **Warehouse**: warehouse@demo.com / password123

## 🎯 Key Features Implementation

### Multi-Tenancy
- Organization-scoped data access
- Feature flags per organization
- Customizable branding and settings
- Isolated user management

### Order Management
- Dual workflow support (assisted/self-purchase)
- Product URL parsing and information extraction
- Shipping cost calculation
- Status tracking and notifications

### Package Tracking
- Real-time status updates
- Location tracking
- Event timeline
- Delivery notifications

### Warehouse Operations
- Package reception and processing
- Inventory management
- Consolidation services
- Staff productivity tracking

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm run preview
```

### Docker Deployment
```bash
docker build -t cargo-delivery-platform .
docker run -p 3000:3000 cargo-delivery-platform
```

## 📊 Monitoring & Analytics

### Built-in Analytics
- Order and revenue metrics
- Package delivery success rates
- User activity tracking
- Performance monitoring

### External Integrations
- Google Analytics
- Sentry for error tracking
- Custom business intelligence dashboards

## 🔧 Configuration

### Feature Flags
Features can be enabled/disabled per organization:
- `assisted_purchase`: Assisted purchase workflow
- `self_purchase`: Self-purchase workflow
- `package_consolidation`: Package consolidation services
- `package_insurance`: Insurance options
- `real_time_tracking`: Live tracking updates

### Environment Variables
See `.env.example` for all available configuration options.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use conventional commit messages
- Write tests for new features
- Update documentation as needed

## 📝 API Documentation

### Authentication Endpoints
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/logout` - User logout

### Order Endpoints
- `GET /api/v1/orders` - List orders
- `POST /api/v1/orders/assisted-purchase` - Create assisted purchase order
- `POST /api/v1/orders/self-purchase` - Create self-purchase order
- `PUT /api/v1/orders/:id/status` - Update order status

### Package Endpoints
- `GET /api/v1/packages` - List packages
- `GET /api/v1/packages/:id/tracking` - Get tracking events
- `POST /api/v1/packages/:id/tracking` - Add tracking event

## 🐛 Troubleshooting

### Common Issues

1. **Build Errors**
   - Ensure Node.js version is 18+
   - Clear node_modules and reinstall dependencies
   - Check for TypeScript errors

2. **Authentication Issues**
   - Verify Supabase configuration
   - Check environment variables
   - Clear browser storage

3. **API Connection Issues**
   - Verify API endpoint configuration
   - Check network connectivity
   - Review CORS settings

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- React and Redux teams for excellent tooling
- Tailwind CSS for the utility-first CSS framework
- Supabase for backend-as-a-service platform
- All contributors and testers

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Contact the development team
- Check the documentation wiki

---

**Built with ❤️ for efficient cargo delivery management**