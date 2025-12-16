/**
 * Probe Script for Xandeum Network RPC
 * Tests connection options and discovers API structure
 */

const https = require('https');
const http = require('http');

const RPC_ENDPOINTS = [
  'https://rpc.xandeum.network',
  'https://api.devnet.solana.com',
  'https://api.mainnet-beta.solana.com',
];

// Test RPC endpoint
async function testRPCEndpoint(url) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ success: true, data: json, statusCode: res.statusCode });
        } catch (e) {
          resolve({ success: false, error: 'Invalid JSON', raw: data });
        }
      });
    });

    req.on('error', (error) => {
      resolve({ success: false, error: error.message });
    });

    // Test 1: Standard Solana getClusterInfo
    const payload1 = JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'getClusterNodes',
    });

    req.write(payload1);
    req.end();
  });
}

// Test custom Xandeum endpoints
async function testXandeumEndpoints() {
  const endpoints = [
    { path: '/api/nodes', method: 'GET' },
    { path: '/api/pnodes', method: 'GET' },
    { path: '/api/storage-nodes', method: 'GET' },
    { path: '/api/v1/nodes', method: 'GET' },
  ];

  const results = [];

  for (const endpoint of endpoints) {
    try {
      const url = `https://rpc.xandeum.network${endpoint.path}`;
      const result = await fetch(url, { method: endpoint.method });
      const data = await result.text();
      results.push({
        endpoint: url,
        status: result.status,
        data: data.substring(0, 500), // First 500 chars
      });
    } catch (error) {
      results.push({
        endpoint: `https://rpc.xandeum.network${endpoint.path}`,
        error: error.message,
      });
    }
  }

  return results;
}

// Main probe function
async function probe() {
  console.log('🔍 Probing Xandeum Network RPC...\n');

  // Test 1: Standard Solana RPC endpoints
  console.log('📡 Testing RPC Endpoints:');
  for (const endpoint of RPC_ENDPOINTS) {
    console.log(`\n  Testing: ${endpoint}`);
    const result = await testRPCEndpoint(endpoint);
    if (result.success) {
      console.log(`  ✅ Connected! Status: ${result.statusCode}`);
      console.log(`  Response structure:`, JSON.stringify(result.data, null, 2).substring(0, 500));
    } else {
      console.log(`  ❌ Failed: ${result.error || 'Unknown error'}`);
    }
  }

  // Test 2: Custom Xandeum API endpoints
  console.log('\n\n🌐 Testing Custom Xandeum Endpoints:');
  const customResults = await testXandeumEndpoints();
  customResults.forEach((result) => {
    if (result.error) {
      console.log(`  ❌ ${result.endpoint}: ${result.error}`);
    } else {
      console.log(`  ${result.status === 200 ? '✅' : '⚠️'} ${result.endpoint}: Status ${result.status}`);
      if (result.data) {
        console.log(`     Preview: ${result.data.substring(0, 100)}...`);
      }
    }
  });

  // Test 3: Check for @xandeum/web3.js package
  console.log('\n\n📦 Checking for Xandeum SDK:');
  try {
    // Try to require it (will fail if not installed, which is fine)
    const xandeum = require('@xandeum/web3.js');
    console.log('  ✅ @xandeum/web3.js found!');
    console.log('  Available methods:', Object.keys(xandeum).join(', '));
  } catch (e) {
    console.log('  ⚠️  @xandeum/web3.js not installed (this is okay)');
    console.log('  Install with: npm install @xandeum/web3.js');
  }

  console.log('\n✅ Probe complete!');
  console.log('\n💡 Next steps:');
  console.log('  1. Review the output above to identify working endpoints');
  console.log('  2. Use the discovered structure to build the service layer');
  console.log('  3. Implement fallback to simulation mode if endpoints fail');
}

// Run probe
probe().catch(console.error);

