import React, { forwardRef } from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AccessibleButtonProps extends ButtonProps {
  'aria-label'?: string;
  'aria-describedby'?: string;
  'aria-expanded'?: boolean;
  'aria-pressed'?: boolean;
  'aria-selected'?: boolean;
  role?: string;
  tabIndex?: number;
}

const AccessibleButton = forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  ({ className, children, disabled, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        className={cn(
          'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
        disabled={disabled}
        {...props}
      >
        {children}
      </Button>
    );
  }
);

AccessibleButton.displayName = 'AccessibleButton';

export default AccessibleButton;
