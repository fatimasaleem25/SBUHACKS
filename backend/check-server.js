// Quick script to check if server is running on port 4000
import http from 'http';

const checkServer = () => {
  const options = {
    hostname: 'localhost',
    port: 4000,
    path: '/api/health',
    method: 'GET',
    timeout: 2000
  };

  const req = http.request(options, (res) => {
    console.log(`✅ Backend server IS running on port 4000`);
    console.log(`Status: ${res.statusCode}`);
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      console.log(`Response: ${data}`);
    });
  });

  req.on('error', (error) => {
    console.log(`❌ Backend server is NOT running on port 4000`);
    console.log(`Error: ${error.message}`);
    console.log('\n💡 To start the server, run:');
    console.log('   cd /Users/fatima/mindmesh/backend');
    console.log('   npm run dev');
  });

  req.on('timeout', () => {
    req.destroy();
    console.log(`❌ Backend server is NOT responding on port 4000 (timeout)`);
  });

  req.end();
};

checkServer();

