// ✅ src/components/MiniPlayer.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import TrackPlayer, {
  usePlaybackState,
  State,
  Event,
  Track,
} from 'react-native-track-player';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCurrentTrack } from '../context/CurrentTrackContext';
import { RootStackParamList } from '../navigation/types';

export default function MiniPlayer() {
  const { currentTrack, setCurrentTrack } = useCurrentTrack();
  const playbackState = usePlaybackState();
  const [isPlaying, setIsPlaying] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    setIsPlaying(playbackState?.state === State.Playing);
  }, [playbackState]);

  // ✅ Listen to track changes and update currentTrack
  useEffect(() => {
    const sub = TrackPlayer.addEventListener(Event.PlaybackTrackChanged, async (event) => {
      if (event.nextTrack != null) {
        const nextTrack = await TrackPlayer.getTrack(event.nextTrack);
        if (nextTrack && nextTrack.id !== currentTrack?.id) {
          setCurrentTrack(nextTrack);
        }
      }
    });
    return () => sub.remove();
  }, [currentTrack]);

  if (!currentTrack) return null;

  const togglePlayback = async () => {
    const state = await TrackPlayer.getState();
    if (state === State.Playing) {
      await TrackPlayer.pause();
    } else {
      await TrackPlayer.play();
    }
  };

  const skipToNext = async () => {
    try {
      const queue = await TrackPlayer.getQueue();
      console.log('🎧 Queue:', queue);
      await TrackPlayer.skipToNext();
    } catch (err) {
      console.warn('⚠️ Không có bài tiếp theo:', err);
    }
  };

  const openPlayer = () => {
    navigation.navigate('PlayerScreen', { track: currentTrack });
  };

  return (
    <TouchableOpacity style={styles.container} onPress={openPlayer} activeOpacity={0.9}>
      {currentTrack.artwork ? (
        <Image source={{ uri: currentTrack.artwork }} style={styles.artwork} />
      ) : (
        <View style={styles.artwork}>
          <Icon name="musical-notes" size={22} color="#ccc" />
        </View>
      )}

      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {currentTrack.title || 'Không có tiêu đề'}
        </Text>
        <Text style={styles.artist} numberOfLines={1}>
          {currentTrack.artist || 'Unknown Artist'}
        </Text>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity onPress={togglePlayback} style={styles.controlButton}>
          <Icon name={isPlaying ? 'pause' : 'play'} size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={skipToNext} style={styles.controlButton}>
          <Icon name="play-skip-forward" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 64,
    backgroundColor: '#1e1e1e',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderColor: '#333',
  },
  artwork: {
    width: 46,
    height: 46,
    borderRadius: 6,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  artist: {
    color: '#bbb',
    fontSize: 12,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  controlButton: {
    paddingLeft: 12,
  },
});

// ✅ DONE!
