const http = require('http');
const https = require('https');

console.log('🧪 Testing Backend API Endpoints...\n');

// Function to make HTTP requests
function makeRequest(options, data) {
  return new Promise((resolve, reject) => {
    const protocol = options.protocol === 'https' ? https : http;
    const req = protocol.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: JSON.parse(body)
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: body
          });
        }
      });
    });
    
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function runTests() {
  try {
    console.log('🌐 Testing API on http://localhost:5000\n');

    // Test 1: Health check
    console.log('1️⃣  Testing Health Endpoint...');
    try {
      const healthRes = await makeRequest({
        hostname: 'localhost',
        port: 5000,
        path: '/api/health',
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      console.log(`   Status: ${healthRes.status}`);
      console.log(`   DB Connected: ${healthRes.body.dbConnected}`);
      console.log('   ✅ Health check passed\n');
    } catch (e) {
      console.log('   ❌ Failed:', e.message);
      console.log('   Make sure the backend server is running on port 5000\n');
      process.exit(1);
    }

    // Test 2: Register User
    console.log('2️⃣  Testing User Registration...');
    const username = 'testuser_' + Date.now();
    const userData = {
      name: 'Test User Registration',
      username: username,
      password: 'testpass123',
      email: 'apitest@example.com',
      role: 'student',
      class: '10A'
    };

    const registerRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, userData);

    console.log(`   Status: ${registerRes.status}`);
    console.log(`   Response: ${JSON.stringify(registerRes.body, null, 4)}`);
    
    if (registerRes.status === 201 && registerRes.body.success) {
      console.log('   ✅ User registered successfully!\n');
      const userId = registerRes.body.user.id;

      // Test 3: Login
      console.log('3️⃣  Testing User Login...');
      const loginRes = await makeRequest({
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, {
        username: username,
        password: 'testpass123'
      });

      console.log(`   Status: ${loginRes.status}`);
      
      if (loginRes.status === 200 && loginRes.body.success) {
        console.log('   ✅ Login successful!');
        console.log(`   Token: ${loginRes.body.token.substring(0, 20)}...`);
        const token = loginRes.body.token;

        // Test 4: Get Students
        console.log('\n4️⃣  Testing Get Students...');
        const studentsRes = await makeRequest({
          hostname: 'localhost',
          port: 5000,
          path: '/api/students',
          method: 'GET',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        console.log(`   Status: ${studentsRes.status}`);
        if (studentsRes.body.students) {
          console.log(`   Total Students: ${studentsRes.body.students.length}`);
          console.log('   ✅ Students retrieved successfully!\n');
        }

        // Test 5: Add Student
        console.log('5️⃣  Testing Add Student...');
        const newStudentData = {
          name: 'New Test Student',
          username: 'newstudent_' + Date.now(),
          class: '10B',
          contact: '9876543210'
        };

        const addStudentRes = await makeRequest({
          hostname: 'localhost',
          port: 5000,
          path: '/api/students',
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }, newStudentData);

        console.log(`   Status: ${addStudentRes.status}`);
        if (addStudentRes.status === 201 && addStudentRes.body.success) {
          console.log('   ✅ Student added successfully!');
          console.log(`   Student ID: ${addStudentRes.body.student._id}`);
          console.log(`   Name: ${addStudentRes.body.student.name}`);
        } else {
          console.log('   ❌ Failed to add student');
          console.log(`   Response: ${JSON.stringify(addStudentRes.body)}`);
        }
      } else {
        console.log('   ❌ Login failed');
      }
    } else {
      console.log('   ❌ Registration failed');
    }

    console.log('\n✅ All tests completed!');
    process.exit(0);

  } catch (err) {
    console.error('❌ Test error:', err.message);
    process.exit(1);
  }
}

// Wait a moment before testing to ensure server is fully ready
setTimeout(runTests, 1000);
