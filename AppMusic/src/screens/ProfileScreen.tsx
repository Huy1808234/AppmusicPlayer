import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  Animated,
  Easing,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useCurrentTrack } from '../context/CurrentTrackContext';
import { useTheme } from '../context/ThemeProvider';

export default function ProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const user = auth().currentUser;
  const { setCurrentTrack } = useCurrentTrack();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  const [playlistCount, setPlaylistCount] = useState(0);
  const [trackCount, setTrackCount] = useState(0);
  const [totalLikes, setTotalLikes] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [localAvatarUri, setLocalAvatarUri] = useState<string | null>(null);

  const rotateAnim = useRef(new Animated.Value(0)).current;

  const animateIcon = () => {
    rotateAnim.setValue(0);
    Animated.timing(rotateAnim, {
      toValue: 1,
      duration: 500,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start();
    toggleTheme();
  };

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  useEffect(() => {
    AsyncStorage.getItem('localAvatarPath').then(uri => {
      if (uri) setLocalAvatarUri(uri);
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      const loadAvatar = async () => {
        const uri = await AsyncStorage.getItem('localAvatarPath');
        setLocalAvatarUri(uri || null);
      };
      loadAvatar();
    }, [])
  );

  useEffect(() => {
    if (!user) return;
    const unsub = firestore()
      .collection('users')
      .doc(user.uid)
      .collection('playlists')
      .onSnapshot((snap) => {
        const playlists = snap.docs.map(doc => doc.data());
        setPlaylistCount(playlists.length);
        const allTrackIds = playlists.flatMap(pl => pl.tracks || []);
        const uniqueIds = Array.from(new Set(allTrackIds));
        setTrackCount(uniqueIds.length);
      });
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('tracks')
      .onSnapshot(snapshot => {
        let total = 0;
        snapshot.forEach(doc => {
          total += doc.data()?.likes || 0;
        });
        setTotalLikes(total);
      });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const unsubFollow = firestore()
      .collection('artist_followers')
      .onSnapshot(snapshot => {
        let count = 0;
        snapshot.forEach(doc => {
          const followers = doc.data()?.followers || [];
          if (followers.includes(user.uid)) count++;
        });
        setFollowingCount(count);
      });
    return () => unsubFollow();
  }, []);

  const handleLogout = async () => {
    try {
      await auth().signOut();
      navigation.replace('Login');
    } catch (err: any) {
      Alert.alert('Lỗi đăng xuất', err.message);
    }
  };

  const themeStyles = {
    backgroundColor: isDark ? '#121212' : '#fff',
    textColor: isDark ? '#fff' : '#000',
    subtextColor: isDark ? '#aaa' : '#666',
    borderColor: isDark ? '#333' : '#ddd',
    cardBg: isDark ? '#1e1e1e' : '#f4f4f4',
  };

  const avatarSource = localAvatarUri
    ? { uri: `${localAvatarUri}?v=${Date.now()}` } // cache buster
    : user?.photoURL
    ? { uri: user.photoURL }
    : { uri: 'https://cdn-icons-png.flaticon.com/512/149/149071.png' };

  return (
    <ScrollView style={[styles.container, { backgroundColor: themeStyles.backgroundColor }]}>
      <TouchableOpacity style={styles.themeToggle} onPress={animateIcon}>
        <Animated.View style={{ transform: [{ rotate }] }}>
          <Icon
            name={isDark ? 'white-balance-sunny' : 'weather-night'}
            size={24}
            color={isDark ? '#fff' : '#000'}
          />
        </Animated.View>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.editButtonTopRight, { backgroundColor: themeStyles.borderColor }]}
        onPress={() => navigation.navigate('EditProfile')}
      >
        <Text style={{ color: themeStyles.textColor }}>Edit</Text>
      </TouchableOpacity>

      <Text style={[styles.header, { color: themeStyles.textColor }]}>My Profile</Text>

      <View style={styles.profileSection}>
        <Image
          source={avatarSource}
          style={styles.avatar}
        />
        <Text style={[styles.name, { color: themeStyles.textColor }]}>{user?.displayName || 'User Name'}</Text>
        <Text style={{ color: themeStyles.subtextColor }}>@{user?.email?.split('@')[0]}</Text>
      </View>

      <View style={styles.statsRow}>
        {[{ label: 'Tracks', value: trackCount }, { label: 'Playlists', value: playlistCount }, { label: 'Likes', value: totalLikes }, { label: 'Following', value: followingCount }].map((stat, idx) => (
          <View style={styles.statItem} key={idx}>
            <Text style={[styles.statNumber, { color: themeStyles.textColor }]}>{stat.value}</Text>
            <Text style={[styles.statLabel, { color: themeStyles.subtextColor }]}>{stat.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.menu}>
        {['Notifications', 'Connected services', 'About'].map((item, idx) => (
          <TouchableOpacity key={idx}>
            <Text style={[styles.menuItem, { color: themeStyles.textColor, borderBottomColor: themeStyles.borderColor }]}>{item}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity onPress={handleLogout}>
          <Text style={[styles.menuItem, { color: '#f44', borderBottomColor: themeStyles.borderColor }]}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { textAlign: 'center', marginTop: 60, fontSize: 18, fontWeight: 'bold' },
  profileSection: { alignItems: 'center', marginTop: 20 },
  avatar: { width: 90, height: 90, borderRadius: 45, marginBottom: 10 },
  name: { fontSize: 18, fontWeight: 'bold' },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    paddingHorizontal: 16,
  },
  statItem: { alignItems: 'center' },
  statNumber: { fontSize: 16, fontWeight: 'bold' },
  statLabel: { fontSize: 12 },
  menu: { marginTop: 30, paddingHorizontal: 16 },
  menuItem: {
    paddingVertical: 14,
    fontSize: 16,
    borderBottomWidth: 1,
  },
  themeToggle: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 10,
  },
  editButtonTopRight: {
    position: 'absolute',
    top: 16,
    right: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    zIndex: 10,
  },
});
