import React from 'react';
import { View, StyleSheet, Text } from 'react-native';

export type IconName =
  | 'academic'
  | 'sun'
  | 'moon'
  | 'shield'
  | 'user'
  | 'faculty'
  | 'calendar'
  | 'plus'
  | 'users'
  | 'analytics'
  | 'clipboard'
  | 'refresh'
  | 'check'
  | 'chevron-down'
  | 'clock'
  | 'star';

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
}

export const Icon: React.FC<IconProps> = ({ name, size = 20, color = '#6366F1' }) => {
  const half = size / 2;

  switch (name) {
    case 'academic':
      return (
        <View style={[styles.center, { width: size, height: size }]}>
          {/* Cap roof diamond */}
          <View
            style={{
              width: size * 0.75,
              height: size * 0.75,
              borderWidth: 2,
              borderColor: color,
              transform: [{ rotate: '45deg' }],
              borderRadius: 2,
            }}
          />
          {/* Base strip */}
          <View
            style={{
              position: 'absolute',
              bottom: size * 0.15,
              width: size * 0.5,
              height: size * 0.25,
              borderBottomWidth: 2,
              borderLeftWidth: 2,
              borderRightWidth: 2,
              borderColor: color,
              borderBottomLeftRadius: 4,
              borderBottomRightRadius: 4,
            }}
          />
        </View>
      );

    case 'sun':
      return (
        <View style={[styles.center, { width: size, height: size }]}>
          <View
            style={{
              width: size * 0.5,
              height: size * 0.5,
              borderRadius: size * 0.25,
              borderWidth: 2,
              borderColor: color,
              backgroundColor: color,
            }}
          />
        </View>
      );

    case 'moon':
      return (
        <View style={[styles.center, { width: size, height: size }]}>
          <View
            style={{
              width: size * 0.65,
              height: size * 0.65,
              borderRadius: size * 0.35,
              borderWidth: 2.5,
              borderColor: color,
              borderRightColor: 'transparent',
              transform: [{ rotate: '-35deg' }],
            }}
          />
        </View>
      );

    case 'shield':
      return (
        <View style={[styles.center, { width: size, height: size }]}>
          <View
            style={{
              width: size * 0.7,
              height: size * 0.75,
              borderWidth: 2,
              borderColor: color,
              borderTopLeftRadius: size * 0.2,
              borderTopRightRadius: size * 0.2,
              borderBottomLeftRadius: size * 0.35,
              borderBottomRightRadius: size * 0.35,
            }}
          />
        </View>
      );

    case 'user':
    case 'faculty':
      return (
        <View style={[styles.center, { width: size, height: size }]}>
          {/* Head */}
          <View
            style={{
              width: size * 0.38,
              height: size * 0.38,
              borderRadius: size * 0.19,
              borderWidth: 2,
              borderColor: color,
              marginBottom: 1,
            }}
          />
          {/* Body shoulders */}
          <View
            style={{
              width: size * 0.75,
              height: size * 0.3,
              borderTopLeftRadius: size * 0.35,
              borderTopRightRadius: size * 0.35,
              borderWidth: 2,
              borderColor: color,
            }}
          />
        </View>
      );

    case 'calendar':
      return (
        <View style={[styles.center, { width: size, height: size }]}>
          <View
            style={{
              width: size * 0.75,
              height: size * 0.75,
              borderRadius: 4,
              borderWidth: 2,
              borderColor: color,
            }}
          >
            {/* Header bar */}
            <View style={{ width: '100%', height: size * 0.2, backgroundColor: color }} />
            {/* Grid dots */}
            <View style={{ flex: 1, flexDirection: 'row', flexWrap: 'wrap', padding: 2, gap: 2 }}>
              <View style={{ width: 3, height: 3, backgroundColor: color, borderRadius: 1.5 }} />
              <View style={{ width: 3, height: 3, backgroundColor: color, borderRadius: 1.5 }} />
              <View style={{ width: 3, height: 3, backgroundColor: color, borderRadius: 1.5 }} />
            </View>
          </View>
        </View>
      );

    case 'plus':
      return (
        <View style={[styles.center, { width: size, height: size }]}>
          <View
            style={{
              position: 'absolute',
              width: size * 0.65,
              height: 2.5,
              backgroundColor: color,
              borderRadius: 2,
            }}
          />
          <View
            style={{
              position: 'absolute',
              width: 2.5,
              height: size * 0.65,
              backgroundColor: color,
              borderRadius: 2,
            }}
          />
        </View>
      );

    case 'users':
      return (
        <View style={[styles.center, { width: size, height: size }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View
              style={{
                width: size * 0.45,
                height: size * 0.45,
                borderRadius: size * 0.225,
                borderWidth: 2,
                borderColor: color,
                marginRight: -4,
              }}
            />
            <View
              style={{
                width: size * 0.55,
                height: size * 0.55,
                borderRadius: size * 0.275,
                borderWidth: 2,
                borderColor: color,
                backgroundColor: color + '22',
              }}
            />
          </View>
        </View>
      );

    case 'analytics':
      return (
        <View style={[styles.center, { width: size, height: size }]}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 2.5, height: size * 0.65 }}>
            <View style={{ width: size * 0.15, height: '40%', backgroundColor: color, borderRadius: 1 }} />
            <View style={{ width: size * 0.15, height: '100%', backgroundColor: color, borderRadius: 1 }} />
            <View style={{ width: size * 0.15, height: '70%', backgroundColor: color, borderRadius: 1 }} />
          </View>
        </View>
      );

    case 'clipboard':
      return (
        <View style={[styles.center, { width: size, height: size }]}>
          <View
            style={{
              width: size * 0.65,
              height: size * 0.75,
              borderRadius: 4,
              borderWidth: 2,
              borderColor: color,
              alignItems: 'center',
            }}
          >
            <View
              style={{
                width: size * 0.35,
                height: 4,
                backgroundColor: color,
                borderBottomLeftRadius: 2,
                borderBottomRightRadius: 2,
              }}
            />
          </View>
        </View>
      );

    case 'refresh':
      return (
        <View style={[styles.center, { width: size, height: size }]}>
          <View
            style={{
              width: size * 0.65,
              height: size * 0.65,
              borderRadius: size * 0.325,
              borderWidth: 2,
              borderColor: color,
              borderTopColor: 'transparent',
              transform: [{ rotate: '45deg' }],
            }}
          />
        </View>
      );

    case 'check':
      return (
        <View style={[styles.center, { width: size, height: size }]}>
          <View
            style={{
              width: size * 0.4,
              height: size * 0.25,
              borderLeftWidth: 2.5,
              borderBottomWidth: 2.5,
              borderColor: color,
              transform: [{ rotate: '-45deg' }],
              marginTop: -2,
            }}
          />
        </View>
      );

    case 'chevron-down':
      return (
        <View style={[styles.center, { width: size, height: size }]}>
          <View
            style={{
              width: size * 0.35,
              height: size * 0.35,
              borderRightWidth: 2,
              borderBottomWidth: 2,
              borderColor: color,
              transform: [{ rotate: '45deg' }],
              marginTop: -size * 0.15,
            }}
          />
        </View>
      );

    case 'clock':
      return (
        <View style={[styles.center, { width: size, height: size }]}>
          <View
            style={{
              width: size * 0.7,
              height: size * 0.7,
              borderRadius: size * 0.35,
              borderWidth: 2,
              borderColor: color,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <View
              style={{
                width: 2,
                height: size * 0.25,
                backgroundColor: color,
                position: 'absolute',
                top: size * 0.1,
              }}
            />
            <View
              style={{
                height: 2,
                width: size * 0.2,
                backgroundColor: color,
                position: 'absolute',
                right: size * 0.12,
              }}
            />
          </View>
        </View>
      );

    case 'star':
      return (
        <View style={[styles.center, { width: size, height: size }]}>
          <View
            style={{
              width: size * 0.5,
              height: size * 0.5,
              backgroundColor: color,
              transform: [{ rotate: '45deg' }],
              borderRadius: 2,
            }}
          />
        </View>
      );

    default:
      return null;
  }
};

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
