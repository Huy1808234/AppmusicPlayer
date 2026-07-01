// ProfileScreen.tsx (hoàn chỉnh với modal đổi mật khẩu)
import ChangePasswordModal from '../components/ChangePasswordModal';
import React, {useEffect, useRef, useState} from 'react';
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
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/types';
import {useTheme} from '../context/ThemeProvider';
import {launchImageLibrary} from 'react-native-image-picker';
import storage from '@react-native-firebase/storage';

export default function ProfileScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const user = auth().currentUser;
  const {theme, toggleTheme} = useTheme();
  const isDark = theme === 'dark';

  const [playlistCount, setPlaylistCount] = useState(0);
  const [trackCount, setTrackCount] = useState(0);
  const [totalLikes, setTotalLikes] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [showChangePassword, setShowChangePassword] = useState(false);

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

  const fetchAvatar = async () => {
    const currentUser = auth().currentUser;
    if (!currentUser) return;
    try {
      const doc = await firestore()
        .collection('users')
        .doc(currentUser.uid)
        .get();
      const avatarFromDB = doc.data()?.avatar;
      setAvatarUrl(avatarFromDB || currentUser.photoURL || '');
    } catch (err) {
      console.error('Avatar error:', err);
    }
  };

  const pickAndUploadAvatar = async () => {
    const result = await launchImageLibrary({mediaType: 'photo'});
    if (result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      if (!uri || !user) return;
      try {
        const response = await fetch(uri);
        const blob = await response.blob();
        const ref = storage().ref(`avatars/${user.uid}`);
        await ref.put(blob);
        const downloadUrl = await ref.getDownloadURL();
        await user.updateProfile({photoURL: downloadUrl});
        await auth().currentUser?.reload();
        await firestore()
          .collection('users')
          .doc(user.uid)
          .set({avatar: downloadUrl}, {merge: true});
        await fetchAvatar();
        Alert.alert('Thành công', 'Cập nhật ảnh đại diện thành công!');
      } catch (err) {
        console.error('Upload avatar failed:', err);
        Alert.alert('Lỗi', 'Không thể upload ảnh');
      }
    }
  };

  useEffect(() => {
    fetchAvatar();
  }, []);
  useEffect(() => {
    if (!user) return;
    const unsub = firestore()
      .collection('users')
      .doc(user.uid)
      .collection('playlists')
      .onSnapshot(snap => {
        const playlists = snap.docs.map(doc => doc.data());
        setPlaylistCount(playlists.length);
        const trackIds = playlists.flatMap(pl => pl.tracks || []);
        setTrackCount(Array.from(new Set(trackIds)).length);
      });
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsub = firestore()
      .collection('tracks')
      .onSnapshot(snap => {
        let total = 0;
        snap.forEach(doc => (total += doc.data()?.likes || 0));
        setTotalLikes(total);
      });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user) return;
    const unsub = firestore()
      .collection('artist_followers')
      .onSnapshot(snap => {
        let count = 0;
        snap.forEach(doc => {
          const followers = doc.data()?.followers || [];
          if (followers.includes(user.uid)) count++;
        });
        setFollowingCount(count);
      });
    return () => unsub();
  }, []);

  const handleLogout = async () => {
    try {
      await auth().signOut();
      navigation.replace('Login');
    } catch (err: any) {
      Alert.alert('Lỗi đăng xuất', err.message);
    }
  };

  const avatarSource = avatarUrl
    ? {uri: `${avatarUrl}?v=${Date.now()}`}
    : {uri: 'https://cdn-icons-png.flaticon.com/512/149/149071.png'};

  const themeStyles = {
    backgroundColor: isDark ? '#121212' : '#fff',
    textColor: isDark ? '#fff' : '#000',
    subtextColor: isDark ? '#aaa' : '#666',
    borderColor: isDark ? '#333' : '#ddd',
  };

  return (
    <>
      <ScrollView
        style={[
          styles.container,
          {backgroundColor: themeStyles.backgroundColor},
        ]}>
        <TouchableOpacity style={styles.themeToggle} onPress={animateIcon}>
          <Animated.View style={{transform: [{rotate}]}}>
            <Icon
              name={isDark ? 'white-balance-sunny' : 'weather-night'}
              size={24}
              color={isDark ? '#fff' : '#000'}
            />
          </Animated.View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.editButtonTopRight,
            {backgroundColor: themeStyles.borderColor},
          ]}
          onPress={() => navigation.navigate('EditProfile')}>
          <Text style={{color: themeStyles.textColor}}>Edit</Text>
        </TouchableOpacity>

        <Text style={[styles.header, {color: themeStyles.textColor}]}>
          My Profile
        </Text>

        <View style={styles.profileSection}>
          <TouchableOpacity onPress={pickAndUploadAvatar}>
            <Image source={avatarSource} style={styles.avatar} />
          </TouchableOpacity>
          <Text style={[styles.name, {color: themeStyles.textColor}]}>
            {user?.displayName || 'User Name'}
          </Text>
          <Text style={{color: themeStyles.subtextColor}}>
            @{user?.email?.split('@')[0]}
          </Text>
        </View>

        <View style={styles.statsRow}>
          {[
            {label: 'Tracks', value: trackCount},
            {label: 'Playlists', value: playlistCount},
            {label: 'Likes', value: totalLikes},
            {label: 'Following', value: followingCount},
          ].map((stat, idx) => (
            <View style={styles.statItem} key={idx}>
              <Text style={[styles.statNumber, {color: themeStyles.textColor}]}>
                {stat.value}
              </Text>
              <Text
                style={[styles.statLabel, {color: themeStyles.subtextColor}]}>
                {stat.label}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.menu}>
          <TouchableOpacity onPress={() => setShowChangePassword(true)}>
            <Text
              style={[
                styles.menuItem,
                {
                  color: themeStyles.textColor,
                  borderBottomColor: themeStyles.borderColor,
                },
              ]}>
              Change Password
            </Text>
          </TouchableOpacity>

          {['Notifications', 'Connected services', 'About'].map((item, idx) => (
            <TouchableOpacity key={idx}>
              <Text
                style={[
                  styles.menuItem,
                  {
                    color: themeStyles.textColor,
                    borderBottomColor: themeStyles.borderColor,
                  },
                ]}>
                {item}
              </Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity onPress={handleLogout}>
            <Text
              style={[
                styles.menuItem,
                {color: '#f44', borderBottomColor: themeStyles.borderColor},
              ]}>
              Logout
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <ChangePasswordModal
        visible={showChangePassword}
        onClose={() => setShowChangePassword(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
  header: {
    textAlign: 'center',
    marginTop: 60,
    fontSize: 18,
    fontWeight: 'bold',
  },
  profileSection: {alignItems: 'center', marginTop: 20},
  avatar: {width: 90, height: 90, borderRadius: 45, marginBottom: 10},
  name: {fontSize: 18, fontWeight: 'bold'},
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    paddingHorizontal: 16,
  },
  statItem: {alignItems: 'center'},
  statNumber: {fontSize: 16, fontWeight: 'bold'},
  statLabel: {fontSize: 12},
  menu: {marginTop: 30, paddingHorizontal: 16},
  menuItem: {paddingVertical: 14, fontSize: 16, borderBottomWidth: 1},
  themeToggle: {position: 'absolute', top: 16, left: 16, zIndex: 10},
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
