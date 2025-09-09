const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

const User = require('../models/User');

const router = express.Router();

router.post('/register',
  body('email').isEmail(),
  body('password').isLength({min:6}),
  async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, email, password, phone, farmLocation } = req.body;
    if(await User.findOne({ email })) return res.status(400).json({ message: 'Email exists' });

    const passwordHash = await bcrypt.hash(password, 12);
    const user = new User({ name, email, passwordHash, phone, farmLocation });
    await user.save();
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if(!user) return res.status(400).json({ message: 'Invalid credentials' });
  const match = await bcrypt.compare(password, user.passwordHash);
  if(!match) return res.status(400).json({ message: 'Invalid credentials' });

  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
  res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, vipExpires: user.vipExpires } });
});

module.exports = router;
