import React from 'react';
import { cn } from '@/lib/utils';

interface SkipLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

const SkipLink: React.FC<SkipLinkProps> = ({ href, children, className = '' }) => {
  return (
    <a
      href={href}
      className={cn(
        'absolute top-0 left-0 -translate-y-full focus:translate-y-0',
        'bg-primary text-primary-foreground px-4 py-2 rounded-md',
        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        'z-50 transition-transform duration-200',
        className
      )}
    >
      {children}
    </a>
  );
};

export default SkipLink;
