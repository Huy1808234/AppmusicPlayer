// utils/playTrack.ts
import TrackPlayer, { Track } from 'react-native-track-player';
import { setupPlayer } from '../services/setupPlayer';

export const playTrack = async (
  track: Track,
  trackList: Track[],
  setCurrentTrack?: (track: Track) => void
) => {
  try {
    await setupPlayer();
    await TrackPlayer.reset();

    await TrackPlayer.add(trackList);
    const index = trackList.findIndex(t => t.id === track.id);
    if (index !== -1) {
      await TrackPlayer.skip(index);
      await TrackPlayer.play();
    }

    if (setCurrentTrack) setCurrentTrack(track);
  } catch (error) {
    console.error('❌ Lỗi playTrack:', error);
  }
};
