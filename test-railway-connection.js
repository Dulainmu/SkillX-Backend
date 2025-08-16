#!/usr/bin/env node

const https = require('https');

// Replace with your actual Railway URL
const RAILWAY_URL = process.env.RAILWAY_URL || 'https://your-app-name.railway.app';

console.log('🔍 Testing Railway Connection...');
console.log(`🌐 Testing URL: ${RAILWAY_URL}`);

function testEndpoint(endpoint, description) {
  return new Promise((resolve, reject) => {
    const url = `${RAILWAY_URL}${endpoint}`;
    
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log(`✅ ${description}: OK (${res.statusCode})`);
          resolve(true);
        } else {
          console.log(`❌ ${description}: Failed (${res.statusCode})`);
          console.log(`   Response: ${data.substring(0, 200)}...`);
          resolve(false);
        }
      });
    }).on('error', (err) => {
      console.log(`❌ ${description}: Error - ${err.message}`);
      resolve(false);
    });
  });
}

async function runTests() {
  console.log('\n🧪 Running Connection Tests...\n');
  
  const tests = [
    { endpoint: '/health', description: 'Health Check' },
    { endpoint: '/', description: 'Root Endpoint' },
    { endpoint: '/api/careers', description: 'Careers API' },
  ];
  
  let passed = 0;
  let total = tests.length;
  
  for (const test of tests) {
    const result = await testEndpoint(test.endpoint, test.description);
    if (result) passed++;
  }
  
  console.log(`\n📊 Test Results: ${passed}/${total} passed`);
  
  if (passed === total) {
    console.log('🎉 All tests passed! Your Railway backend is ready.');
    console.log(`\n📝 Next Steps:`);
    console.log(`1. Update your frontend .env.production:`);
    console.log(`   VITE_API_URL=${RAILWAY_URL}`);
    console.log(`2. Deploy your frontend to Vercel/Netlify`);
    console.log(`3. Test the full application`);
  } else {
    console.log('⚠️  Some tests failed. Check your Railway deployment.');
  }
}

runTests().catch(console.error);
