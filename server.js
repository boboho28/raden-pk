const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const { MongoClient } = require('mongodb');

const app = express();
app.use(express.json());
app.use(cors({ origin: '*' })); // Ganti '*' dengan domain frontend saat deploy

const uri = 'mongodb://localhost:27017'; // Ganti dengan URI MongoDB Atlas jika digunakan
const client = new MongoClient(uri);
const dbName = 'memoApp';
const SECRET_KEY = 'your-secret-key'; // Ganti dengan kunci rahasia yang kuat

async function connectDB() {
  await client.connect();
  return client.db(dbName);
}

function authenticateToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token diperlukan!' });
  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ message: 'Token tidak valid!' });
    req.user = user;
    next();
  });
}

app.post('/api/register', async (req, res) => {
  const { email, password, username } = req.body;
  const db = await connectDB();
  const existingUser = await db.collection('users').findOne({ email });
  if (existingUser) return res.status(400).json({ message: 'Email sudah terdaftar!' });
  const hashedPassword = await bcrypt.hash(password, 10);
  await db.collection('users').insertOne({ email, password: hashedPassword, username: username || email.split('@')[0], profilePicture: '' });
  res.status(201).json({ message: 'Pendaftaran berhasil!' });
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const db = await connectDB();
  const user = await db.collection('users').findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Email atau kata sandi salah!' });
  }
  const token = jwt.sign({ email: user.email }, SECRET_KEY, { expiresIn: '1h' });
  res.json({ token, user: { email: user.email, username: user.username, profilePicture: user.profilePicture } });
});

app.get('/api/menus', authenticateToken, async (req, res) => {
  const db = await connectDB();
  const menus = await db.collection('menus').find({ userEmail: req.user.email }).toArray();
  res.json(menus.map(m => m.name));
});

app.post('/api/menus', authenticateToken, async (req, res) => {
  const { name } = req.body;
  const db = await connectDB();
  const existingMenu = await db.collection('menus').findOne({ userEmail: req.user.email, name });
  if (existingMenu) return res.status(400).json({ message: 'Menu sudah ada!' });
  await db.collection('menus').insertOne({ userEmail: req.user.email, name });
  res.json({ message: 'Menu berhasil ditambahkan!' });
});

app.delete('/api/menus/:name', authenticateToken, async (req, res) => {
  const { name } = req.params;
  const db = await connectDB();
  await db.collection('menus').deleteOne({ userEmail: req.user.email, name });
  await db.collection('memos').deleteMany({ userEmail: req.user.email, category: name });
  res.json({ message: 'Menu berhasil dihapus!' });
});

app.get('/api/memos/:category', authenticateToken, async (req, res) => {
  const { category } = req.params;
  const db = await connectDB();
  const memos = await db.collection('memos').find({ userEmail: req.user.email, category }).toArray();
  res.json(memos);
});

app.post('/api/memos', authenticateToken, async (req, res) => {
  const { id, title, originalTitle, description, category } = req.body;
  const db = await connectDB();
  const now = new Date();
  const formattedDate = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;
  const memo = { userEmail: req.user.email, category, title, originalTitle, description, date: formattedDate, status: '✓' };
  if (id) {
    await db.collection('memos').updateOne({ id, userEmail: req.user.email }, { $set: memo });
  } else {
    memo.id = Date.now().toString();
    await db.collection('memos').insertOne(memo);
  }
  res.json({ message: 'Memo berhasil disimpan!' });
});

app.delete('/api/memos/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const db = await connectDB();
  await db.collection('memos').deleteOne({ id, userEmail: req.user.email });
  res.json({ message: 'Memo berhasil dihapus!' });
});

app.post('/api/profile/picture', authenticateToken, async (req, res) => {
  const { profilePicture } = req.body;
  const db = await connectDB();
  await db.collection('users').updateOne({ email: req.user.email }, { $set: { profilePicture } });
  res.json({ message: 'Foto profil berhasil diperbarui!' });
});

app.post('/api/profile/username', authenticateToken, async (req, res) => {
  const { username } = req.body;
  const db = await connectDB();
  const existingUser = await db.collection('users').findOne({ username, email: { $ne: req.user.email } });
  if (existingUser) return res.status(400).json({ message: 'Username sudah digunakan!' });
  await db.collection('users').updateOne({ email: req.user.email }, { $set: { username } });
  res.json({ message: 'Username berhasil diperbarui!' });
});

app.get('/api/export', authenticateToken, async (req, res) => {
  const db = await connectDB();
  const user = await db.collection('users').findOne({ email: req.user.email });
  const menus = await db.collection('menus').find({ userEmail: req.user.email }).toArray();
  const memos = await db.collection('memos').find({ userEmail: req.user.email }).toArray();
  res.json({ user, menus: menus.map(m => m.name), memos });
});

app.post('/api/import', authenticateToken, async (req, res) => {
  const { user, menus, memos } = req.body;
  const db = await connectDB();
  await db.collection('users').updateOne({ email: req.user.email }, { $set: { username: user.username, profilePicture: user.profilePicture } });
  await db.collection('menus').deleteMany({ userEmail: req.user.email });
  await db.collection('memos').deleteMany({ userEmail: req.user.email });
  if (menus.length) await db.collection('menus').insertMany(menus.map(name => ({ userEmail: req.user.email, name })));
  if (memos.length) await db.collection('memos').insertMany(memos.map(memo => ({ ...memo, userEmail: req.user.email })));
  res.json({ message: 'Data berhasil diimpor!' });
});

app.listen(3000, () => console.log('Server berjalan di port 3000'));
