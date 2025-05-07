import firestore from '@react-native-firebase/firestore';
import { Track } from 'react-native-track-player';

export const getTracksFromIds = async (ids: string[]): Promise<Track[]> => {
  if (ids.length === 0) return [];

  const promises = ids.map(id =>
    firestore().collection('tracks').doc(id).get()
  );

  const docs = await Promise.all(promises);

  return docs
    .filter(doc => doc.exists)
    .map(doc => {
      const data = doc.data();
      return {
        id: data?.id,
        title: data?.title || 'Untitled',
        artist: data?.artist || 'Unknown Artist',
        url: data?.url,
        artwork: data?.artwork || '',
      } as Track;
    });
};
