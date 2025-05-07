const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');

const serviceAccount = require('./firebaseServiceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const app = express();
app.use(cors());
app.use(express.json());

// GET
app.get('/tracks', async (req, res) => {
  const snapshot = await db.collection('tracks').get();
  const tracks = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  res.json(tracks);
});

// POST
app.post('/tracks', async (req, res) => {
  const { title, artist, url, artwork } = req.body;

  if (!title || !artist || !url || !artwork) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  try {
    // Lấy tất cả tracks để tìm ID lớn nhất
    const snapshot = await db.collection('tracks').get();
    const ids = snapshot.docs
      .map(doc => parseInt(doc.id))
      .filter(n => !isNaN(n));

    const nextId = ids.length > 0 ? Math.max(...ids) + 1 : 1;

    // Tạo track mới
    await db.collection('tracks').doc(String(nextId)).set({
      title,
      artist,
      url,
      artwork,
    });

    res.status(201).json({ id: nextId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Add failed' });
  }
});
app.delete('/tracks', async (req, res) => {
  try {
    const snapshot = await db.collection('tracks').get();
    const batch = db.batch();

    snapshot.forEach(doc => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    res.json({ success: true, deleted: snapshot.size });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Delete all failed' });
  }
});

  
// PUT
app.put('/tracks/:id', async (req, res) => {
  const { id } = req.params;
  await db.collection('tracks').doc(id).update(req.body);
  res.json({ success: true });
});

// DELETE
app.delete('/tracks/:id', async (req, res) => {
  const { id } = req.params;
  await db.collection('tracks').doc(id).delete();
  res.json({ success: true });
});

app.listen(3000, () => console.log('✅ Backend running at http://localhost:3000'));
