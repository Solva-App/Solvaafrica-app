// Web stub for lottie-react-native.
// lottie-react-native uses @lottiefiles/dotlottie-react on web which crashes
// when the canvas is rendered with zero width. This stub replaces it on web
// with a lightweight no-op View so screens that use LottieView still render.

import React from 'react';
import { View } from 'react-native';

const LottieView = React.forwardRef((_props: any, _ref: any) => {
  // Render an invisible placeholder with the same dimensions the caller passes.
  const { style, width, height } = _props;
  return <View style={[{ width, height }, style]} />;
});

LottieView.displayName = 'LottieViewWebStub';

export default LottieView;
