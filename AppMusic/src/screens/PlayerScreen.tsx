// Updated PlayerScreen.tsx with useAppThemeStyles hook
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Share,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import TrackPlayer, { RepeatMode, useProgress } from 'react-native-track-player';
import Icon from 'react-native-vector-icons/Ionicons';
import Slider from '@react-native-community/slider';
import StarRating from 'react-native-star-rating-widget';
import firestore from '@react-native-firebase/firestore';
import { useCurrentTrack } from '../context/CurrentTrackContext';
import { TrackOptionsModal } from '../components/TrackOptionsModal';
import { useAppThemeStyles } from '../hooks/useAppThemeStyles';
import auth from '@react-native-firebase/auth';

export default function PlayerScreen() {
  const { currentTrack } = useCurrentTrack();
  const { position, duration } = useProgress();
  const [isPlaying, setIsPlaying] = useState(true);
  const [repeatMode, setRepeatMode] = useState<'off' | 'track' | 'queue'>('off');
  const [rating, setRating] = useState(0);
  const [likes, setLikes] = useState(0);
  const [views, setViews] = useState(0);
  const [showOptions, setShowOptions] = useState(false);
  const navigation = useNavigation();
  const { colors } = useAppThemeStyles();
  const [likeToast, setLikeToast] = useState(false);

  useEffect(() => {
    if (!currentTrack?.id) return;
    const docRef = firestore().collection('tracks').doc(currentTrack.id);
    docRef.update({ views: firestore.FieldValue.increment(1) });
    const unsubscribe = docRef.onSnapshot((doc) => {
      const data = doc.data();
      if (data?.rating !== undefined) setRating(data.rating);
      if (data?.likes !== undefined) setLikes(data.likes);
      if (data?.views !== undefined) setViews(data.views);
    });
    return () => unsubscribe();
  }, [currentTrack?.id]);

  if (!currentTrack) return null;

  const handlePlayPause = async () => {
    const state = await TrackPlayer.getState();
    if (state === 'playing') {
      await TrackPlayer.pause();
      setIsPlaying(false);
    } else {
      await TrackPlayer.play();
      setIsPlaying(true);
    }
  };

  
  const handleSeek = async (value: number) => {
    await TrackPlayer.seekTo(value);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${currentTrack.title} - ${currentTrack.artist}\n${currentTrack.url}`,
      });
    } catch (err) {
      console.log('Lỗi chia sẻ:', err);
    }
  };

  const toggleRepeat = () => {
    setRepeatMode((prev) => {
      const next = prev === 'off' ? 'track' : prev === 'track' ? 'queue' : 'off';
      TrackPlayer.setRepeatMode(
        next === 'track' ? RepeatMode.Track : next === 'queue' ? RepeatMode.Queue : RepeatMode.Off
      );
      return next;
    });
  };

  const formatTime = (sec: number) => {
    const min = Math.floor(sec / 60);
    const secStr = Math.floor(sec % 60).toString().padStart(2, '0');
    return `${min}:${secStr}`;
  };

  const handleRatingChange = async (value: number) => {
    setRating(value);
    try {
      await firestore().collection('tracks').doc(currentTrack.id).update({ rating: value });
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể lưu đánh giá.');
    }
  };

  const handleLike = async () => {
    try {
      const user = auth().currentUser;
if (!user) return;

const likedRef = firestore()
  .collection('tracks')
  .doc(currentTrack.id)
  .collection('likedBy')
  .doc(user.uid);

  const likedDoc = await likedRef.get();
  if (likedDoc.exists) {
    setLikeToast(true);
    setTimeout(() => setLikeToast(false), 2000); // tự ẩn sau 2s
    return;
  }
  
// Thêm vào danh sách liked và tăng lượt thích
await likedRef.set({ likedAt: firestore.FieldValue.serverTimestamp() });

await firestore()
  .collection('tracks')
  .doc(currentTrack.id)
  .update({
    likes: firestore.FieldValue.increment(1),
  });

    } catch (err) {
      Alert.alert('Lỗi', 'Không thể thích bài hát.');
    }
  };

  const getArtworkSource = () => {
    return currentTrack.artwork
      ? { uri: currentTrack.artwork }
      : require('../../assets/unknown_track.png');
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-down" size={26} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerText, { color: colors.text }]}>Đang phát</Text>
        <TouchableOpacity onPress={() => setShowOptions(true)}>
          <Icon name="ellipsis-vertical" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      <Image source={getArtworkSource()} style={styles.artwork} />

      <View style={styles.info}>
        <View style={styles.infoLeft}>
          <Text style={[styles.title, { color: colors.text }]}>{currentTrack.title || 'Unknown Title'}</Text>
          <Text style={[styles.artist, { color: colors.subtext }]}>{currentTrack.artist || 'Unknown Artist'}</Text>

          <View style={styles.ratingWrapper}>
            <StarRating
              rating={rating}
              onChange={handleRatingChange}
              starSize={22}
              color="gold"
              enableHalfStar={false}
              style={{ alignSelf: 'flex-start' }}
            />
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Icon name="eye-outline" size={16} color={colors.text} style={styles.icon} />
                <Text style={[styles.statText, { color: colors.text }]}>{views}</Text>
              </View>
              <View style={styles.statItem}>
                <Icon name="heart-outline" size={16} color="#ff4d4d" style={styles.icon} />
                <Text style={styles.statText}>{likes}</Text>
              </View>
            </View>
          </View>
        </View>

        <TouchableOpacity onPress={handleLike}>
          <Icon name="heart" size={24} color="#ff4d4d" />
        </TouchableOpacity>
      </View>

      <View style={styles.progress}>
        <Slider
          style={{ width: '100%', height: 40 }}
          minimumValue={0}
          maximumValue={duration}
          value={position}
          onSlidingComplete={handleSeek}
          minimumTrackTintColor={colors.text}
          maximumTrackTintColor="#444"
          thumbTintColor={colors.text}
        />
        <View style={styles.time}>
          <Text style={[styles.timeText, { color: colors.subtext }]}>{formatTime(position)}</Text>
          <Text style={[styles.timeText, { color: colors.subtext }]}>{formatTime(duration)}</Text>
        </View>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity>
          <Icon name="shuffle-outline" size={24} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => TrackPlayer.skipToPrevious()}>
          <Icon name="play-skip-back" size={30} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handlePlayPause}>
          <Icon name={isPlaying ? 'pause-circle' : 'play-circle'} size={64} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => TrackPlayer.skipToNext()}>
          <Icon name="play-skip-forward" size={30} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleRepeat}>
          <Icon
            name={repeatMode !== 'off' ? 'repeat' : 'repeat-outline'}
            size={24}
            color={repeatMode !== 'off' ? '#1DB954' : colors.text}
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
        <Icon name="share-outline" size={18} color={colors.text} />
        <Text style={[styles.shareText, { color: colors.text }]}>Chia sẻ bài hát</Text>
      </TouchableOpacity>

      <TrackOptionsModal visible={showOptions} onClose={() => setShowOptions(false)} track={currentTrack} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flexGrow: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerText: { fontSize: 14 },
  artwork: { width: '100%', height: 320, borderRadius: 16, marginTop: 30 },
  info: { flexDirection: 'row', alignItems: 'center', marginTop: 24 },
  infoLeft: { flex: 1, alignItems: 'flex-start', width: '100%' },
  ratingWrapper: { marginTop: 4, alignItems: 'flex-start', width: '100%' },
  title: { fontSize: 20, fontWeight: 'bold' },
  artist: { fontSize: 14, marginTop: 4 },
  progress: { marginTop: 20 },
  time: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  timeText: { fontSize: 12 },
  controls: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginTop: 30 },
  shareBtn: { flexDirection: 'row', marginTop: 20, justifyContent: 'center', alignItems: 'center', gap: 6 },
  shareText: { fontSize: 14, marginLeft: 6 },
  statsRow: { flexDirection: 'row', marginTop: 6, marginLeft: 3, gap: 12 },
  statItem: { flexDirection: 'row', alignItems: 'center' },
  icon: { marginRight: 4 },
  statText: { fontSize: 12 },
});
