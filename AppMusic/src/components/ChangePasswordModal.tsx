// components/ChangePasswordModal.tsx
import React, {useState} from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import auth from '@react-native-firebase/auth';
import {Alert} from 'react-native';

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function ChangePasswordModal({visible, onClose}: Props) {
  const [current, setCurrent] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);
  const [show3, setShow3] = useState(false);

  const reauthenticate = async (password: string) => {
    const user = auth().currentUser;
    if (user?.email) {
      const cred = auth.EmailAuthProvider.credential(user.email, password);
      return user.reauthenticateWithCredential(cred);
    }
  };

  const handleConfirm = async () => {
    if (!current || !newPass || !confirm) return;
    if (newPass !== confirm) {
      Alert.alert('Lỗi', 'Mật khẩu mới không trùng khớp');
      return;
    }

    try {
      await reauthenticate(current);
      await auth().currentUser?.updatePassword(newPass);
      Alert.alert('Đổi mật khẩu thành công!');
      onClose();
    } catch (err: any) {
      Alert.alert('Lỗi: ' + err.message);
    }
  };

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Thay đổi mật khẩu</Text>

          <View style={styles.inputWrapper}>
            <Icon name="lock-outline" size={20} color="#aaa" />
            <TextInput
              placeholder="Mật khẩu hiện tại"
              placeholderTextColor="#aaa"
              secureTextEntry={!show1}
              style={styles.input}
              onChangeText={setCurrent}
              value={current}
            />
            <TouchableOpacity onPress={() => setShow1(!show1)}>
              <Icon name={show1 ? 'eye-off' : 'eye'} size={20} color="#aaa" />
            </TouchableOpacity>
          </View>

          <View style={styles.inputWrapper}>
            <Icon name="lock-reset" size={20} color="#aaa" />
            <TextInput
              placeholder="Mật khẩu mới"
              placeholderTextColor="#aaa"
              secureTextEntry={!show2}
              style={styles.input}
              onChangeText={setNewPass}
              value={newPass}
            />
            <TouchableOpacity onPress={() => setShow2(!show2)}>
              <Icon name={show2 ? 'eye-off' : 'eye'} size={20} color="#aaa" />
            </TouchableOpacity>
          </View>

          <View style={styles.inputWrapper}>
            <Icon name="lock-check" size={20} color="#aaa" />
            <TextInput
              placeholder="Xác nhận mật khẩu mới"
              placeholderTextColor="#aaa"
              secureTextEntry={!show3}
              style={styles.input}
              onChangeText={setConfirm}
              value={confirm}
            />
            <TouchableOpacity onPress={() => setShow3(!show3)}>
              <Icon name={show3 ? 'eye-off' : 'eye'} size={20} color="#aaa" />
            </TouchableOpacity>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={{color: '#fff'}}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
              <Text style={{color: '#fff'}}>Xác nhận</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: '#2c253d',
    padding: 20,
    borderRadius: 12,
  },
  title: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3c3450',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    color: '#fff',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  cancelBtn: {
    backgroundColor: '#444',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  confirmBtn: {
    backgroundColor: '#a56eff',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
});
