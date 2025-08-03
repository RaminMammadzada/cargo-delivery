import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  selectAuth, 
  selectUser, 
  selectIsAuthenticated, 
  selectUserRole,
  selectPermissions,
  loginStart,
  loginSuccess,
  loginFailure,
  logout as logoutAction,
  hasPermission,
  hasRole
} from '../store/slices/authSlice';
import { useLoginMutation, useLogoutMutation } from '../store/api/apiSlice';
import { UserRole } from '../types';

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const auth = useSelector(selectAuth);
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const userRole = useSelector(selectUserRole);
  const permissions = useSelector(selectPermissions);

  const [loginMutation] = useLoginMutation();
  const [logoutMutation] = useLogoutMutation();

  const login = async (email: string, password: string) => {
    try {
      dispatch(loginStart());
      const result = await loginMutation({ email, password }).unwrap();
      
      dispatch(loginSuccess({
        user: result.user,
        token: result.token,
        permissions: result.permissions,
      }));

      // Store token in localStorage for persistence
      localStorage.setItem('auth_token', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));

      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error: any) {
      const message = error?.data?.message || 'Login failed';
      dispatch(loginFailure(message));
      toast.error(message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await logoutMutation().unwrap();
    } catch (error) {
      // Continue with logout even if API call fails
      console.error('Logout API call failed:', error);
    } finally {
      dispatch(logoutAction());
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      toast.success('Logged out successfully');
      navigate('/login');
    }
  };

  const checkPermission = (permission: string): boolean => {
    return hasPermission(permissions, permission);
  };

  const checkRole = (requiredRole: UserRole): boolean => {
    return hasRole(userRole, requiredRole);
  };

  const isAdmin = (): boolean => {
    return checkRole(UserRole.ORG_ADMIN) || checkRole(UserRole.SUPER_ADMIN);
  };

  const isSuperAdmin = (): boolean => {
    return userRole === UserRole.SUPER_ADMIN;
  };

  const isCustomer = (): boolean => {
    return userRole === UserRole.CUSTOMER;
  };

  const isWarehouseStaff = (): boolean => {
    return checkRole(UserRole.WAREHOUSE_STAFF);
  };

  const isPurchaseAgent = (): boolean => {
    return userRole === UserRole.PURCHASE_AGENT;
  };

  const isCustomerService = (): boolean => {
    return userRole === UserRole.CUSTOMER_SERVICE;
  };

  // Initialize auth from localStorage on app start
  const initializeAuth = () => {
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        dispatch(loginSuccess({
          user,
          token,
          permissions: ['orders:create', 'orders:read', 'tracking:read'], // Default permissions
        }));
      } catch (error) {
        console.error('Failed to parse stored user data:', error);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
      }
    } else {
      // For demo purposes, set up a default user
      const demoUser = {
        id: 'demo-user-1',
        email: 'customer@demo.com',
        role: UserRole.CUSTOMER,
        organizationId: 'demo-org-1',
        profile: {
          firstName: 'Demo',
          lastName: 'Customer',
          phone: '+994501234567',
          language: 'en' as const,
          timezone: 'Asia/Baku',
          notifications: {
            email: true,
            sms: true,
            push: true,
            whatsapp: false,
          },
        },
        emailVerified: true,
        phoneVerified: false,
        twoFactorEnabled: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      dispatch(loginSuccess({
        user: demoUser,
        token: 'demo-token',
        permissions: ['orders:create', 'orders:read', 'tracking:read'],
      }));
    }
  };

  return {
    ...auth,
    user,
    isAuthenticated,
    userRole,
    permissions,
    login,
    logout,
    checkPermission,
    checkRole,
    isAdmin,
    isSuperAdmin,
    isCustomer,
    isWarehouseStaff,
    isPurchaseAgent,
    isCustomerService,
    initializeAuth,
  };
};