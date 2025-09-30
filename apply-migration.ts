// Migration script to apply ProcessedFile table to Neon Database
import { config } from 'dotenv';
import postgres from 'postgres';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load .env.local
config({ path: '.env.local' });

async function applyMigration() {
  const databaseUrl = process.env.POSTGRES_URL;

  if (!databaseUrl) {
    console.error('❌ POSTGRES_URL not found in environment variables');
    process.exit(1);
  }

  const sql = postgres(databaseUrl, { max: 1 });

  try {
    console.log('Connecting to Neon database...');

    // Read the migration SQL file
    const migrationPath = join(process.cwd(), 'lib', 'db', 'migrations', '0003_add_processed_file_table.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf8');

    console.log('Applying migration...');
    await sql.unsafe(migrationSQL);
    console.log('✅ Migration applied successfully!');
    console.log('ProcessedFile table has been created.');

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('❌ Migration failed:', errorMessage);
    
    if (errorMessage.includes('already exists')) {
      console.log('ℹ️  Table already exists, no action needed.');
      process.exit(0);
    } else {
      process.exit(1);
    }
  } finally {
    await sql.end();
    console.log('Database connection closed.');
  }
}

applyMigration();
