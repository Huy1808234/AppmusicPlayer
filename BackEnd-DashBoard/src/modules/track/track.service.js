const { db } = require('../../config/firebase');

const COLLECTION_NAME = 'tracks';

const getTracks = async () => {
  const snapshot = await db.collection(COLLECTION_NAME).get();
  return snapshot.docs.map((doc) => ({ _id: doc.id, ...doc.data() }));
};

const createTrack = async (data) => {
  const snapshot = await db.collection(COLLECTION_NAME).get();
  const ids = snapshot.docs
    .map((doc) => parseInt(doc.id, 10))
    .filter((n) => !isNaN(n));

  const nextId = ids.length > 0 ? Math.max(...ids) + 1 : 1;

  await db.collection(COLLECTION_NAME).doc(String(nextId)).set({
    title: data.title,
    artist: data.artist,
    url: data.url,
    artwork: data.artwork,
  });

  return nextId;
};

const updateTrack = async (_id, data) => {
  await db.collection(COLLECTION_NAME).doc(String(_id)).update(data);
  return true;
};

const deleteTrack = async (_id) => {
  await db.collection(COLLECTION_NAME).doc(String(_id)).delete();
  return true;
};

const deleteAllTracks = async () => {
  const snapshot = await db.collection(COLLECTION_NAME).get();
  const batch = db.batch();

  snapshot.forEach((doc) => {
    batch.delete(doc.ref);
  });

  await batch.commit();
  return snapshot.size;
};

module.exports = {
  getTracks,
  createTrack,
  updateTrack,
  deleteTrack,
  deleteAllTracks,
};
