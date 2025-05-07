// SongsStack.tsx
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SongsScreen from '../screens/SongsScreen';
import PlayerScreen from '../screens/PlayerScreen';

const Stack = createNativeStackNavigator();

export default function SongsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SongsHome" component={SongsScreen} />
      <Stack.Screen name="PlayerScreen" component={PlayerScreen} />
    </Stack.Navigator>
  );
}
