import TrackPlayer, { Capability, RepeatMode } from 'react-native-track-player';


let hasSetup = false;

export async function setupPlayer() {
  if (hasSetup) {
    console.log(' setupPlayer: đã setup rồi, bỏ qua');
    return true;
  }

  try {
    console.log(' setupPlayer: bắt đầu TrackPlayer.setupPlayer()');
    await TrackPlayer.setupPlayer();

    await TrackPlayer.updateOptions({
      capabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
        Capability.Stop,
      ],
    });
    await TrackPlayer.setRepeatMode(RepeatMode.Off);
      
    hasSetup = true;
    console.log(' setupPlayer: thành công');
    return true;
  } catch (error: any) {
    if (error?.message?.includes('already been initialized')) {
      console.warn(' setupPlayer: đã được khởi tạo trước đó');
      hasSetup = true;
      return true;
    }

    console.error(' setupPlayer: Lỗi không thể setup TrackPlayer:', error);
    return false;
  }
}
