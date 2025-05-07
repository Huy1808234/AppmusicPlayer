import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Image,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppThemeStyles } from '../hooks/useAppThemeStyles';

type Playlist = {
  id: string;
  name: string;
  type?: string;
  cover?: string;
  tracks: string[];
};

type RootStackParamList = {
  PlaylistDetailScreen: { name: string; trackIds: string[] };
};

const PlaylistsScreen = () => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [filteredPlaylists, setFilteredPlaylists] = useState<Playlist[]>([]);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [searchText, setSearchText] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const userId = auth().currentUser?.uid;
  const { colors } = useAppThemeStyles();

  useEffect(() => {
    if (!userId) return;
    const unsubscribe = firestore()
      .collection('users')
      .doc(userId)
      .collection('playlists')
      .orderBy('createdAt', 'desc')
      .onSnapshot(snapshot => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Playlist[];
        setPlaylists(data);
        setFilteredPlaylists(data);
      });

    return unsubscribe;
  }, []);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 2000);
  };

  const createPlaylist = async () => {
    if (!userId || !newPlaylistName.trim()) {
      showToast('Vui lòng nhập tên playlist');
      return;
    }

    await firestore()
      .collection('users')
      .doc(userId)
      .collection('playlists')
      .add({
        name: newPlaylistName.trim(),
        createdAt: firestore.FieldValue.serverTimestamp(),
        type: 'saved',
        cover: '',
        tracks: [],
      });

    setNewPlaylistName('');
    showToast('Playlist đã được tạo');
  };

  const renderPlaylistItem = ({ item }: { item: Playlist }) => (
    <TouchableOpacity
      style={styles.playlistItem}
      onPress={() =>
        navigation.navigate('PlaylistDetailScreen', {
          name: item.name,
          trackIds: item.tracks,
        })
      }
    >
      {item.cover ? (
        <Image source={{ uri: item.cover }} style={styles.coverImg} />
      ) : (
        <View style={[styles.iconBox, { backgroundColor: colors.border }]}>
          <Icon name="music" size={28} color={colors.subtext} />
        </View>
      )}
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={[styles.title, { color: colors.text }]}>{item.name}</Text>
        <Text style={[styles.subtitle, { color: colors.subtext }]}>
          {item.tracks?.length || 0} bài hát
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.header, { color: colors.text }]}>Playlist của bạn</Text>

      <View style={styles.createWrapper}>
        <TextInput
          value={newPlaylistName}
          onChangeText={setNewPlaylistName}
          placeholder="Tên playlist mới"
          placeholderTextColor={colors.subtext}
          style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
        />
        <TouchableOpacity
          style={[styles.createButton, { backgroundColor: colors.primary }]}
          onPress={createPlaylist}
        >
          <Text style={styles.createButtonText}>Tạo</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredPlaylists.filter((playlist) =>
          playlist.name.toLowerCase().includes(searchText.toLowerCase())
        )}
        keyExtractor={(item) => item.id}
        renderItem={renderPlaylistItem}
        ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
        contentContainerStyle={styles.playlistList}
      />

      {toastMessage !== '' && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}
    </View>
  );
};

export default PlaylistsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 24 },
  header: { fontSize: 22, fontWeight: 'bold', paddingHorizontal: 16, marginBottom: 12 },
  createWrapper: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 12 },
  input: {
    flex: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  createButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  createButtonText: { color: '#fff', fontWeight: '600' },
  playlistList: { paddingHorizontal: 16, paddingBottom: 16 },
  playlistItem: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 54, height: 54, borderRadius: 4, alignItems: 'center', justifyContent: 'center' },
  coverImg: { width: 54, height: 54, borderRadius: 4 },
  title: { fontWeight: 'bold', fontSize: 16 },
  subtitle: { fontSize: 13 },
  toast: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -100 }, { translateY: -20 }],
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    zIndex: 1000,
  },
  toastText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
  },
  
});
