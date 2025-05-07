import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Track } from 'react-native-track-player';
import { TrackListItem } from '../components/TrackListItem';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useCurrentTrack } from '../context/CurrentTrackContext';
import { setupPlayer } from '../services/setupPlayer';
import { playTrack } from '../utils/playTrack';
import { unknownTrackImageUri } from '../constants/images';
import { useAppThemeStyles } from '../hooks/useAppThemeStyles';

type RouteParams = {
  artist: string;
  artwork: string | null;
};

export default function ArtistDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { setCurrentTrack } = useCurrentTrack();
  const { artist, artwork } = route.params as RouteParams;
  const { colors } = useAppThemeStyles();

  const [songs, setSongs] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalViews, setTotalViews] = useState(0);
  const [totalLikes, setTotalLikes] = useState(0);
  const [playlistCount, setPlaylistCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    const init = async () => {
      await setupPlayer();
      await fetchSongs();
      await checkIfFollowing();
    };
    init();
  }, [artist]);

  const fetchSongs = async () => {
    try {
      const snapshot = await firestore()
        .collection('tracks')
        .where('artist', '==', artist)
        .get();

      let viewsSum = 0;
      let likesSum = 0;
      const trackIds: string[] = [];

      const result: Track[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        viewsSum += data.views || 0;
        likesSum += data.likes || 0;
        trackIds.push(doc.id);
        return {
          id: data.id || doc.id,
          title: data.title || 'Unknown Title',
          artist: data.artist || 'Unknown Artist',
          url: data.url,
          artwork: typeof data.artwork === 'string' && data.artwork.trim() !== '' ? data.artwork : unknownTrackImageUri,
          views: data.views || 0,
        };
      });

      setSongs(result);
      setTotalViews(viewsSum);
      setTotalLikes(likesSum);

      const playlistSnapshot = await firestore()
        .collection('playlists')
        .where('tracks', 'array-contains-any', trackIds)
        .get();

      setPlaylistCount(playlistSnapshot.size);
    } catch (error) {
      console.error(' Firestore error:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkIfFollowing = async () => {
    const userId = auth().currentUser?.uid;
    if (!userId) return;

    try {
      const doc = await firestore().collection('artist_followers').doc(artist).get();
      if (doc.exists) {
        const followers = doc.data()?.followers || [];
        setIsFollowing(followers.includes(userId));
      }
    } catch (err) {
      console.error(' Error checking follow:', err);
    }
  };

  const handleToggleFollow = async () => {
    const userId = auth().currentUser?.uid;
    if (!userId) return;

    const docRef = firestore().collection('artist_followers').doc(artist);

    try {
      const doc = await docRef.get();

      if (doc.exists) {
        const followers = doc.data()?.followers || [];

        if (isFollowing) {
          await docRef.update({
            followers: followers.filter((id: string) => id !== userId),
          });
        } else {
          await docRef.update({
            followers: firestore.FieldValue.arrayUnion(userId),
          });
        }
      } else {
        await docRef.set({
          artist: artist,
          followers: [userId],
        });
      }

      setIsFollowing(!isFollowing);
    } catch (err) {
      console.error(' Error updating follow:', err);
    }
  };

  const handleTrackPress = async (track: Track) => {
    try {
      await firestore().collection('tracks').doc(track.id).update({
        views: firestore.FieldValue.increment(1),
      });
      await playTrack(track, songs, setCurrentTrack);
    } catch (err) {
      console.log(' Error playing track:', err);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Image
          source={typeof artwork === 'string' && artwork.trim() !== '' ? { uri: artwork } : unknownTrackImageUri}
          style={styles.artistImage}
        />

        <View style={styles.actionButtons}>
          <TouchableOpacity onPress={handleToggleFollow} style={[styles.followButton, { borderColor: isFollowing ? '#1DB954' : colors.subtext }]}>
            <Text style={[styles.buttonText, { color: colors.text }]}>{isFollowing ? 'Đã theo dõi' : 'Theo dõi'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: colors.text }]}>{playlistCount}</Text>
            <Text style={[styles.statLabel, { color: colors.subtext }]}>PLAYLISTS</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: colors.text }]}>{totalViews}</Text>
            <Text style={[styles.statLabel, { color: colors.subtext }]}>VIEWS</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: colors.text }]}>{totalLikes}</Text>
            <Text style={[styles.statLabel, { color: colors.subtext }]}>LIKES</Text>
          </View>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#1DB954" style={{ marginTop: 32 }} />
      ) : songs.length === 0 ? (
        <Text style={[styles.noSongsText, { color: colors.subtext }]}>Không có bài hát nào cho nghệ sĩ này.</Text>
      ) : (
        <>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Bài hát</Text>
          <FlatList
            data={songs}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <TrackListItem track={item} onPress={() => handleTrackPress(item)} />
            )}
            contentContainerStyle={styles.listContent}
            style={{ flex: 1 }}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 20,
    position: 'relative',
    borderBottomWidth: 1,
  },
  backButton: {
    position: 'absolute',
    left: 16,
    top: 40,
    zIndex: 10,
  },
  artistImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 12,
  },
  followButton: {
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginHorizontal: 6,
  },
  buttonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 16,
  },
  statBox: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  noSongsText: {
    textAlign: 'center',
    marginTop: 32,
    fontSize: 16,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
});