const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function resetLikesForAllTracks() {
  const snapshot = await db.collection('tracks').get();

  const batch = db.batch();

  snapshot.forEach(doc => {
    const ref = db.collection('tracks').doc(doc.id);
    batch.update(ref, { likes: 0 });
  });

  await batch.commit();
  console.log(` Đã reset likes cho ${snapshot.size} bài hát.`);
}

resetLikesForAllTracks().catch(console.error);
