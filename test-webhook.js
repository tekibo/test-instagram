const crypto = require('crypto');
const axios = require('axios');

// Configuration
const BASE_URL = 'https://test-instagram.onrender.com';
const VERIFY_TOKEN = 'your_verify_token_here'; // This should match your Render environment variable
const APP_SECRET = 'your_app_secret_here'; // This should match your Render environment variable

// Function to generate X-Hub-Signature
function generateXHubSignature(payload, appSecret) {
    const hmac = crypto.createHmac('sha1', appSecret);
    hmac.update(JSON.stringify(payload), 'utf-8');
    return `sha1=${hmac.digest('hex')}`;
}

// Test webhook verification
async function testWebhookVerification(endpoint) {
    const url = `${BASE_URL}/${endpoint}?hub.mode=subscribe&hub.verify_token=${VERIFY_TOKEN}&hub.challenge=test_challenge`;
    try {
        const response = await axios.get(url);
        console.log(`✅ ${endpoint} Verification Test Passed`);
        console.log('Response:', response.data);
    } catch (error) {
        console.error(`❌ ${endpoint} Verification Test Failed`);
        console.error('Error:', error.response ? error.response.data : error.message);
    }
}

// Test webhook payload
async function testWebhookPayload(endpoint) {
    const url = `${BASE_URL}/${endpoint}`;
    const payload = {
        object: 'page',
        entry: [{
            id: '123456789',
            time: Date.now(),
            changes: [{
                field: 'feed',
                value: {
                    item: 'status',
                    verb: 'add'
                }
            }]
        }]
    };

    const xHubSignature = generateXHubSignature(payload, APP_SECRET);

    try {
        const response = await axios.post(url, payload, {
            headers: {
                'Content-Type': 'application/json',
                'X-Hub-Signature': xHubSignature
            }
        });
        console.log(`✅ ${endpoint} Payload Test Passed`);
        console.log('Response:', response.data);
    } catch (error) {
        console.error(`❌ ${endpoint} Payload Test Failed`);
        console.error('Error:', error.response ? error.response.data : error.message);
    }
}

// Run tests
async function runTests() {
    console.log('🚀 Starting Webhook Tests\n');

    // Test Facebook endpoint
    console.log('Testing Facebook Webhook:');
    await testWebhookVerification('facebook');
    await testWebhookPayload('facebook');
    console.log('\n');

    // Test Instagram endpoint
    console.log('Testing Instagram Webhook:');
    await testWebhookVerification('instagram');
    await testWebhookPayload('instagram');
    console.log('\n');

    // Test Threads endpoint
    console.log('Testing Threads Webhook:');
    await testWebhookVerification('threads');
    await testWebhookPayload('threads');
    console.log('\n');

    // Test root endpoint
    console.log('Testing Root Endpoint:');
    try {
        const response = await axios.get(BASE_URL);
        console.log('✅ Root Endpoint Test Passed');
        console.log('Received Updates:', response.data);
    } catch (error) {
        console.error('❌ Root Endpoint Test Failed');
        console.error('Error:', error.response ? error.response.data : error.message);
    }
}

// Add axios as a dependency
const packageJson = require('./package.json');
if (!packageJson.dependencies.axios) {
    console.log('Installing required dependencies...');
    require('child_process').execSync('npm install axios');
}

// Run the tests
runTests().catch(console.error); 