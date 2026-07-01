import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

type AuthStackParamList = {
  ForgotPassword: undefined;
  Login: undefined;
};

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'ForgotPassword'>;
};

export default function ForgotPasswordScreen({navigation}: Props) {
  const [email, setEmail] = useState('');

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert('Thông báo', 'Vui lòng nhập email.');
      return;
    }

    try {
      await auth().sendPasswordResetEmail(email);
      Alert.alert(
        'Thành công',
        'Email đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư.',
      );
      navigation.navigate('Login');
    } catch (error: any) {
      Alert.alert(
        'Lỗi',
        error?.message || 'Không thể gửi email đặt lại mật khẩu.',
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Khôi phục mật khẩu</Text>

      <View style={styles.inputContainer}>
        <Icon name="email-outline" size={20} color="#888" style={styles.icon} />
        <TextInput
          placeholder="Nhập email của bạn"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleResetPassword}>
        <LinearGradient colors={['#36d1dc', '#5b86e5']} style={styles.gradient}>
          <Text style={styles.buttonText}>GỬI YÊU CẦU</Text>
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.back}>← Quay lại đăng nhập</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 30,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#ccc',
    marginBottom: 30,
    paddingBottom: 5,
  },
  icon: {marginRight: 10},
  input: {flex: 1, fontSize: 16},
  button: {marginVertical: 20},
  gradient: {paddingVertical: 14, borderRadius: 30, alignItems: 'center'},
  buttonText: {color: '#fff', fontSize: 16, fontWeight: 'bold'},
  back: {textAlign: 'center', color: '#666', marginTop: 20},
});
