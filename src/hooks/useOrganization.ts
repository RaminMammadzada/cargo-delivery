import { useSelector, useDispatch } from 'react-redux';
import { 
  selectOrganization, 
  selectWarehouses, 
  selectOrganizationLoading,
  selectFeature,
  isFeatureEnabled,
  setOrganization,
  setWarehouses,
  updateFeature,
  setLoading,
  setError
} from '../store/slices/organizationSlice';
import { 
  useGetOrganizationQuery, 
  useGetWarehousesQuery,
  useToggleFeatureMutation 
} from '../store/api/apiSlice';
import { Organization, FeatureConfig } from '../types';
import { useAuth } from './useAuth';

export const useOrganization = () => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const organization = useSelector(selectOrganization);
  const warehouses = useSelector(selectWarehouses);
  const loading = useSelector(selectOrganizationLoading);

  const [toggleFeatureMutation] = useToggleFeatureMutation();

  // Fetch organization data
  const { 
    data: orgData, 
    isLoading: orgLoading, 
    error: orgError 
  } = useGetOrganizationQuery(user?.organizationId || '', {
    skip: !user?.organizationId,
  });

  // Fetch warehouses
  const { 
    data: warehouseData, 
    isLoading: warehouseLoading 
  } = useGetWarehousesQuery(undefined, {
    skip: !user?.organizationId,
  });

  // Update Redux state when data changes
  React.useEffect(() => {
    if (orgData && !organization) {
      dispatch(setOrganization(orgData));
    }
  }, [orgData, organization, dispatch]);

  React.useEffect(() => {
    if (warehouseData) {
      dispatch(setWarehouses(warehouseData));
    }
  }, [warehouseData, dispatch]);

  React.useEffect(() => {
    dispatch(setLoading(orgLoading || warehouseLoading));
  }, [orgLoading, warehouseLoading, dispatch]);

  React.useEffect(() => {
    if (orgError) {
      dispatch(setError(orgError.toString()));
    }
  }, [orgError, dispatch]);

  const toggleFeature = async (feature: string, enabled: boolean, config?: Record<string, any>) => {
    if (!organization) return;

    try {
      const result = await toggleFeatureMutation({
        organizationId: organization.id,
        feature,
        enabled,
        config,
      }).unwrap();

      dispatch(updateFeature({ feature, config: { enabled, config: config || {} } }));
      return result;
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