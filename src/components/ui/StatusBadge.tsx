import React from 'react';
import Badge from './Badge';
import { OrderStatus, PackageStatus, PaymentStatus } from '../../types';

interface StatusBadgeProps {
  status: OrderStatus | PackageStatus | PaymentStatus;
  type: 'order' | 'package' | 'payment';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type }) => {
  const getStatusConfig = () => {
    if (type === 'order') {
      switch (status as OrderStatus) {
        case OrderStatus.PENDING:
          return { variant: 'warning' as const, label: 'Pending' };
        case OrderStatus.PAYMENT_CONFIRMED:
          return { variant: 'info' as const, label: 'Payment Confirmed' };
        case OrderStatus.PURCHASED:
          return { variant: 'info' as const, label: 'Purchased' };
        case OrderStatus.SHIPPED_TO_WAREHOUSE:
          return { variant: 'info' as const, label: 'Shipped to Warehouse' };
        case OrderStatus.IN_WAREHOUSE:
          return { variant: 'info' as const, label: 'In Warehouse' };
        case OrderStatus.CUSTOMS_CLEARANCE:
          return { variant: 'warning' as const, label: 'Customs Clearance' };
        case OrderStatus.LOCAL_DELIVERY:
          return { variant: 'info' as const, label: 'Local Delivery' };
        case OrderStatus.DELIVERED:
          return { variant: 'success' as const, label: 'Delivered' };
        case OrderStatus.CANCELLED:
          return { variant: 'error' as const, label: 'Cancelled' };
        case OrderStatus.REFUNDED:
          return { variant: 'secondary' as const, label: 'Refunded' };
        default:
          return { variant: 'default' as const, label: status };
      }
    }

    if (type === 'package') {
      switch (status as PackageStatus) {
        case PackageStatus.PENDING:
          return { variant: 'warning' as const, label: 'Pending' };
        case PackageStatus.IN_TRANSIT_TO_WAREHOUSE:
          return { variant: 'info' as const, label: 'In Transit to Warehouse' };
        case PackageStatus.ARRIVED_AT_WAREHOUSE:
          return { variant: 'info' as const, label: 'Arrived at Warehouse' };
        case PackageStatus.PROCESSING:
          return { variant: 'warning' as const, label: 'Processing' };
        case PackageStatus.READY_FOR_DISPATCH:
          return { variant: 'info' as const, label: 'Ready for Dispatch' };
        case PackageStatus.IN_TRANSIT_TO_CUSTOMER:
          return { variant: 'info' as const, label: 'In Transit to Customer' };
        case PackageStatus.OUT_FOR_DELIVERY:
          return { variant: 'info' as const, label: 'Out for Delivery' };
        case PackageStatus.DELIVERED:
          return { variant: 'success' as const, label: 'Delivered' };
        case PackageStatus.RETURNED:
          return { variant: 'warning' as const, label: 'Returned' };
        case PackageStatus.DAMAGED:
          return { variant: 'error' as const, label: 'Damaged' };
        case PackageStatus.LOST:
          return { variant: 'error' as const, label: 'Lost' };
        default:
          return { variant: 'default' as const, label: status };
      }
    }

    if (type === 'payment') {
      switch (status as PaymentStatus) {
        case PaymentStatus.PENDING:
          return { variant: 'warning' as const, label: 'Pending' };
        case PaymentStatus.PROCESSING:
          return { variant: 'info' as const, label: 'Processing' };
        case PaymentStatus.COMPLETED:
          return { variant: 'success' as const, label: 'Completed' };
        case PaymentStatus.FAILED:
          return { variant: 'error' as const, label: 'Failed' };
        case PaymentStatus.REFUNDED:
          return { variant: 'secondary' as const, label: 'Refunded' };
        default:
          return { variant: 'default' as const, label: status };
      }
    }

    return { variant: 'default' as const, label: status };
  };

  const { variant, label } = getStatusConfig();

  return <Badge variant={variant}>{label}</Badge>;
};

export default StatusBadge;