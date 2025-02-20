import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const MedicineIcon = React.memo(() => (
  <View style={styles.container}>
    <Svg width="48" height="48" viewBox="0 0 24 24">
      <Path
        d="m19 5h-3v-1a3 3 0 0 0 -3-3h-2a3 3 0 0 0 -3 3v1h-3a5.006 5.006 0 0 0 -5 5v8a5.006 5.006 0 0 0 5 5h14a5.006 5.006 0 0 0 5-5v-8a5.006 5.006 0 0 0 -5-5zm-9-1a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1h-4zm5 11h-2v2a1 1 0 0 1 -2 0v-2h-2a1 1 0 0 1 0-2h2v-2a1 1 0 0 1 2 0v2h2a1 1 0 0 1 0 2z"
        fill="#2196F3"
      />
    </Svg>
  </View>
));

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MedicineIcon;