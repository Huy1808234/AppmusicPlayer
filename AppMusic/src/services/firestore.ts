import firestore from '@react-native-firebase/firestore';
import { Track } from 'react-native-track-player';

export const fetchTracksFromFirestore = async (): Promise<Track[]> => {
  const snapshot = await firestore().collection('tracks').get();

  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: data.id.toString(),
      title: data.title || 'Untitled',
      artist: data.artist || 'Unknown Artist',
      url: data.url,
      artwork: data.artwork || '',
    } as Track;
  });
};
