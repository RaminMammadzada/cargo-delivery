import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  selectOrganization, 
  selectWarehouses, 
  selectOrganizationLoading,
  setOrganization,
  setWarehouses,
  updateFeature,
  setLoading,
  setError
} from '../store/slices/organizationSlice';
import { Organization, FeatureConfig } from '../types';
import { useAuth } from './useAuth';

export const useOrganization = () => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const organization = useSelector(selectOrganization);
  const warehouses = useSelector(selectWarehouses);
  const loading = useSelector(selectOrganizationLoading);

  // Initialize demo organization data
  React.useEffect(() => {
    if (user && !organization) {
      const demoOrg: Organization = {
        id: 'demo-org-1',
        name: 'Demo Cargo Company',
        slug: 'demo-cargo',
        settings: {
          branding: {
            primaryColor: '#2563eb',
            secondaryColor: '#64748b',
          },
          contact: {
            email: 'info@democargo.com',
            phone: '+994501234567',
            address: {
              street: '123 Cargo Street',
              city: 'Baku',
              postalCode: 'AZ1000',
              country: 'AZ',
            },
          },
          business: {
            currency: 'USD',
            timezone: 'Asia/Baku',
            workingHours: {
              monday: { start: '09:00', end: '18:00', enabled: true },
              tuesday: { start: '09:00', end: '18:00', enabled: true },
              wednesday: { start: '09:00', end: '18:00', enabled: true },
              thursday: { start: '09:00', end: '18:00', enabled: true },
              friday: { start: '09:00', end: '18:00', enabled: true },
              saturday: { start: '10:00', end: '16:00', enabled: true },
              sunday: { start: '10:00', end: '16:00', enabled: false },
            },
          },
        },
        features: {
          assisted_purchase: { enabled: true, config: {} },
          self_purchase: { enabled: true, config: {} },
          package_consolidation: { enabled: true, config: {} },
          realtime_tracking: { enabled: true, config: {} },
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      dispatch(setOrganization(demoOrg));
      
      // Demo warehouses
      const demoWarehouses = [
        {
          id: 'warehouse-1',
          organizationId: 'demo-org-1',
          name: 'Germany Warehouse',
          countryCode: 'DE',
          address: {
            street: 'Warehouse Str. 1',
            city: 'Berlin',
            postalCode: '10115',
            country: 'DE',
          },
          contactInfo: {
            email: 'germany@democargo.com',
            phone: '+49301234567',
            manager: 'Hans Mueller',
          },
          timezone: 'Europe/Berlin',
          isActive: true,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'warehouse-2',
          organizationId: 'demo-org-1',
          name: 'USA Warehouse',
          countryCode: 'US',
          address: {
            street: '123 Warehouse Ave',
            city: 'New York',
            postalCode: '10001',
            country: 'US',
          },
          contactInfo: {
            email: 'usa@democargo.com',
            phone: '+12125551234',
            manager: 'John Smith',
          },
          timezone: 'America/New_York',
          isActive: true,
          createdAt: new Date().toISOString(),
        },
      ];
      
      dispatch(setWarehouses(demoWarehouses));
    }
  }, [user, organization, dispatch]);

  const toggleFeature = async (feature: string, enabled: boolean, config?: Record<string, any>) => {
    if (!organization) return;

    try {
      dispatch(updateFeature({ feature, config: { enabled, config: config || {} } }));
      return { success: true };
    } catch (error) {
      throw error;
    }
  };

  const getFeature = (feature: string): FeatureConfig | undefined => {
    return organization?.features[feature];
  };

  const isFeatureActive = (feature: string): boolean => {
    return organization?.features[feature]?.enabled || false;
  };

  const getFeatureConfig = (feature: string): Record<string, any> => {
    return organization?.features[feature]?.config || {};
  };

  // Feature-specific helpers
  const isAssistedPurchaseEnabled = (): boolean => {
    return isFeatureActive('assisted_purchase');
  };

  const isSelfPurchaseEnabled = (): boolean => {
    return isFeatureActive('self_purchase');
  };

  const isConsolidationEnabled = (): boolean => {
    return isFeatureActive('package_consolidation');
  };

  const isInsuranceEnabled = (): boolean => {
    return isFeatureActive('package_insurance');
  };

  const getAvailableWarehouses = () => {
    return warehouses.filter(w => w.isActive);
  };

  const getWarehouseByCountry = (countryCode: string) => {
    return warehouses.find(w => w.countryCode === countryCode && w.isActive);
  };

  return {
    organization,
    warehouses,
    loading,
    toggleFeature,
    getFeature,
    isFeatureActive,
    getFeatureConfig,
    isAssistedPurchaseEnabled,
    isSelfPurchaseEnabled,
    isConsolidationEnabled,
    isInsuranceEnabled,
    getAvailableWarehouses,
    getWarehouseByCountry,
  };
};