import React, { useCallback } from 'react';
import { cn } from '@/lib/utils';

interface VirtualizedListProps<T> {
  items: T[];
  itemHeight?: number;
  height?: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  onScroll?: (scrollInfo: { scrollOffset: number; scrollDirection: 'forward' | 'backward' }) => void;
}

export default function VirtualizedList<T>({
  items,
  renderItem,
  className = '',
  itemHeight,
  height,
  onScroll
}: VirtualizedListProps<T>) {
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    if (onScroll) {
      const element = e.currentTarget;
      const scrollOffset = element.scrollTop;
      const lastScrollOffset = parseFloat(element.dataset.lastScrollOffset || '0');
      const scrollDirection = scrollOffset > lastScrollOffset ? 'forward' : 'backward';
      element.dataset.lastScrollOffset = scrollOffset.toString();
      onScroll({ scrollOffset, scrollDirection });
    }
  }, [onScroll]);

  if (items.length === 0) {
    return (
      <div className={cn('flex items-center justify-center h-full text-muted-foreground', className)}>
        No items to display
      </div>
    );
  }

  return (
    <div 
      className={cn('border border-border rounded-lg overflow-auto', className)}
      style={{ height: height || '400px' }}
      onScroll={handleScroll}
    >
      <div className="divide-y divide-border/50">
        {items.map((item, index) => (
          <div key={index} style={{ minHeight: itemHeight || 'auto' }}>
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
}
