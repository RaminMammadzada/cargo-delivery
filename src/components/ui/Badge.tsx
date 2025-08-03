import React from 'react';
import { clsx } from 'clsx';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', dot = false, children, ...props }, ref) => {
    const baseClasses = 'inline-flex items-center font-medium rounded-full';
    
    const variants = {
      default: 'bg-secondary-100 text-secondary-800',
      success: 'bg-green-100 text-green-800',
      warning: 'bg-yellow-100 text-yellow-800',
      error: 'bg-red-100 text-red-800',
      info: 'bg-blue-100 text-blue-800',
      secondary: 'bg-secondary-100 text-secondary-600',
    };

    const sizes = {
      sm: dot ? 'px-1.5 py-0.5 text-xs' : 'px-2 py-0.5 text-xs',
      md: dot ? 'px-2 py-1 text-sm' : 'px-2.5 py-1 text-sm',
      lg: dot ? 'px-2.5 py-1.5 text-base' : 'px-3 py-1.5 text-base',
    };

    const dotSizes = {
      sm: 'w-1.5 h-1.5',
      md: 'w-2 h-2',
      lg: 'w-2.5 h-2.5',
    };

    return (
      <span
        ref={ref}
        className={clsx(
          baseClasses,
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {dot && (
          <span
            className={clsx(
              'rounded-full mr-1.5',
              dotSizes[size],
              {
                'bg-secondary-400': variant === 'default' || variant === 'secondary',
                'bg-green-400': variant === 'success',
                'bg-yellow-400': variant === 'warning',
                'bg-red-400': variant === 'error',
                'bg-blue-400': variant === 'info',
              }
            )}
          />
        )}
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export default Badge;

export { Badge }