import React from 'react';
import Pdf from 'react-native-pdf';

export default function NativePdfViewer({ 
  uri, 
  style, 
  onLoadingComplete, 
  onError 
}: { 
  uri: string, 
  style?: any, 
  onLoadingComplete?: () => void, 
  onError?: (err: any) => void 
}) {
  return (
    <Pdf
      source={{ uri, cache: true }}
      style={style}
      onLoadComplete={onLoadingComplete}
      onError={onError}
    />
  );
}
