import { requireNativeView } from 'expo';
import * as React from 'react';

import { ExpoAppleMusicViewProps } from './ExpoAppleMusic.types';

const NativeView: React.ComponentType<ExpoAppleMusicViewProps> =
  requireNativeView('ExpoAppleMusic');

export default function ExpoAppleMusicView(props: ExpoAppleMusicViewProps) {
  return <NativeView {...props} />;
}
