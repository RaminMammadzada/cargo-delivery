import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Organization, FeatureConfig, Warehouse } from '../../types';

interface OrganizationState {
  current: Organization | null;
  warehouses: Warehouse[];
  loading: boolean;
  error: string | null;
}

const initialState: OrganizationState = {
  current: null,
  warehouses: [],
  loading: false,
  error: null,
};

const organizationSlice = createSlice({
  name: 'organization',
  initialState,
  reducers: {
    setOrganization: (state, action: PayloadAction<Organization>) => {
      state.current = action.payload;
      state.error = null;
    },
    setWarehouses: (state, action: PayloadAction<Warehouse[]>) => {
      state.warehouses = action.payload;
    },
    updateFeature: (state, action: PayloadAction<{ feature: string; config: FeatureConfig }>) => {
      if (state.current) {
        state.current.features[action.payload.feature] = action.payload.config;
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setOrganization,
  setWarehouses,
  updateFeature,
  setLoading,
  setError,
  clearError,
} = organizationSlice.actions;

export default organizationSlice.reducer;

// Selectors
export const selectOrganization = (state: { organization: OrganizationState }) => state.organization.current;
export const selectWarehouses = (state: { organization: OrganizationState }) => state.organization.warehouses;
export const selectOrganizationLoading = (state: { organization: OrganizationState }) => state.organization.loading;

// Feature selectors
export const selectFeature = (feature: string) => (state: { organization: OrganizationState }) => {
  return state.organization.current?.features[feature];
};

export const isFeatureEnabled = (feature: string) => (state: { organization: OrganizationState }) => {
  return state.organization.current?.features[feature]?.enabled || false;
};