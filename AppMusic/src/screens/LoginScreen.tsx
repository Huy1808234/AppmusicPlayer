import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Pressable,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import auth from '@react-native-firebase/auth';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';


type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  MainTabs: undefined; // 👈 Đảm bảo thêm cái này để navigation.replace hiểu
};

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Login'>;
};

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Thông báo', 'Vui lòng nhập email và mật khẩu.');
      return;
    }

    try {
      await auth().signInWithEmailAndPassword(email, password);
      navigation.replace('MainTabs'); // 👈 Sau khi login thành công
    } catch (error: any) {
      Alert.alert('Lỗi đăng nhập', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <View style={styles.inputContainer}>
      <Icon name="account-circle" size={20} color="#666" style={styles.icon} />
        <TextInput
        
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
        />
      </View>

      <View style={styles.inputContainer}>
      <Icon name="email-lock" size={20} color="#888" style={styles.icon} />
        <TextInput
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={styles.input}
        />
      </View>

      <TouchableOpacity style={{ alignSelf: 'flex-end', marginBottom: 20 }}>
        <Text style={styles.forgot}>Forgot password?</Text>
      </TouchableOpacity>

      <Pressable style={styles.loginButton} onPress={handleLogin}>
        <LinearGradient
          colors={['#36d1dc', '#5b86e5', '#a65bf5']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        >
          <Text style={styles.loginText}>LOGIN</Text>
        </LinearGradient>
      </Pressable>

      <Text style={styles.orText}>Or Sign Up Using</Text>

      <View style={styles.socialContainer}>
        <Image
          source={{ uri: 'https://img.icons8.com/color/48/facebook-new.png' }}
          style={styles.socialIcon}
        />
        <Image
          source={{ uri: 'https://img.icons8.com/color/48/twitter--v1.png' }}
          style={styles.socialIcon}
        />
        <Image
          source={{ uri: 'https://img.icons8.com/color/48/google-logo.png' }}
          style={styles.socialIcon}
        />
      </View>

      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.orText}>Don't have an account? Register</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 30, justifyContent: 'center', backgroundColor: '#fff' },
  title: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginBottom: 40 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#ccc',
    marginBottom: 20,
    paddingBottom: 5,
  },
  icon: { marginRight: 10 },
  input: { flex: 1, fontSize: 16 },
  forgot: { color: '#999', fontSize: 14 },
  loginButton: { marginVertical: 20 },
  gradient: {
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
  },
  loginText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  orText: { textAlign: 'center', color: '#999', marginVertical: 20 },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  socialIcon: {
    width: 48,
    height: 48,
    marginHorizontal: 10,
  },
});
