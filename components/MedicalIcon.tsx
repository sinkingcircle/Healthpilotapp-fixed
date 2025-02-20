import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const MedicalIcon = React.memo(() => (
  <View style={styles.container}>
    <Svg width="48" height="48" viewBox="0 0 24 24">
      <Path
        d="m12,12c3.309,0,6-2.691,6-6S15.309,0,12,0s-6,2.691-6,6,2.691,6,6,6Zm0-10c2.206,0,4,1.794,4,4s-1.794,4-4,4-4-1.794-4-4,1.794-4,4-4Zm10,21c0,.553-.447,1-1,1s-1-.447-1-1c0-2.786-1.637-5.198-4-6.324v2.496c1.164.413,2,1.524,2,2.828v1c0,.553-.447,1-1,1s-1-.447-1-1v-1c0-.552-.448-1-1-1s-1,.448-1,1v1c0,.553-.447,1-1,1s-1-.447-1-1v-1c0-1.304.836-2.415,2-2.828v-3.1c-.327-.047-.661-.072-1-.072h-2c-.695,0-1.366.102-2,.292v2.977c.598.346,1,.992,1,1.732,0,1.105-.895,2-2,2s-2-.895-2-2c0-.74.402-1.386,1-1.732v-2.009c-1.812,1.267-3,3.368-3,5.741,0,.553-.447,1-1,1s-1-.447-1-1c0-4.963,4.037-9,9-9h2c4.963,0,9,4.037,9,9Z"
        fill="#2196F3"
      />
    </Svg>
  </View>
));

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
});

export default MedicalIcon;