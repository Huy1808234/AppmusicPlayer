import React, { createContext, useContext, useState } from 'react';
import { Track } from 'react-native-track-player';

type ContextType = {
  currentTrack: Track | null;
  setCurrentTrack: (track: Track) => void;
  favoriteTrackIds: string[];
  toggleFavorite: (trackId: string) => void;
};

const CurrentTrackContext = createContext<ContextType>({
  currentTrack: null,
  setCurrentTrack: () => {},
  favoriteTrackIds: [],
  toggleFavorite: () => {},
});

export const useCurrentTrack = () => useContext(CurrentTrackContext);

export const CurrentTrackProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [favoriteTrackIds, setFavoriteTrackIds] = useState<string[]>([]);

  const toggleFavorite = (trackId: string) => {
    setFavoriteTrackIds(prev =>
      prev.includes(trackId)
        ? prev.filter(id => id !== trackId)
        : [...prev, trackId]
    );
  };

  return (
    <CurrentTrackContext.Provider
      value={{ currentTrack, setCurrentTrack, favoriteTrackIds, toggleFavorite }}
    >
      {children}
    </CurrentTrackContext.Provider>
  );
};
