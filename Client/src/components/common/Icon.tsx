import React from 'react';
import Svg, { Path, Circle, Rect, G } from 'react-native-svg';

export type IconName =
  | 'academic'
  | 'sun'
  | 'moon'
  | 'shield'
  | 'user'
  | 'users'
  | 'calendar'
  | 'plus'
  | 'analytics'
  | 'clipboard'
  | 'refresh'
  | 'check'
  | 'chevron-down'
  | 'chevron-up'
  | 'clock'
  | 'arrow-left'
  | 'arrow-right'
  | 'lock'
  | 'mail'
  | 'alert'
  | 'logout'
  | 'google';

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = 20,
  color = '#6366F1',
  strokeWidth = 2,
}) => {
  if (name === 'google') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Path
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          fill="#4285F4"
        />
        <Path
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          fill="#34A853"
        />
        <Path
          d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.62z"
          fill="#FBBC05"
        />
        <Path
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          fill="#EA4335"
        />
      </Svg>
    );
  }

  const commonProps = {
    stroke: color,
    strokeWidth: strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    fill: 'none',
  };

  switch (name) {
    case 'academic':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" {...commonProps}>
          <Path d="M22 10v6M2 10l10-5 10 5-10 5z" />
          <Path d="M6 12v5c3 3 9 3 12 0v-5" />
        </Svg>
      );

    case 'sun':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" {...commonProps}>
          <Circle cx="12" cy="12" r="5" />
          <Path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </Svg>
      );

    case 'moon':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" {...commonProps}>
          <Path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
        </Svg>
      );

    case 'shield':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" {...commonProps}>
          <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </Svg>
      );

    case 'user':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" {...commonProps}>
          <Path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
          <Circle cx="12" cy="7" r="4" />
        </Svg>
      );

    case 'users':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" {...commonProps}>
          <Path d="M17 21v-2a4 4 0 00-3-3.87M9 21v-2a4 4 0 014-4h1" />
          <Circle cx="9" cy="7" r="4" />
          <Path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
        </Svg>
      );

    case 'calendar':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" {...commonProps}>
          <Rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <Path d="M16 2v4M8 2v4M3 10h18" />
        </Svg>
      );

    case 'plus':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" {...commonProps}>
          <Path d="M12 5v14M5 12h14" />
        </Svg>
      );

    case 'analytics':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" {...commonProps}>
          <Path d="M18 20V10M12 20V4M6 20v-6" />
        </Svg>
      );

    case 'clipboard':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" {...commonProps}>
          <Path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" />
          <Rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
        </Svg>
      );

    case 'refresh':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" {...commonProps}>
          <Path d="M23 4v6h-6M1 20v-6h6" />
          <Path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
        </Svg>
      );

    case 'check':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" {...commonProps}>
          <Path d="M20 6L9 17l-5-5" />
        </Svg>
      );

    case 'chevron-down':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" {...commonProps}>
          <Path d="M6 9l6 6 6-6" />
        </Svg>
      );

    case 'chevron-up':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" {...commonProps}>
          <Path d="M18 15l-6-6-6 6" />
        </Svg>
      );

    case 'clock':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" {...commonProps}>
          <Circle cx="12" cy="12" r="10" />
          <Path d="M12 6v6l4 2" />
        </Svg>
      );

    case 'arrow-left':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" {...commonProps}>
          <Path d="M19 12H5M12 19l-7-7 7-7" />
        </Svg>
      );

    case 'arrow-right':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" {...commonProps}>
          <Path d="M5 12h14M12 5l7 7-7 7" />
        </Svg>
      );

    case 'lock':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" {...commonProps}>
          <Rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <Path d="M7 11V7a5 5 0 0110 0v4" />
        </Svg>
      );

    case 'mail':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" {...commonProps}>
          <Path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <Path d="M22 6l-10 7L2 6" />
        </Svg>
      );

    case 'alert':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" {...commonProps}>
          <Path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01" />
        </Svg>
      );

    case 'logout':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" {...commonProps}>
          <Path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
        </Svg>
      );

    default:
      return null;
  }
};
