// index.js
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import TrackPlayer from 'react-native-track-player';
import trackPlayerService from './src/services/track-player-service'; // JS file dùng để lắng sự kiện nền (như remote control)

console.log('✅ [index.js] Khởi động app...');

// Đăng ký background service - KẾT NỐI VỚI FILE track-player-service.ts
TrackPlayer.registerPlaybackService(() => trackPlayerService);


// Đăng ký component chính của app
AppRegistry.registerComponent(appName, () => {
  console.log('✅ [index.js] AppRegistry.registerComponent thành công');
  return App;
});
