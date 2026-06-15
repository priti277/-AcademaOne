const http = require('http');

const testData = JSON.stringify({
  name: 'Frontend Test User',
  username: 'frontendtest_' + Date.now(),
  password: 'testpass123',
  email: 'frontend@test.com',
  role: 'student',
  class: '10A'
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': testData.length
  }
};

console.log('📡 Sending registration request to http://localhost:5000/api/auth/register');
console.log('Data:', JSON.parse(testData));
console.log('');

const req = http.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('✅ Response received!');
    console.log('Status Code:', res.statusCode);
    console.log('Response Body:');
    try {
      const response = JSON.parse(data);
      console.log(JSON.stringify(response, null, 2));
      
      if (res.statusCode === 201 && response.success) {
        console.log('\n🎉 SUCCESS! User saved to MongoDB!');
        console.log('Check your MongoDB database to verify the data was saved.');
      }
    } catch (e) {
      console.log(data);
    }
    process.exit(0);
  });
});

req.on('error', (e) => {
  console.error(`❌ Connection failed: ${e.message}`);
  console.error('\nMake sure:');
  console.error('1. Backend server is running (npm start)');
  console.error('2. Port 5000 is not blocked');
  console.error('3. MongoDB is running and connected');
  process.exit(1);
});

// Write data to request body
req.write(testData);
req.end();
