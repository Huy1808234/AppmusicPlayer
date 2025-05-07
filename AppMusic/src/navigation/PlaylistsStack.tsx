// src/navigation/PlaylistsStack.tsx
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PlaylistsScreen from '../screens/PlaylistsScreen';
import PlaylistDetailScreen from '../screens/PlaylistDetailScreen';

const Stack = createNativeStackNavigator();

export default function PlaylistsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PlaylistsHome" component={PlaylistsScreen} />
      <Stack.Screen name="PlaylistDetailScreen" component={PlaylistDetailScreen} />
    </Stack.Navigator>
  );
}
