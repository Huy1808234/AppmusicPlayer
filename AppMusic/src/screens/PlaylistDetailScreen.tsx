import React, {useEffect, useState, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {RouteProp, useRoute, useNavigation} from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import {Track} from 'react-native-track-player';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Modal from 'react-native-modal';
import {useCurrentTrack} from '../context/CurrentTrackContext';
import {playTrack} from '../utils/playTrack';
import {TrackListItem} from '../components/TrackListItem';
import {unknownTrackImageUri} from '../constants/images';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/types';
import {useAppThemeStyles} from '../hooks/useAppThemeStyles';

type PlaylistDetailParams = {
  PlaylistDetailScreen: {
    name: string;
    trackIds: string[];
  };
};

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'PlaylistDetailScreen'
>;

export default function PlaylistDetailScreen() {
  const route =
    useRoute<RouteProp<PlaylistDetailParams, 'PlaylistDetailScreen'>>();
  const navigation = useNavigation<NavigationProp>();
  const {name: initialName, trackIds} = route.params;

  const [tracks, setTracks] = useState<Track[]>([]);
  const [searchText, setSearchText] = useState('');
  const [suggestedTracks, setSuggestedTracks] = useState<Track[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [renameMode, setRenameMode] = useState(false);
  const [newName, setNewName] = useState(initialName);
  const [playlistName, setPlaylistName] = useState(initialName);
  const [toastMessage, setToastMessage] = useState('');
  const {currentTrack, setCurrentTrack} = useCurrentTrack();

  const {colors} = useAppThemeStyles();
  const themedStyles = useMemo(() => createStyles(colors), [colors]);

  const user = auth().currentUser;

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 2000);
  };

  useEffect(() => {
    const fetchTracks = async () => {
      const results = await Promise.all(
        trackIds.map(async id => {
          const doc = await firestore().collection('tracks').doc(id).get();
          const data = doc.data();
          if (!data?.url) return null;

          return {
            id: doc.id,
            title: data.title || 'Unknown Title',
            artist: data.artist || 'Unknown Artist',
            url: data.url,
            artwork: typeof data.artwork === 'string' ? data.artwork : '',
          } as Track;
        }),
      );
      setTracks(results.filter(Boolean) as Track[]);
    };

    const fetchSuggestions = async () => {
      const snap = await firestore().collection('tracks').limit(15).get();
      const suggestions = snap.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title || 'Unknown Title',
          artist: data.artist || 'Unknown Artist',
          url: data.url,
          artwork: typeof data.artwork === 'string' ? data.artwork : '',
        } as Track;
      });
      setSuggestedTracks(suggestions);
    };

    fetchTracks();
    fetchSuggestions();
  }, [trackIds]);

  const handlePlay = async (track: Track) => {
    try {
      await playTrack(track, tracks, setCurrentTrack);
    } catch (err) {
      console.log('playTrack error:', err);
    }
  };

  const handlePlayAll = async () => {
    if (tracks.length > 0) {
      await playTrack(tracks[0], tracks, setCurrentTrack); // phát bài đầu tiên + truyền toàn bộ danh sách
    }
  };

  const handleAddTrack = async (track: Track) => {
    if (!user) return;
    try {
      const snapshot = await firestore()
        .collection('users')
        .doc(user.uid)
        .collection('playlists')
        .where('name', '==', initialName)
        .get();

      snapshot.forEach(doc => {
        doc.ref.update({
          tracks: firestore.FieldValue.arrayUnion(track.id),
        });
      });
      showToast('Đã thêm bài hát');
    } catch (err) {
      console.log('Lỗi khi thêm bài hát:', err);
    }
  };

  const handleRename = async () => {
    if (!newName.trim() || !user) return;
    const snap = await firestore()
      .collection('users')
      .doc(user.uid)
      .collection('playlists')
      .where('name', '==', initialName)
      .get();

    snap.forEach(doc => {
      doc.ref.update({name: newName.trim()});
    });
    setPlaylistName(newName.trim());
    setRenameMode(false);
    showToast('Đã đổi tên playlist');
  };

  const handleDelete = async () => {
    if (!user) return;
    const snap = await firestore()
      .collection('users')
      .doc(user.uid)
      .collection('playlists')
      .where('name', '==', initialName)
      .get();

    snap.forEach(doc => {
      doc.ref.delete();
    });
    setShowOptions(false);
    showToast('Playlist đã bị xóa');
    navigation.goBack();
  };

  const artworkSource =
    tracks.length > 0 && tracks[0].artwork
      ? {uri: tracks[0].artwork}
      : unknownTrackImageUri;

  const filteredTracks = tracks.filter(track =>
    (track.title || '').toLowerCase().includes(searchText.toLowerCase()),
  );

  return (
    <ScrollView style={themedStyles.container}>
      <View style={themedStyles.headerContainer}>
        <Image source={artworkSource} style={themedStyles.playlistImage} />
        <Text style={themedStyles.playlistName}>{playlistName}</Text>
        <Text style={themedStyles.playlistMeta}>
          {user?.displayName || 'Người dùng'} • {trackIds.length} bài hát
        </Text>
        <TouchableOpacity
          style={themedStyles.addButton}
          onPress={() => setShowSuggestions(true)}>
          <Text style={themedStyles.addButtonText}>
            Thêm vào danh sách phát này
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setShowOptions(true)}
          style={{position: 'absolute', top: 20, right: 20}}>
          <Icon name="dots-horizontal" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={themedStyles.searchBar}>
        <TextInput
          placeholder="Tìm bài hát..."
          placeholderTextColor={colors.subtext}
          value={searchText}
          onChangeText={setSearchText}
          style={themedStyles.searchInput}
        />
      </View>
      <FlatList
  data={filteredTracks}
  keyExtractor={item => item.id}
  renderItem={({ item }) => (
    <TrackListItem
      track={item}
      onPress={() => handlePlay(item)}
      isActive={currentTrack?.id === item.id}
    />
  )}
  ListHeaderComponent={() => (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginHorizontal: 0,
        marginTop: 16,
        marginBottom: 8,
      }}>
      <Text style={[themedStyles.sectionTitle, { marginBottom: 0 }]}>Các bài hát đã thêm</Text>
      <TouchableOpacity onPress={handlePlayAll}>
        <Icon name="play-circle" size={50} color="#1DB954" />
      </TouchableOpacity>
    </View>
  )}
  scrollEnabled={false}
/>


      {showSuggestions && (
        <>
          <Text style={themedStyles.sectionTitle}>
            Các bài hát được đề xuất
          </Text>
          {suggestedTracks.map(track => {
            const imageSource = track.artwork
              ? {uri: track.artwork}
              : unknownTrackImageUri;
            return (
              <View key={track.id} style={themedStyles.suggestedItem}>
                <Image source={imageSource} style={themedStyles.trackImage} />
                <View style={{flex: 1, marginLeft: 12}}>
                  <Text style={{color: colors.text}}>{track.title}</Text>
                  <Text style={{color: colors.subtext, fontSize: 12}}>
                    {track.artist}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => handleAddTrack(track)}>
                  <Icon
                    name="plus-circle-outline"
                    size={22}
                    color={colors.text}
                  />
                </TouchableOpacity>
              </View>
            );
          })}
        </>
      )}

      {/* Modal Options */}
      <Modal
        isVisible={showOptions}
        onBackdropPress={() => setShowOptions(false)}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        backdropOpacity={0.5}
        style={{justifyContent: 'flex-end', margin: 0}}>
        <View style={themedStyles.modalContainer}>
          <View style={themedStyles.dragIndicator} />
          <TouchableOpacity
            style={themedStyles.optionRow}
            onPress={() => {
              setShowOptions(false);
              setRenameMode(true);
            }}>
            <Icon
              name="pencil-outline"
              size={22}
              color={colors.text}
              style={themedStyles.optionIcon}
            />
            <Text style={themedStyles.optionText}>Đổi tên playlist</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={themedStyles.optionRow}
            onPress={handleDelete}>
            <Icon
              name="delete-outline"
              size={22}
              color={colors.text}
              style={themedStyles.optionIcon}
            />
            <Text style={themedStyles.optionText}>Xóa playlist</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={themedStyles.optionRow}
            onPress={() => setShowOptions(false)}>
            <Icon
              name="close"
              size={22}
              color={colors.text}
              style={themedStyles.optionIcon}
            />
            <Text style={themedStyles.optionText}>Đóng</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Rename Modal */}
      <Modal
        isVisible={renameMode}
        onBackdropPress={() => setRenameMode(false)}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        backdropOpacity={0.5}
        style={{justifyContent: 'flex-end', margin: 0}}>
        <View style={themedStyles.modalContainer}>
          <Text style={themedStyles.modalTitle}>Nhập tên playlist mới</Text>
          <TextInput
            placeholder="Tên mới..."
            placeholderTextColor={colors.subtext}
            value={newName}
            onChangeText={setNewName}
            style={themedStyles.input}
          />
          <TouchableOpacity
            style={themedStyles.confirmButton}
            onPress={handleRename}>
            <Text style={{color: '#fff'}}>Lưu tên mới</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {toastMessage !== '' && (
        <View style={themedStyles.toast}>
          <Text style={themedStyles.toastText}>{toastMessage}</Text>
        </View>
      )}

      <View style={{height: 100}} />
    </ScrollView>
  );
}

const createStyles = (colors: ReturnType<typeof useAppThemeStyles>['colors']) =>
  StyleSheet.create({
    container: {backgroundColor: colors.background, flex: 1},
    headerContainer: {alignItems: 'center', padding: 20},
    playlistImage: {width: 180, height: 180, borderRadius: 8, marginBottom: 16},
    playlistName: {
      color: colors.text,
      fontSize: 22,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    playlistMeta: {color: colors.subtext, marginTop: 4},
    addButton: {
      backgroundColor: colors.text,
      borderRadius: 24,
      paddingVertical: 10,
      paddingHorizontal: 20,
      marginTop: 16,
    },
    addButtonText: {color: colors.background, fontWeight: 'bold'},
    searchBar: {
      backgroundColor: colors.card,
      borderRadius: 8,
      marginHorizontal: 16,
      paddingHorizontal: 12,
      marginBottom: 12,
    },
    searchInput: {height: 40, color: colors.text},
    sectionTitle: {
      fontSize: 18,
      color: colors.text,
      fontWeight: 'bold',
      marginHorizontal: 16,
      marginTop: 16,
      marginBottom: 8,
    },
    suggestedItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: 16,
      marginVertical: 8,
    },
    trackImage: {
      width: 48,
      height: 48,
      borderRadius: 4,
      backgroundColor: colors.card,
    },
    modalContainer: {
      backgroundColor: colors.card,
      padding: 20,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
    },
    dragIndicator: {
      width: 36,
      height: 4,
      backgroundColor: colors.subtext,
      borderRadius: 2,
      alignSelf: 'center',
      marginBottom: 12,
    },
    optionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 14,
    },
    optionIcon: {marginRight: 16},
    optionText: {color: colors.text, fontSize: 16},
    modalTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 10,
    },
    input: {
      backgroundColor: colors.card,
      color: colors.text,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      marginTop: 10,
    },
    confirmButton: {
      backgroundColor: colors.primary,
      padding: 12,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 10,
    },
    toast: {
      position: 'absolute',
      top: '45%',
      left: '50%',
      transform: [{translateX: -120}, {translateY: -20}],
      backgroundColor: 'rgba(0,0,0,0.85)',
      paddingVertical: 10,
      paddingHorizontal: 24,
      borderRadius: 10,
      zIndex: 1000,
    },
    toastText: {
      color: '#fff',
      fontSize: 15,
      textAlign: 'center',
    },
  });
