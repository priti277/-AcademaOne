const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Middleware to verify JWT and set req.user
function auth(req, res, next) {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ msg: 'No token, auth denied' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ msg: 'Token invalid' });
  }
}

// Admin: Get all attendance
router.get('/', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ msg: 'Forbidden' });
  const records = await Attendance.find().populate('student', 'name username');
  res.json(records);
});

// Student: Get own attendance
router.get('/me', auth, async (req, res) => {
  if (req.user.role !== 'student') return res.status(403).json({ msg: 'Forbidden' });
  const records = await Attendance.find({ student: req.user.id });
  res.json(records);
});

// Admin: Add attendance
router.post('/', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ msg: 'Forbidden' });
  const { studentId, date, status } = req.body;
  if (!studentId || !date || !status) return res.status(400).json({ msg: 'All fields required' });
  try {
    const att = new Attendance({ student: studentId, date, status });
    await att.save();
    res.status(201).json(att);
  } catch {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Admin: Edit attendance
router.put('/:id', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ msg: 'Forbidden' });
  const { date, status } = req.body;
  try {
    const att = await Attendance.findByIdAndUpdate(req.params.id, { date, status }, { new: true });
    if (!att) return res.status(404).json({ msg: 'Not found' });
    res.json(att);
  } catch {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Admin: Delete attendance
router.delete('/:id', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ msg: 'Forbidden' });
  try {
    const att = await Attendance.findByIdAndDelete(req.params.id);
    if (!att) return res.status(404).json({ msg: 'Not found' });
    res.json({ msg: 'Deleted' });
  } catch {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
