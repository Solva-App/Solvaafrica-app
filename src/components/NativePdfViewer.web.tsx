import React from 'react';
import { View, Text } from 'react-native';

export default function NativePdfViewer({ 
  uri, 
  style 
}: { 
  uri: string, 
  style?: any 
}) {
  return (
    <View style={style}>
      <Text>PDF Viewer not supported natively on web.</Text>
    </View>
  );
}
