import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const FileIcon = React.memo(() => (
  <View style={styles.container}>
    <Svg width="48" height="48" viewBox="0 0 24 24">
      <Path
        d="m14,7V.46c.913.346,1.753.879,2.465,1.59l3.484,3.486c.712.711,1.245,1.551,1.591,2.464h-6.54c-.552,0-1-.449-1-1Zm7.976,3h-6.976c-1.654,0-3-1.346-3-3V.024c-.161-.011-.322-.024-.485-.024h-4.515C4.243,0,2,2.243,2,5v9h3.965l1.703-2.555c.197-.296.542-.473.894-.443.356.022.673.232.833.551l2.229,4.459,1.044-1.566c.186-.278.498-.445.832-.445h4.5c.552,0,1,.448,1,1s-.448,1-1,1h-3.965l-1.703,2.555c-.186.279-.499.445-.832.445-.021,0-.042,0-.062-.002-.356-.022-.673-.232-.833-.551l-2.229-4.459-1.044,1.566c-.186.278-.498.445-.832.445H2v3c0,2.757,2.243,5,5,5h10c2.757,0,5-2.243,5-5v-8.515c0-.163-.013-.324-.024-.485Z"
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

export default FileIcon;