const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Connection string
const MONGO_URI = 'mongodb://localhost:27017/attendance_db';

console.log('🔍 Testing MongoDB Connection and Data Saving...\n');

// Define schemas
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'admin'], required: true },
  email: { type: String, required: false },
  createdAt: { type: Date, default: Date.now }
});

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  class: { type: String, required: true },
  contact: { type: String },
  attendanceRate: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Student = mongoose.model('Student', studentSchema);

async function testDataSaving() {
  try {
    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000
    });
    console.log('✅ Connected to MongoDB\n');

    // Create test user
    const username = 'testuser_' + Date.now();
    console.log('👤 Creating test user:', username);
    
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const newUser = await User.create({
      name: 'Test User ' + Date.now(),
      username: username,
      password: hashedPassword,
      role: 'student',
      email: 'test@example.com'
    });
    
    console.log('✅ User created successfully!');
    console.log('   User ID:', newUser._id);
    console.log('   Name:', newUser.name);
    console.log('   Username:', newUser.username);
    console.log('   Role:', newUser.role);
    console.log('   Email:', newUser.email);

    // Create corresponding student record
    console.log('\n📚 Creating student record...');
    
    const newStudent = await Student.create({
      name: newUser.name,
      username: newUser.username,
      class: '10A',
      contact: '9876543210'
    });
    
    console.log('✅ Student record created successfully!');
    console.log('   Student ID:', newStudent._id);
    console.log('   Class:', newStudent.class);
    console.log('   Contact:', newStudent.contact);

    // Verify data in database
    console.log('\n🔍 Verifying data in MongoDB...');
    
    const userCount = await User.countDocuments();
    const studentCount = await Student.countDocuments();
    
    console.log('📊 Database Stats:');
    console.log('   Total Users:', userCount);
    console.log('   Total Students:', studentCount);

    // Fetch and display the saved user
    console.log('\n📥 Fetching saved user from database...');
    const fetchedUser = await User.findOne({ username: username });
    if (fetchedUser) {
      console.log('✅ User found in database!');
      console.log('   Name:', fetchedUser.name);
      console.log('   Role:', fetchedUser.role);
    } else {
      console.log('❌ User not found in database!');
    }

    // Fetch and display the saved student
    console.log('\n📥 Fetching saved student from database...');
    const fetchedStudent = await Student.findOne({ username: username });
    if (fetchedStudent) {
      console.log('✅ Student found in database!');
      console.log('   Name:', fetchedStudent.name);
      console.log('   Class:', fetchedStudent.class);
    } else {
      console.log('❌ Student not found in database!');
    }

    console.log('\n🎉 All tests completed successfully!');
    console.log('✅ Data is being saved to MongoDB properly!\n');

    await mongoose.connection.close();
    process.exit(0);
    
  } catch (err) {
    console.error('\n❌ Error:', err.message);
    console.error('\n📍 Troubleshooting tips:');
    console.error('   1. Make sure MongoDB is running (mongod)');
    console.error('   2. Check if connection string is correct');
    console.error('   3. Verify database credentials');
    process.exit(1);
  }
}

testDataSaving();
