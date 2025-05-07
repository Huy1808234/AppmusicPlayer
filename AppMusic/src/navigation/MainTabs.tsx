// src/navigation/MainTabs.tsx
import React, { useEffect, useState } from 'react';
import { Keyboard, StyleSheet, Animated } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCurrentTrack } from '../context/CurrentTrackContext';
import ArtistDetailScreen from '../screens/ArtistDetailScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
// Screens

import ArtistsScreen from '../screens/ArtistsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import PlayerScreen from '../screens/PlayerScreen';
import MiniPlayer from '../components/MiniPlayer';
import PlaylistsScreen from '../screens/PlaylistsScreen';
// Stacks
import PlaylistsStack from './PlaylistsStack';
import SongsStack from './SongsStack';
import PlaylistDetailScreen from '../screens/PlaylistDetailScreen'; 


const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const TAB_BAR_HEIGHT = 60;

function BottomTabs() {
  const { currentTrack } = useCurrentTrack();
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const insets = useSafeAreaInsets();
  const [animation] = useState(new Animated.Value(0));

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => setIsKeyboardVisible(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => setIsKeyboardVisible(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  useEffect(() => {
    Animated.timing(animation, {
      toValue: currentTrack ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [currentTrack]);

  const translateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [100, 0],
  });

  return (
    <>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#FF3B30',
          tabBarInactiveTintColor: '#B0B0B0',
          tabBarStyle: {
            display: isKeyboardVisible ? 'none' : 'flex',
            height: TAB_BAR_HEIGHT + insets.bottom,
            backgroundColor: '#111',
            borderTopWidth: 0,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
          },
        }}
      >
        <Tab.Screen
          name="Songs"
          component={SongsStack}
          options={{
            tabBarIcon: ({ color }) => <Icon name="music" color={color} size={24} />,
          }}
        />
        <Tab.Screen
          name="Artists"
          component={ArtistsScreen}
          options={{
            tabBarIcon: ({ color }) => <Icon name="account-music" color={color} size={24} />,
          }}
        />
      
        <Tab.Screen
          name="Playlists"
          component={PlaylistsStack}
          options={{
            tabBarIcon: ({ color }) => <Icon name="playlist-music" color={color} size={24} />,
          }}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            tabBarIcon: ({ color }) => <Icon name="account-circle" color={color} size={24} />,
          }}
        />
      </Tab.Navigator>

      {currentTrack && (
        <Animated.View
          style={[
            styles.miniPlayerWrapper,
            {
              bottom: TAB_BAR_HEIGHT + insets.bottom,
              transform: [{ translateY }],
              opacity: animation,
            },
          ]}
        >
          <MiniPlayer />
        </Animated.View>
      )}
    </>
  );
}

export default function MainTabs() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabsRoot" component={BottomTabs} />
      <Stack.Screen name="PlayerScreen" component={PlayerScreen} />
      <Stack.Screen name="ArtistDetail" component={ArtistDetailScreen} /> 
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="PlaylistsScreen" component={PlaylistsScreen} />
      <Stack.Screen
    name="PlaylistDetailScreen"
    component={PlaylistDetailScreen}
    options={{ headerShown: false }} // tùy bạn
  />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  miniPlayerWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 100,
  },
});
