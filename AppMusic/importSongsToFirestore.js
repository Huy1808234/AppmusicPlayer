const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');

// 🔑 Load service account key
const serviceAccount = require('./serviceAccountKey.json');

// 🔥 Init Firestore
initializeApp({
  credential: cert(serviceAccount)
});
const db = getFirestore();

// 📥 Load JSON file
const songs = JSON.parse(fs.readFileSync('./assets/data/library.json', 'utf-8'));

// 🚀 Import to Firestore
async function importTracks() {
  const batch = db.batch();
  const tracksRef = db.collection('tracks'); // ✅ Đổi từ 'songs' → 'tracks'

  songs.forEach(song => {
    const docRef = tracksRef.doc(song.id);
    batch.set(docRef, {
      id: song.id,
      title: song.title,
      artist: song.artist || '',
      url: song.url,
      artwork: song.artwork || '',
      rating: song.rating || 0,
      playlist: song.playlist || [],
      views: 0,     
      likes: 0,
      rating: 0, 
    });
  });

  await batch.commit();
  console.log('✅ Đã import lên Firestore collection `tracks` thành công!');
}

importTracks();
