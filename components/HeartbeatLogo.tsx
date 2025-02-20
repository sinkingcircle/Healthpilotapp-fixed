import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const LogoHeartbeat = React.memo(() => (
  <Svg viewBox="0 0 100 40" style={styles.svg}>
    <Path
      d="M5 20 L15 20 L20 10 L35 40 L45 0 L60 30 L65 25 L80 25"
      stroke="#2196F3"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </Svg>
));

export default function HeartbeatLogo() {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <LogoHeartbeat />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 240,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  iconContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  svg: {
    width: '100%',
    height: '100%',
  }
});