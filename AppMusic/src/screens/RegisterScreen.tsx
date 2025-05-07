import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Pressable, Alert } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import auth from '@react-native-firebase/auth';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { showAlert } from '../utils/showAlert';  // Function to show alerts

type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

type RegisterScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Register'>;
};

const RegisterScreen = ({ navigation }: RegisterScreenProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    try {
      await auth().createUserWithEmailAndPassword(email, password);
      showAlert('Success', 'Đăng ký thành công!');
      navigation.navigate('Login');
    } catch (error: any) {
      console.log(error);  // Log the error to the console for debugging
      
      // Check if the error is 'email already in use'
      if (error.code === 'auth/email-already-in-use') {
        showAlert('Error', 'Email này đã được đăng ký. Vui lòng thử email khác.');
      } else {
        // For any other error, display a generic message
        showAlert('Error', error?.message || 'Đã có lỗi xảy ra');
      }
    }
  };
  
  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>

      {/* Email Input */}
      <View style={styles.inputContainer}>
        <Icon name="email-outline" size={20} color="#888" style={styles.icon} />
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
        />
      </View>

      {/* Password Input */}
      <View style={styles.inputContainer}>
        <Icon name="lock-outline" size={20} color="#888" style={styles.icon} />
        <TextInput
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={styles.input}
        />
      </View>

      <Pressable style={styles.button} onPress={handleRegister}>
        <LinearGradient colors={['#36d1dc', '#5b86e5']} style={styles.gradient}>
          <Text style={styles.buttonText}>REGISTER</Text>
        </LinearGradient>
      </Pressable>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.link}>Already have an account? Login</Text>
      </TouchableOpacity>
    </View>
  );
};

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
  button: { marginVertical: 20 },
  gradient: { paddingVertical: 14, borderRadius: 30, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  link: { color: '#999', textAlign: 'center', marginTop: 20 },
});

export default RegisterScreen;
