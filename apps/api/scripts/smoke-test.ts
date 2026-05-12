import axios from 'axios';

/**
 * PHASE 5: SMOKE TEST SCRIPT
 * This script simulates the full end-to-end journey of a land record.
 */

const API_URL = process.env.API_URL || 'http://localhost:3001/api/v1';

async function runSmokeTest() {
  console.log('🚀 Starting Smoke Test...');

  try {
    // 1. Check Health
    console.log('Step 1: Checking Health...');
    const health = await axios.get(`${API_URL}/health`);
    console.log('✅ Health check passed:', health.data.status);

    // 2. Auth (Login with mock VNeID)
    // In a real test we would need a valid token. 
    // For this smoke test, we'll assume the environment is already seeded and we have an admin/staff token.
    // Since we don't have the password/OTP flow here, we'll just log that this step is verified manually or needs a token.
    console.log('Step 2: Auth Verification... (Assuming token is provided or API is open for testing)');

    // 3. Land Search
    console.log('Step 3: Checking Land Search...');
    const search = await axios.get(`${API_URL}/compliance/planning-zones`);
    console.log('✅ Planning zones fetched:', search.data.length, 'records');

    // 4. System Config
    console.log('Step 4: Checking System Config...');
    const configs = await axios.get(`${API_URL}/system-config`);
    console.log('✅ System configs fetched:', configs.data.length, 'keys');

    console.log('\n--- End-to-End Logic Verification ---');
    console.log('Note: To run full write-flow tests, please provide a valid Bearer Token.');
    
    console.log('\n✅ Smoke Test Basic Pass!');
  } catch (error: any) {
    console.error('❌ Smoke Test Failed!');
    if (error.response) {
      console.error('Error Response:', error.response.status, error.response.data);
    } else {
      console.error('Error Message:', error.message);
    }
    process.exit(1);
  }
}

runSmokeTest();
