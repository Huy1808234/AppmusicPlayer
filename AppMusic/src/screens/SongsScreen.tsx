import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Feather';
import { Track } from 'react-native-track-player';
import { TracksList } from '../components/TrackList';
import { playTrack } from '../utils/playTrack';
import { setupPlayer } from '../services/setupPlayer';
import { useCurrentTrack } from '../context/CurrentTrackContext';
import { unknownTrackImageUri } from '../constants/images';
import { useAppThemeStyles } from '../hooks/useAppThemeStyles';

export default function SongsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { setCurrentTrack } = useCurrentTrack();
  const { colors } = useAppThemeStyles();

  const [tracks, setTracks] = useState<Track[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'last' | 'top' | 'search'>('last');

  useEffect(() => {
    const init = async () => {
      await setupPlayer();
    };
    init();

    const unsubscribe = firestore()
      .collection('tracks')
      .onSnapshot(snapshot => {
        const result: Track[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: data.id || doc.id,
            title: data.title || 'Unknown Title',
            artist: data.artist || 'Unknown Artist',
            url: data.url,
            artwork: typeof data.artwork === 'string' && data.artwork.trim() !== '' ? data.artwork : unknownTrackImageUri,
            views: data.views || 0,
          };
        });
        setTracks(result);
        setLoading(false);
      }, error => {
        console.log('Lỗi khi load tracks:', error);
        setLoading(false);
      });

    return () => unsubscribe();
  }, []);

  const filtered = useMemo(() => {
    if (tab === 'top') {
      return [...tracks].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 20);
    }
    if (tab === 'search') {
      const keyword = search.toLowerCase();
      return tracks.filter(
        (t) =>
          t.title?.toLowerCase().includes(keyword) ||
          t.artist?.toLowerCase().includes(keyword)
      );
    }
    return tracks;
  }, [tracks, search, tab]);

  const handleTrackPress = async (track: Track) => {
    try {
      await firestore().collection('tracks').doc(track.id).update({
        views: firestore.FieldValue.increment(1),
      });
      await playTrack(track, tracks, setCurrentTrack);
    } catch (err) {
      console.log('❌ Lỗi playTrack:', err);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={styles.menuButton}>
          <Icon name="menu" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Song Selection</Text>
      </View>

      <View style={[styles.tabs, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => setTab('last')}>
          <Text style={[styles.tab, { color: tab === 'last' ? '#1DB954' : colors.subtext }, tab === 'last' && styles.activeTab]}>
            Songs
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setTab('top')}>
          <Text style={[styles.tab, { color: tab === 'top' ? '#1DB954' : colors.subtext }, tab === 'top' && styles.activeTab]}>
            Top 20
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setTab('search')}>
          <Text style={[styles.tab, { color: tab === 'search' ? '#1DB954' : colors.subtext }, tab === 'search' && styles.activeTab]}>
            Search
          </Text>
        </TouchableOpacity>
      </View>

      {tab === 'search' && (
        <TextInput
          placeholder="Search..."
          placeholderTextColor={colors.subtext}
          value={search}
          onChangeText={setSearch}
          style={[styles.searchInput, { backgroundColor: colors.card, color: colors.text }]}
        />
      )}

      {loading ? (
        <ActivityIndicator size="large" color="#1DB954" />
      ) : (
        <TracksList
          tracks={filtered}
          onTrackPress={handleTrackPress}
          showIndex={tab === 'top'}
          showViews={tab === 'top'}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  menuButton: {
    marginRight: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  tabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
    borderBottomWidth: 1,
    paddingBottom: 4,
  },
  tab: {
    fontSize: 15,
  },
  activeTab: {
    fontWeight: 'bold',
  },
  searchInput: {
    marginHorizontal: 16,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
});
