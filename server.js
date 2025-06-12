const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost/game', { useNewUrlParser: true, useUnifiedTopology: true });

const UserSchema = new mongoose.Schema({
  name: { type: String, unique: true },
  password: String,
  dollars: { type: Number, default: 0 }
});
const User = mongoose.model('User', UserSchema);

const LicenseSchema = new mongoose.Schema({
  code: { type: String, unique: true },
  amount: Number,
  used: { type: Boolean, default: false }
});
const License = mongoose.model('License', LicenseSchema);

const SECRET = 'your_jwt_secret';

app.post('/api/signup', async (req, res) => {
  const { name, password } = req.body;
  try {
    const user = new User({ name, password });
    await user.save();
    const token = jwt.sign({ name }, SECRET);
    res.json({ message: 'ثبت‌نام موفق', token });
  } catch (err) {
    res.status(400).json({ message: 'نام تکراری است' });
  }
});

app.post('/api/login', async (req, res) => {
  const { name, password } = req.body;
  const user = await User.findOne({ name, password });
  if (!user) return res.status(400).json({ message: 'نام یا رمز اشتباه است' });
  const token = jwt.sign({ name }, SECRET);
  res.json({ message: 'ورود موفق', token });
});

app.post('/api/redeem', async (req, res) => {
  const { code } = req.body;
  const token = req.headers.authorization.split(' ')[1];
  const { name } = jwt.verify(token, SECRET);
  const license = await License.findOne({ code });
  if (!license || license.used) return res.status(400).json({ message: 'کد نامعتبر یا استفاده‌شده' });
  license.used = true;
  await license.save();
  const user = await User.findOne({ name });
  user.dollars += license.amount;
  await user.save();
  res.json({ message: 'کد با موفقیت فعال شد' });
});

app.post('/api/transfer', async (req, res) => {
  const { name, amount } = req.body;
  const token = req.headers.authorization.split(' ')[1];
  const { name: sender } = jwt.verify(token, SECRET);
  const senderUser = await User.findOne({ name: sender });
  const receiverUser = await User.findOne({ name });
  if (!receiverUser) return res.status(400).json({ message: 'کاربر مقصد یافت نشد' });
  if (senderUser.dollars < amount) return res.status(400).json({ message: 'موجودی کافی نیست' });
  senderUser.dollars -= amount;
  receiverUser.dollars += amount;
  await senderUser.save();
  await senderUser.save();
  res.json({ message: 'انتقال موفق' });
});

app.get('/api/leaderboard', async (req, res) => {
  const users = await User.find().sort({ dollars: -1 });
  res.json(users);
});

app.post('/api/admin/license', async (req, res) => {
  const { amount } = req.body;
  const code = crypto.randomBytes(8).toString('hex');
  const license = new License({ code, amount });
  await license.save();
  res.json({ message: 'کد ساخته شد', code });
});

app.delete('/api/admin/user/:name', async (req, res) => {
  await User.findOneAndDelete({ name: req.params.name });
  res.json({ message: 'کاربر حذف شد' });
});

app.listen(3000, () => console.log('Server running on port 3000'));
