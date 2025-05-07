// src/services/authService.ts
import auth from '@react-native-firebase/auth';

export const logout = async (
  onSuccess?: () => void,
  onError?: (err: any) => void
) => {
  try {
    const user = auth().currentUser;

    if (!user) {
      console.warn(' No user currently signed in');
      onSuccess?.();
      return;
    }

    await auth().signOut();
    console.log('Đã đăng xuất');
    onSuccess?.();
  } catch (err) {
    console.error('Logout error', err);
    onError?.(err);
  }
};
