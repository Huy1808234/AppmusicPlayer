import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  TextInput,
  Share,
} from 'react-native';
import Modal from 'react-native-modal';
import { Track } from 'react-native-track-player';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { unknownTrackImageUri } from '../constants/images';

type Props = {
  visible: boolean;
  onClose: () => void;
  track: Track;
};

export const TrackOptionsModal = ({ visible, onClose, track }: Props) => {
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [removePlaylists, setRemovePlaylists] = useState<any[]>([]);
  const [toastMessage, setToastMessage] = useState('');

  const userId = auth().currentUser?.uid;
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const artwork =
    typeof track.artwork === 'string' ? { uri: track.artwork } : unknownTrackImageUri;

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 2000);
  };

  const fetchPlaylists = async () => {
    if (!userId) return;
    const snap = await firestore()
      .collection('users')
      .doc(userId)
      .collection('playlists')
      .orderBy('createdAt', 'desc')
      .get();
    setPlaylists(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const addToPlaylist = async (playlistId: string) => {
    if (!userId) return;
    await firestore()
      .collection('users')
      .doc(userId)
      .collection('playlists')
      .doc(playlistId)
      .update({
        tracks: firestore.FieldValue.arrayUnion(track.id),
      });
    showToast(' Đã thêm vào playlist');
    setShowPlaylistModal(false);
  };

  const createPlaylist = async () => {
    if (!userId || !newPlaylistName.trim()) return;
    await firestore()
      .collection('users')
      .doc(userId)
      .collection('playlists')
      .add({
        name: newPlaylistName.trim(),
        createdAt: firestore.FieldValue.serverTimestamp(),
        tracks: [track.id],
      });
    showToast(' Đã tạo và thêm vào playlist');
    setNewPlaylistName('');
    setShowPlaylistModal(false);
  };

  const fetchRemovablePlaylists = async () => {
    if (!userId || !track.id) return;
    try {
      const snap = await firestore()
        .collection('users')
        .doc(userId)
        .collection('playlists')
        .where('tracks', 'array-contains', track.id)
        .get();
      setRemovePlaylists(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error(' Lỗi khi fetchRemovablePlaylists:', error);
      showToast('Lỗi: Không thể tải danh sách playlist để xóa');
    }
  };

  const removeFromPlaylist = async (playlistId: string) => {
    if (!userId || !track.id) return;
    try {
      await firestore()
        .collection('users')
        .doc(userId)
        .collection('playlists')
        .doc(playlistId)
        .update({
          tracks: firestore.FieldValue.arrayRemove(track.id),
        });
      showToast(' Đã xóa khỏi playlist');
      setShowRemoveModal(false);
    } catch (error) {
      console.error(' Lỗi khi xóa khỏi playlist:', error);
      showToast('Lỗi: Không thể xóa bài khỏi playlist');
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${track.title} - ${track.artist}\n${track.url}`,
      });
    } catch (err) {
      console.log('Lỗi chia sẻ:', err);
    }
  };

  const options = [
    { icon: 'playlist-plus', label: 'Thêm vào danh sách phát', action: async () => { await fetchPlaylists(); setShowPlaylistModal(true); } },
    { icon: 'playlist-remove', label: 'Xóa khỏi danh sách phát này', action: async () => { await fetchRemovablePlaylists(); setShowRemoveModal(true); } },
    {
      icon: 'account-music',
      label: 'Chuyển tới trang nghệ sĩ',
      action: () => {
        onClose();
        navigation.navigate('ArtistDetail', {
          artist: track.artist || 'Unknown Artist',
          artwork: typeof track.artwork === 'string' ? track.artwork : null,
        });
      },
    },
    { icon: 'share-outline', label: 'Chia sẻ', action: handleShare },
  ];

  return (
    <>
      <Modal isVisible={visible} onBackdropPress={onClose} style={{ justifyContent: 'flex-end', margin: 0 }}>
        <View style={styles.container}>
          <View style={styles.dragIndicator} />
          <View style={styles.header}>
            <Image source={artwork} style={styles.artwork} />
            <View style={{ flex: 1 }}>
              <Text style={styles.trackTitle}>{track.title || 'Unknown Title'}</Text>
              <Text style={styles.artist}>{track.artist || 'Unknown Artist'}</Text>
            </View>
          </View>
          {options.map((item, index) => (
            <TouchableOpacity key={index} style={styles.option} onPress={item.action}>
              <Icon name={item.icon} size={22} color="white" style={styles.optionIcon} />
              <Text style={styles.optionText}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Modal>

      <Modal isVisible={showPlaylistModal} onBackdropPress={() => setShowPlaylistModal(false)}>
        <View style={styles.playlistModal}>
          <Text style={styles.modalTitle}>Chọn playlist</Text>
          <FlatList
            data={playlists}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => addToPlaylist(item.id)} style={styles.playlistItem}>
                <Text style={{ color: 'white' }}>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
          <TextInput
            value={newPlaylistName}
            onChangeText={setNewPlaylistName}
            placeholder="Tạo playlist mới"
            placeholderTextColor="#888"
            style={styles.input}
          />
          <TouchableOpacity style={styles.createButton} onPress={createPlaylist}>
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Tạo và thêm vào</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <Modal isVisible={showRemoveModal} onBackdropPress={() => setShowRemoveModal(false)}>
        <View style={styles.playlistModal}>
          <Text style={styles.modalTitle}> Chọn playlist để xóa</Text>
          <FlatList
            data={removePlaylists}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => removeFromPlaylist(item.id)} style={styles.playlistItem}>
                <Text style={{ color: 'white' }}>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>

      {toastMessage !== '' && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#121212',
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  dragIndicator: {
    width: 40,
    height: 4,
    backgroundColor: '#888',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  artwork: {
    width: 50,
    height: 50,
    borderRadius: 6,
    marginRight: 12,
  },
  trackTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  artist: {
    fontSize: 14,
    color: '#aaa',
    marginTop: 2,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  optionIcon: {
    marginRight: 16,
  },
  optionText: {
    fontSize: 15,
    color: 'white',
  },
  playlistModal: {
    backgroundColor: '#1e1e1e',
    padding: 20,
    borderRadius: 12,
    maxHeight: '80%',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  playlistItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  input: {
    backgroundColor: '#2a2a2a',
    color: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 12,
  },
  createButton: {
    backgroundColor: '#1DB954',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
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

export default TrackOptionsModal;