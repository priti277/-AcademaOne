const http = require('http');

console.log('🧪 Testing User Registration...\n');

// Test 1: Register a new user
const registerData = JSON.stringify({
  name: 'Test User',
  username: 'testuser_' + Date.now(),
  password: 'password123',
  email: 'test@example.com',
  role: 'student',
  class: '10A'
});

const registerOptions = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': registerData.length
  }
};

console.log('📤 Sending registration request...');
console.log('Data:', JSON.parse(registerData));

const registerReq = http.request(registerOptions, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log('\n✅ Response received');
    console.log('Status Code:', res.statusCode);
    try {
      const response = JSON.parse(data);
      console.log('Response Data:', JSON.stringify(response, null, 2));
      
      if (res.statusCode === 201 && response.success) {
        console.log('\n🎉 SUCCESS! User registered and saved to MongoDB!');
      } else {
        console.log('\n⚠️ Registration failed or returned non-success status');
      }
    } catch (e) {
      console.log('Raw Response:', data);
    }
    process.exit(0);
  });
});

registerReq.on('error', (e) => {
  console.error(`❌ Request failed: ${e.message}`);
  console.error('Make sure the server is running on port 5000');
  process.exit(1);
});

registerReq.write(registerData);
registerReq.end();
