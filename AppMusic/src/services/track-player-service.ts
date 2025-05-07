import TrackPlayer, { Event } from 'react-native-track-player';

module.exports = async function () {
  console.log('✅ [service] TrackPlayer service đã chạy');

  TrackPlayer.addEventListener(Event.RemotePlay, async () => {
    console.log('🎯 [service] RemotePlay được gọi');
    await TrackPlayer.play();
  });

  TrackPlayer.addEventListener(Event.RemotePause, async () => {
    console.log('🎯 [service] RemotePause được gọi');
    await TrackPlayer.pause();
  });

  TrackPlayer.addEventListener(Event.RemoteNext, async () => {
    console.log('⏭️ [service] RemoteNext được gọi');
    try {
      await TrackPlayer.skipToNext();
    } catch (err) {
      console.warn('⚠️ Không thể next bài:', err);
    }
  });

  TrackPlayer.addEventListener(Event.RemotePrevious, async () => {
    console.log('⏮️ [service] RemotePrevious được gọi');
    try {
      await TrackPlayer.skipToPrevious();
    } catch (err) {
      console.warn('⚠️ Không thể prev bài:', err);
    }
  });
};
