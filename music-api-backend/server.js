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
    const { id, title, artist, url, artwork } = req.body;
  
    if (!id) return res.status(400).json({ error: 'ID is required' });
  
    const docRef = db.collection('tracks').doc(id);
  
    // Kiểm tra trùng ID
    const existing = await docRef.get();
    if (existing.exists) {
      return res.status(400).json({ error: 'ID already exists' });
    }
  
    await docRef.set({ id, title, artist, url, artwork });
    res.status(201).json({ id });
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
