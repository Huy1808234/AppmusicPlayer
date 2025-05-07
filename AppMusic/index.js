import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import TrackPlayer from 'react-native-track-player';

// Đăng ký service phát nhạc
TrackPlayer.registerPlaybackService(() => require('./src/services/track-player-service')); // ví dụ


AppRegistry.registerComponent(appName, () => App);
