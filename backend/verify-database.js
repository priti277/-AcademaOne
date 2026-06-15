#!/usr/bin/env node

/**
 * VERIFICATION SCRIPT
 * This script verifies that MongoDB is storing data correctly
 * Run this to check if everything is working
 */

const mongoose = require('mongoose');
const path = require('path');

// Read .env
require('dotenv').config({ path: path.join(__dirname, '.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/attendance_db';

console.log('\n' + '='.repeat(60));
console.log('   DATABASE VERIFICATION TEST');
console.log('='.repeat(60) + '\n');

async function verify() {
  try {
    console.log('📡 Connecting to MongoDB...');
    console.log(`   URI: ${MONGO_URI}\n`);
    
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000
    });

    console.log('✅ Connected to MongoDB\n');

    // Get database stats
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    console.log('📊 DATABASE COLLECTIONS:\n');
    
    for (const collection of collections) {
      const coll = db.collection(collection.name);
      const count = await coll.countDocuments();
      console.log(`   📂 ${collection.name}: ${count} documents`);
    }

    // Get user details
    console.log('\n👥 USERS COLLECTION:');
    const usersCollection = db.collection('users');
    const users = await usersCollection.find().limit(5).toArray();
    
    if (users.length === 0) {
      console.log('   ℹ️  No users yet. Register through the frontend or API.');
    } else {
      console.log(`   Found ${users.length} users:\n`);
      users.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.name} (${user.username}) - Role: ${user.role}`);
      });
    }

    // Get student details
    console.log('\n📚 STUDENTS COLLECTION:');
    const studentsCollection = db.collection('students');
    const students = await studentsCollection.find().limit(5).toArray();
    
    if (students.length === 0) {
      console.log('   ℹ️  No students yet. Register as a student through the frontend.');
    } else {
      console.log(`   Found ${students.length} students:\n`);
      students.forEach((student, index) => {
        console.log(`   ${index + 1}. ${student.name} - Class: ${student.class}`);
      });
    }

    // Get attendance details
    console.log('\n📋 ATTENDANCE COLLECTION:');
    const attendanceCollection = db.collection('attendances');
    const attendance = await attendanceCollection.find().limit(5).toArray();
    
    if (attendance.length === 0) {
      console.log('   ℹ️  No attendance records yet. Mark attendance from admin panel.');
    } else {
      console.log(`   Found ${attendance.length} attendance records:\n`);
      attendance.forEach((record, index) => {
        console.log(`   ${index + 1}. ${record.studentName} - Status: ${record.status} (${record.date})`);
      });
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ DATABASE VERIFICATION COMPLETE');
    console.log('='.repeat(60) + '\n');

    console.log('ℹ️  INSTRUCTIONS:');
    console.log('1. Make sure backend server is running: node server.js');
    console.log('2. Open frontend in browser: frontend/index.html');
    console.log('3. Register a new user and watch data appear here');
    console.log('4. Run this script again to see the new data\n');

    await mongoose.connection.close();
    process.exit(0);
    
  } catch (err) {
    console.error('\n❌ ERROR:', err.message);
    console.error('\nTroubleshooting:');
    console.error('1. Make sure MongoDB is running: mongod');
    console.error('2. Check .env file has correct MONGO_URI');
    console.error('3. Check MongoDB is accessible on localhost:27017\n');
    process.exit(1);
  }
}

verify();
