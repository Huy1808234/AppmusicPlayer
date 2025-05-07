// global.d.ts
import 'react-native-track-player';

declare module 'react-native-track-player' {
  interface TrackPlayerStatic {
    setShuffleModeEnabled(enabled: boolean): Promise<void>;
  }
}
