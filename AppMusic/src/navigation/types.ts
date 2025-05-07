import type { Track } from 'react-native-track-player'; 

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  MainTabs: undefined;
  PlayerScreen: { track: Track }; 
  
  Artist: undefined;
  ArtistDetail: { artist: string; artwork: string | null };
  Category: undefined; 

  PlaylistDetailScreen: {
    name: string;
    trackIds: string[];
  };
  EditProfile: undefined;
  PlaylistsScreen: undefined;

};

export type MainTabsParamList = {
  Songs: undefined;
  Artists: undefined;
  Favorites: undefined;
  Playlists: undefined;
  Profile: undefined;
  
};
