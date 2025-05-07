const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const serviceAccount = require('./serviceAccountKey.json');

// ✅ Init Firebase Admin
initializeApp({
  credential: cert(serviceAccount)
});
const db = getFirestore();

// 🛠️ Hàm migrate
async function migratePlaylists(userId) {
  const playlistsRef = db.collection('users').doc(userId).collection('playlists');
  const snapshot = await playlistsRef.get();

  for (const doc of snapshot.docs) {
    const data = doc.data();
    const oldTracks = data.tracks;

    if (!Array.isArray(oldTracks)) continue;

    const newTracks = oldTracks.map(track =>
      typeof track === 'object' && track.id ? track.id : track
    );

    await playlistsRef.doc(doc.id).update({ tracks: newTracks });
    console.log(`✅ Migrated playlist: ${doc.id}`);
  }

  console.log('🎉 Hoàn tất chuyển đổi tracks về dạng id!');
}

// 👉 Nhập đúng UID người dùng:
migratePlaylists('NBCzYoWfufRINvysxEx15QdLhGQ2');
