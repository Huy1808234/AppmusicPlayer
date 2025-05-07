import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { unknownTrackImageUri } from '../constants/images';
import { useAppThemeStyles } from '../hooks/useAppThemeStyles';

const ArtistsScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [artists, setArtists] = useState<Artist[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const { colors, isDark } = useAppThemeStyles();

  useEffect(() => {
    const fetchArtists = async () => {
      const currentUser = auth().currentUser;
      if (!currentUser) return;

      const uid = currentUser.uid;
      setUserId(uid);

      const snapshot = await firestore().collection('tracks').get();
      const artistMap: { [key: string]: string | null } = {};

      snapshot.forEach((doc) => {
        const data = doc.data();
        const artist = data.artist || 'Unknown Artist';
        const artwork = typeof data.artwork === 'string' && data.artwork.trim() !== '' ? data.artwork : null;
        if (!artistMap[artist]) {
          artistMap[artist] = artwork;
        }
      });

      const artistList: Artist[] = Object.entries(artistMap).map(([name, artwork]) => ({
        name,
        artwork,
        isFollowing: false,
      }));

      const promises = artistList.map(async (artist) => {
        const doc = await firestore().collection('artist_followers').doc(artist.name).get();
        const followers = doc.exists ? doc.data()?.followers || [] : [];
        return {
          ...artist,
          isFollowing: followers.includes(uid),
        };
      });

      const resolvedArtists = await Promise.all(promises);
      setArtists(resolvedArtists.sort((a, b) => a.name.localeCompare(b.name)));
    };

    fetchArtists();
  }, []);

  const handleToggleFollow = async (artistName: string) => {
    if (!userId) return;

    const docRef = firestore().collection('artist_followers').doc(artistName);
    const doc = await docRef.get();

    if (doc.exists) {
      const followers: string[] = doc.data()?.followers || [];
      if (followers.includes(userId)) {
        await docRef.update({
          followers: followers.filter((id) => id !== userId),
        });
      } else {
        await docRef.update({
          followers: firestore.FieldValue.arrayUnion(userId),
        });
      }
    } else {
      await docRef.set({
        artist: artistName,
        followers: [userId],
      });
    }

    setArtists((prev) =>
      prev.map((artist) =>
        artist.name === artistName ? { ...artist, isFollowing: !artist.isFollowing } : artist
      )
    );
  };

  const renderArtist = ({ item }: { item: Artist }) => {
    const imageSource = typeof item.artwork === 'string' && item.artwork.trim() !== '' ? { uri: item.artwork } : unknownTrackImageUri;

    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
          marginRight: 16,
        }}
      >
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('ArtistDetail', {
              artist: item.name,
              artwork: item.artwork,
            })
          }
          style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}
        >
          <Image
            source={imageSource}
            style={{
              width: 50,
              height: 50,
              borderRadius: 25,
              backgroundColor: isDark ? '#333' : '#ccc',
              marginRight: 12,
            }}
          />
          <Text style={{ color: colors.text, fontSize: 16, fontWeight: '500' }}>{item.name}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleToggleFollow(item.name)}
          style={{
            borderWidth: 1,
            borderColor: item.isFollowing ? '#1DB954' : colors.subtext,
            borderRadius: 20,
            paddingVertical: 4,
            paddingHorizontal: 12,
          }}
        >
          <Text style={{ color: colors.text, fontSize: 12 }}>
            {item.isFollowing ? 'Đã theo dõi' : 'Theo dõi'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <ScrollView style={{ backgroundColor: colors.background, flex: 1, paddingHorizontal: 16 }}>
      <View style={{ marginVertical: 12 }}>
        <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700', marginBottom: 8 }}>
          Popular Artists
        </Text>
        <FlatList
          data={artists.slice(0, 5)}
          horizontal
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderArtist}
          showsHorizontalScrollIndicator={false}
        />
      </View>

      <View style={{ marginVertical: 12 }}>
        <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700', marginBottom: 8 }}>
          All Artists
        </Text>
        <FlatList
          data={artists}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderArtist}
          scrollEnabled={false}
        />
      </View>
    </ScrollView>
  );
};

export default ArtistsScreen;

type Artist = {
  name: string;
  artwork: string | null;
  isFollowing: boolean;
};