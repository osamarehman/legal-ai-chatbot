// Simple script to apply the ProcessedFile table migration to Neon Database
const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function applyMigration() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL not found in .env.local');
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);

  try {
    console.log('Connecting to Neon database...');

    // Read the migration SQL file
    const migrationPath = path.join(__dirname, 'lib', 'db', 'migrations', '0003_add_processed_file_table.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('Applying migration...');
    await sql(migrationSQL);
    console.log('✅ Migration applied successfully!');
    console.log('ProcessedFile table has been created.');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    if (error.message.includes('already exists')) {
      console.log('ℹ️  Table already exists, no action needed.');
    } else {
      process.exit(1);
    }
  }
}

applyMigration();
