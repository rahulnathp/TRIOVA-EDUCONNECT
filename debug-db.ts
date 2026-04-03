// debug-db.ts
import { config } from 'dotenv';
import { Client } from 'pg';

// Load environment variables from .env file (using absolute path from project root)
console.log('📁 Loading .env from project root...');
config();

// Test multiple connection scenarios
async function testConnection() {
  console.log('🔍 Testing Database Connection...');
  console.log('Environment Variables:');
  console.log('  DB_HOST:', process.env.DB_HOST);
  console.log('  DB_PORT:', process.env.DB_PORT);
  console.log('  DB_USERNAME:', process.env.DB_USERNAME);
  console.log('  DB_PASSWORD:', process.env.DB_PASSWORD ? '***' : 'undefined');
  console.log('  DB_DATABASE:', process.env.DB_DATABASE);
  console.log('  NODE_ENV:', process.env.NODE_ENV);

  const client = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD, // Now should be properly loaded
    database: process.env.DB_DATABASE,
    ssl: process.env.DB_HOST?.includes('rds.amazonaws.com') || process.env.DB_HOST?.includes('amazonaws.com') ? {
      rejectUnauthorized: false,
      require: true,
    } : false,
    connectionTimeoutMillis: 60000,
    idleTimeoutMillis: 30000,
    application_name: 'triova-backend-debug',
  });

  try {
    await client.connect();
    console.log('✅ Connection successful!');
    
    // Test a simple query
    const result = await client.query('SELECT NOW() as current_time, version() as version');
    console.log('📊 Query result:', result.rows);
    
    await client.end();
    console.log('🔌 Connection closed successfully');
    
    return true;
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('❌ Full error:', error);
    
    // Try to close if still connected
    try {
      await client.end();
    } catch (endError) {
      console.error('❌ Error closing connection:', endError.message);
    }
    
    return false;
  }
}

// Test with different SSL configurations
async function testSSLConfigurations() {
  console.log('\n🔧 Testing Different SSL Configurations...\n');
  
  const configs = [
    { name: 'No SSL', ssl: false },
    { name: 'Basic SSL', ssl: { rejectUnauthorized: false } },
    { name: 'RDS SSL', ssl: { rejectUnauthorized: false, require: true } },
  ];

  for (const config of configs) {
    console.log(`\n📋 Testing: ${config.name}`);
    
    const client = new Client({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10) || 5432,
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      ssl: config.ssl,
      connectionTimeoutMillis: 10000,
      application_name: `triova-backend-${config.name.toLowerCase().replace(' ', '-')}`,
    });

    try {
      await client.connect();
      console.log(`✅ ${config.name} - Connection successful!`);
      await client.end();
    } catch (error) {
      console.log(`❌ ${config.name} - Connection failed:`, error.message);
    }
  }
}

// Main test function
async function runDiagnostics() {
  console.log('🚀 Starting Database Diagnostics...\n');
  
  console.log('1. Testing Basic Connection:');
  const basicSuccess = await testConnection();
  
  console.log('\n2. Testing SSL Configurations:');
  await testSSLConfigurations();
  
  console.log('\n3. Environment Check:');
  console.log('   All required variables present:', !!(
    process.env.DB_HOST && 
    process.env.DB_PORT && 
    process.env.DB_USERNAME && 
    process.env.DB_PASSWORD && 
    process.env.DB_DATABASE
  ));
  
  console.log('\n🏁 Diagnostics Complete!');
  process.exit(basicSuccess ? 0 : 1);
}

// Run if this file is executed directly
if (require.main === module) {
  runDiagnostics();
}
