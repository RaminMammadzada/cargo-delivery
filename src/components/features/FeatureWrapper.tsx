import React from 'react';
import { useOrganization } from '../../hooks/useOrganization';

interface FeatureWrapperProps {
  feature: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showFallback?: boolean;
}

const FeatureWrapper: React.FC<FeatureWrapperProps> = ({
  feature,
  children,
  fallback = null,
  showFallback = false,
}) => {
  const { isFeatureActive } = useOrganization();
  const isEnabled = isFeatureActive(feature);

  if (!isEnabled) {
    if (showFallback && fallback) {
      return <>{fallback}</>;
    }
    return null;
  }

  return <>{children}</>;
};

export default FeatureWrapper;