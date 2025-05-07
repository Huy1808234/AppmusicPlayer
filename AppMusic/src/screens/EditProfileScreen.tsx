import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';
import ImagePicker from 'react-native-image-crop-picker';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { useAppThemeStyles } from '../hooks/useAppThemeStyles';

export default function EditProfileScreen() {
  const user = auth().currentUser;
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUri, setAvatarUri] = useState('');
  const [uploading, setUploading] = useState(false);

  const { colors } = useAppThemeStyles();
  const themedStyles = useMemo(() => createStyles(colors), [colors]);

  useEffect(() => {
    if (!user) return;

    const loadProfile = async () => {
      const doc = await firestore().collection('users').doc(user.uid).get();
      const data = doc.data();
      if (data) {
        setFirstName(data.firstName || '');
        setLastName(data.lastName || '');
        setPhone(data.phone || '');
      }

      const localAvatar = await AsyncStorage.getItem('localAvatarPath');
      if (localAvatar) setAvatarUri(localAvatar);
    };

    loadProfile();
  }, []);

  const pickImage = async () => {
    try {
      const image = await ImagePicker.openPicker({
        width: 300,
        height: 300,
        cropping: true,
        compressImageQuality: 0.8,
      });

      const localPath = `${RNFS.DocumentDirectoryPath}/avatar.jpg`;

      // Xóa ảnh cũ nếu tồn tại
      if (await RNFS.exists(localPath)) {
        await RNFS.unlink(localPath);
      }

      setUploading(true);
      await RNFS.copyFile(image.path, localPath);
      const fileUri = `file://${localPath}`;
      await AsyncStorage.setItem('localAvatarPath', fileUri);
      setAvatarUri(fileUri);
      Alert.alert(' Đã cập nhật avatar');
    } catch (err) {
      console.log('Error:', err);
      Alert.alert(' Lỗi khi chọn ảnh');
    } finally {
      setUploading(false);
    }
  };

  const removeAvatar = async () => {
    try {
      const localPath = `${RNFS.DocumentDirectoryPath}/avatar.jpg`;
      if (await RNFS.exists(localPath)) {
        await RNFS.unlink(localPath); // xóa file vật lý
      }
      await AsyncStorage.removeItem('localAvatarPath'); // xóa key AsyncStorage
      setAvatarUri(''); // xóa state
      Alert.alert('Đã xóa ảnh đại diện');
    } catch (err) {
      console.log('Remove avatar error:', err);
    }
  };
  

  const handleUpdate = async () => {
    if (!user) return;
    try {
      await firestore().collection('users').doc(user.uid).set(
        {
          firstName,
          lastName,
          phone,
        },
        { merge: true }
      );
      await user.updateProfile({
        displayName: `${firstName} ${lastName}`.trim(),
      });
      Alert.alert(' Hồ sơ đã được cập nhật');
    } catch (err) {
      console.log('Update error:', err);
      Alert.alert(' Lỗi cập nhật hồ sơ');
    }
  };

  return (
    <View style={themedStyles.container}>
      <TouchableOpacity onPress={pickImage} style={{ alignSelf: 'center' }}>
      <Image
  source={{
    uri:
      avatarUri
        ? `${avatarUri}?v=${Date.now()}`
        : 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
  }}
  style={themedStyles.avatar}
/>

        {uploading && (
          <ActivityIndicator style={themedStyles.loader} size="small" color={colors.primary} />
        )}
      </TouchableOpacity>

      {avatarUri ? (
        <TouchableOpacity onPress={removeAvatar} style={themedStyles.removeButton}>
          <Text style={{ color: colors.error }}>Gỡ ảnh đại diện</Text>
        </TouchableOpacity>
      ) : null}

      <TextInput
        value={firstName}
        onChangeText={setFirstName}
        placeholder="First name"
        placeholderTextColor={colors.subtext}
        style={themedStyles.input}
      />
      <TextInput
        value={lastName}
        onChangeText={setLastName}
        placeholder="Last name"
        placeholderTextColor={colors.subtext}
        style={themedStyles.input}
      />
      <TextInput
        value={phone}
        onChangeText={setPhone}
        placeholder="Phone"
        keyboardType="phone-pad"
        placeholderTextColor={colors.subtext}
        style={themedStyles.input}
      />

      <TouchableOpacity style={themedStyles.button} onPress={handleUpdate}>
        <Text style={themedStyles.buttonText}>Cập nhật</Text>
      </TouchableOpacity>
    </View>
  );
}

const createStyles = (colors: ReturnType<typeof useAppThemeStyles>['colors']) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, padding: 20 },
    avatar: {
      width: 100,
      height: 100,
      borderRadius: 50,
      alignSelf: 'center',
      marginBottom: 10,
      backgroundColor: colors.card,
    },
    loader: { position: 'absolute', top: 35, left: 35 },
    removeButton: { alignSelf: 'center', marginBottom: 10 },
    input: {
      backgroundColor: colors.card,
      borderRadius: 8,
      padding: 12,
      color: colors.text,
      marginBottom: 16,
    },
    button: {
      backgroundColor: colors.primary,
      padding: 14,
      borderRadius: 8,
      alignItems: 'center',
    },
    buttonText: { color: '#fff', fontWeight: 'bold' },
  });
