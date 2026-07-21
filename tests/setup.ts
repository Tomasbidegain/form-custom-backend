import dotenv from 'dotenv';

// Load test environment variables
if (process.env.NODE_ENV === 'test') {
  dotenv.config({ path: '.env.test', override: true });
} else {
  dotenv.config();
}

// Ensure test database is set up
if (process.env.NODE_ENV === 'test') {
  console.log('✓ Test environment loaded');
  console.log(`✓ Using database: ${process.env.DATABASE_URL?.split('@')[1] || 'unknown'}`);
}
