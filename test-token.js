// test-token.js - Quick token tester
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

console.log('\n🔍 DATABRICKS TOKEN DIAGNOSTIC\n');
console.log('='.repeat(60));

// Check .env file
console.log('\n1️⃣ Checking .env configuration:');
console.log('   DATABRICKS_URL:', process.env.DATABRICKS_URL ? '✅ Set' : '❌ Missing');
console.log('   DATABRICKS_TOKEN:', process.env.DATABRICKS_TOKEN ? '✅ Set' : '❌ Missing');
console.log('   WAREHOUSE_ID:', process.env.WAREHOUSE_ID ? '✅ Set' : '❌ Missing');

if (!process.env.DATABRICKS_TOKEN) {
    console.log('\n❌ ERROR: DATABRICKS_TOKEN is not set in .env file!');
    console.log('\n📝 Fix:');
    console.log('1. Open .env file');
    console.log('2. Add this line:');
    console.log('   DATABRICKS_TOKEN=your_token_here');
    console.log('3. Save and restart server');
    process.exit(1);
}

const TOKEN = process.env.DATABRICKS_TOKEN;
const URL = process.env.DATABRICKS_URL;
const WAREHOUSE_ID = process.env.WAREHOUSE_ID;

console.log('\n2️⃣ Token Details:');
console.log('   Length:', TOKEN.length, 'characters');
console.log('   Starts with:', TOKEN.substring(0, 10) + '...');
console.log('   Expected format: dapi...');

if (!TOKEN.startsWith('dapi')) {
    console.log('\n⚠️  WARNING: Token should start with "dapi"');
}

// Test the token
console.log('\n3️⃣ Testing Databricks connection...');
console.log('   Sending test query to Databricks...');

async function testToken() {
    try {
        const response = await fetch(URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${TOKEN}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                statement: "SELECT 1 as test",
                warehouse_id: WAREHOUSE_ID
            })
        });

        console.log('\n   Response Status:', response.status);

        if (response.status === 401) {
            console.log('\n❌ AUTHENTICATION FAILED (401 Unauthorized)\n');
            console.log('Your token is INVALID or EXPIRED.\n');
            console.log('🔧 HOW TO FIX:\n');
            console.log('1. Go to Databricks workspace:');
            console.log('   https://adb-7405608390542724.4.azuredatabricks.net/\n');
            console.log('2. Click your profile (top right) → User Settings\n');
            console.log('3. Click "Developer" → "Access Tokens"\n');
            console.log('4. Click "Generate New Token"\n');
            console.log('5. IMPORTANT: Check "All Permissions" or "SQL" access\n');
            console.log('6. Set lifetime: 90 days\n');
            console.log('7. Click "Generate"\n');
            console.log('8. Copy the ENTIRE token (starts with "dapi")\n');
            console.log('9. Open your .env file\n');
            console.log('10. Replace the DATABRICKS_TOKEN line:\n');
            console.log('    DATABRICKS_TOKEN=dapi_paste_your_new_token_here\n');
            console.log('11. Save .env file\n');
            console.log('12. Restart server: npm start\n');
            
            const errorBody = await response.text();
            if (errorBody) {
                console.log('Error details:', errorBody);
            }
            process.exit(1);
        }

        if (response.status === 200 || response.status === 201) {
            const data = await response.json();
            console.log('\n✅ SUCCESS! Token is valid!\n');
            console.log('   Statement ID:', data.statement_id);
            console.log('\n🎉 Your Databricks connection is working!\n');
            console.log('You can now run: npm start\n');
            process.exit(0);
        }

        console.log('\n⚠️  Unexpected response:', response.status);
        const errorBody = await response.text();
        console.log('Response:', errorBody);
        process.exit(1);

    } catch (error) {
        console.log('\n❌ Connection Error:', error.message);
        console.log('\nPossible issues:');
        console.log('- Check your internet connection');
        console.log('- Verify the DATABRICKS_URL is correct');
        console.log('- Make sure you can access Databricks in your browser');
        process.exit(1);
    }
}

testToken();
