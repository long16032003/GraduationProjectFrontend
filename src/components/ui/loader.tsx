import React from 'react';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { cn } from '@/lib/utils';

interface LoaderProps {
  /**
   * The size of the loader
   * @default "default"
   */
  size?: 'small' | 'default' | 'large';
  
  /**
   * The type of loader animation
   * @default "spinner"
   */
  type?: 'spinner' | 'dots' | 'pulse' | 'wave';
  
  /**
   * Custom text to display below the loader
   */
  text?: string;
  
  /**
   * Whether to show the loader in fullscreen mode
   * @default false
   */
  fullscreen?: boolean;
  
  /**
   * Whether to show a semi-transparent overlay behind the loader
   * @default false
   */
  overlay?: boolean;
  
  /**
   * Custom color for the loader
   */
  color?: string;
  
  /**
   * Additional CSS class names
   */
  className?: string;
}

/**
 * A versatile loader component with multiple animation styles and customization options
 */
export function Loader({
  size = 'default',
  type = 'spinner',
  text,
  fullscreen = false,
  overlay = false,
  color,
  className,
  ...props
}: LoaderProps) {
  // Size mappings
  const sizeMap = {
    small: 'text-sm h-4 w-4',
    default: 'text-base h-8 w-8',
    large: 'text-lg h-12 w-12',
  };
  
  // Spinner icon with custom size
  const spinnerIcon = (
    <LoadingOutlined
      style={{ fontSize: size === 'small' ? 16 : size === 'large' ? 32 : 24, color }}
      spin
    />
  );
  
  // Dots animation
  const dotsLoader = (
    <div className={cn('flex space-x-1', sizeMap[size])}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            'animate-loader-dots rounded-full',
            size === 'small' ? 'h-1 w-1' : size === 'large' ? 'h-3 w-3' : 'h-2 w-2'
          )}
          style={{
            backgroundColor: color || 'currentColor',
            animationDelay: `${i * 0.15}s`,
          }}
        />
      ))}
    </div>
  );
  
  // Pulse animation
  const pulseLoader = (
    <div
      className={cn(
        'animate-pulse rounded-full',
        sizeMap[size]
      )}
      style={{ backgroundColor: color || 'currentColor' }}
    />
  );
  
  // Wave animation
  const waveLoader = (
    <div className={cn('flex items-end space-x-1', sizeMap[size])}>
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className={cn(
            'animate-loader-wave',
            size === 'small' ? 'h-2 w-1' : size === 'large' ? 'h-8 w-2' : 'h-5 w-1.5'
          )}
          style={{
            backgroundColor: color || 'currentColor',
            animationDelay: `${i * 0.1}s`,
          }}
        />
      ))}
    </div>
  );
  
  // Determine which loader to use based on type
  const renderLoader = () => {
    switch (type) {
      case 'dots':
        return dotsLoader;
      case 'pulse':
        return pulseLoader;
      case 'wave':
        return waveLoader;
      case 'spinner':
      default:
        return <Spin indicator={spinnerIcon} />;
    }
  };
  
  // Container classes
  const containerClasses = cn(
    'flex flex-col items-center justify-center',
    fullscreen && 'fixed inset-0 z-50',
    overlay && 'bg-background/80 backdrop-blur-sm',
    className
  );
  
  return (
    <div className={containerClasses} {...props}>
      {renderLoader()}
      {text && (
        <p
          className={cn(
            'mt-2 text-center text-muted-foreground',
            size === 'small' ? 'text-xs' : size === 'large' ? 'text-base' : 'text-sm'
          )}
        >
          {text}
        </p>
      )}
    </div>
  );
}

/**
 * A fullscreen loader with overlay for page transitions
 */
export function PageLoader({ text = 'Đang tải...', ...props }: Omit<LoaderProps, 'fullscreen' | 'overlay'>) {
  return (
    <Loader
      fullscreen
      overlay
      text={text}
      size="large"
      type="spinner"
      className="bg-background/80"
      {...props}
    />
  );
}

/**
 * A content loader for sections of a page
 */
export function ContentLoader({ text, ...props }: Omit<LoaderProps, 'fullscreen' | 'overlay'>) {
  return (
    <div className="flex h-[200px] w-full items-center justify-center">
      <Loader text={text} {...props} />
    </div>
  );
}

/**
 * A small inline loader
 */
export function InlineLoader({ ...props }: Omit<LoaderProps, 'size' | 'text' | 'fullscreen' | 'overlay'>) {
  return <Loader size="small" {...props} />;
}

export default PageLoader;
