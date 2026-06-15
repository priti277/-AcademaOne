require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB - with proper error handling

let dbConnected = false;
connectDB().then(() => {
  dbConnected = true;
  console.log('🚀 Server ready for requests');
}).catch(err => {
  console.error('Failed to connect to database:', err);
});

// Import models
const User = require('./models/User');
const Student = require('./models/Student');
const Attendance = require('./models/Attendance');

// Import routes
const authRoutes = require('./routes/auth');

// Use routes
app.use('/api/auth', authRoutes);

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    dbConnected: mongoose.connection.readyState === 1,
    timestamp: new Date().toISOString()
  });
});

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const jwt = require('jsonwebtoken');
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Student Routes
app.get('/api/students', authenticateToken, async (req, res) => {
  try {
    const students = await Student.find();
    res.json({ success: true, students });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
});

app.post('/api/students', authenticateToken, async (req, res) => {
  try {
    const { name, username, class: studentClass, contact } = req.body;

    // Check if student already exists
    const existingStudent = await Student.findOne({ username });
    if (existingStudent) {
      return res.status(400).json({ success: false, message: 'Username already exists' });
    }

    const student = new Student({
      name,
      username,
      class: studentClass,
      contact,
      attendanceRate: 0
    });

    await student.save();
    res.status(201).json({ success: true, student });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
});

app.put('/api/students/:id', authenticateToken, async (req, res) => {
  try {
    const { name, username, class: studentClass, contact } = req.body;
    
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { name, username, class: studentClass, contact },
      { new: true }
    );

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    res.json({ success: true, student });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
});

app.delete('/api/students/:id', authenticateToken, async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Also delete attendance records for this student
    await Attendance.deleteMany({ studentId: req.params.id });

    res.json({ success: true, message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
});

// Attendance Routes
app.get('/api/attendance', authenticateToken, async (req, res) => {
  try {
    const { date, class: studentClass, studentId } = req.query;
    
    let filter = {};
    if (date) filter.date = new Date(date);
    if (studentClass) filter.class = studentClass;
    if (studentId) filter.studentId = studentId;

    const attendance = await Attendance.find(filter).populate('studentId', 'name username');
    res.json({ success: true, attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
});

app.post('/api/attendance', authenticateToken, async (req, res) => {
  try {
    const { date, class: studentClass, attendanceRecords } = req.body;

    // Delete existing attendance for this date and class
    await Attendance.deleteMany({ 
      date: new Date(date), 
      class: studentClass 
    });

    // Create new attendance records
    const records = await Attendance.insertMany(
      attendanceRecords.map(record => ({
        studentId: record.studentId,
        studentName: record.studentName,
        class: studentClass,
        date: new Date(date),
        status: record.status
      }))
    );

    // Update attendance rates for students
    await updateAttendanceRates();

    res.status(201).json({ success: true, records });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
});

// Update attendance rates for all students
async function updateAttendanceRates() {
  try {
    const students = await Student.find();
    
    for (const student of students) {
      const attendanceRecords = await Attendance.find({ studentId: student._id });
      const totalRecords = attendanceRecords.length;
      const presentRecords = attendanceRecords.filter(a => a.status === 'present').length;
      
      const attendanceRate = totalRecords > 0 ? Math.round((presentRecords / totalRecords) * 100) : 0;
      
      await Student.findByIdAndUpdate(student._id, { attendanceRate });
    }
  } catch (error) {
    console.error('Error updating attendance rates:', error);
  }
}

// Reports Routes
app.get('/api/reports/monthly', authenticateToken, async (req, res) => {
  try {
    const { month, year } = req.query;
    
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    const students = await Student.find();
    const report = [];

    for (const student of students) {
      const attendanceRecords = await Attendance.find({
        studentId: student._id,
        date: { $gte: startDate, $lte: endDate }
      });

      const present = attendanceRecords.filter(a => a.status === 'present').length;
      const absent = attendanceRecords.filter(a => a.status === 'absent').length;
      const late = attendanceRecords.filter(a => a.status === 'late').length;
      const total = attendanceRecords.length;
      const attendanceRate = total > 0 ? Math.round((present / total) * 100) : 0;

      report.push({
        student: student.name,
        class: student.class,
        present,
        absent,
        late,
        attendanceRate
      });
    }

    res.json({ success: true, report });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});