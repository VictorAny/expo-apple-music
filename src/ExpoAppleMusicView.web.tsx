import * as React from 'react';

import { ExpoAppleMusicViewProps } from './ExpoAppleMusic.types';

export default function ExpoAppleMusicView(props: ExpoAppleMusicViewProps) {
  return (
    <div>
      <iframe
        style={{ flex: 1 }}
        src={props.url}
        onLoad={() => props.onLoad({ nativeEvent: { url: props.url } })}
      />
    </div>
  );
}
