const admin = require('firebase-admin');
const path = require('path');

const keyLocation = process.env.FIREBASE_KEY_PATH || '../../firebaseServiceAccountKey.json';
const serviceAccountPath = path.resolve(__dirname, keyLocation);
const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

module.exports = { db, admin };
