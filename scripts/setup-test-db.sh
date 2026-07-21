#!/bin/bash

# Script to setup test database
echo "Setting up test database..."

# Create test database
psql -U postgres -c "DROP DATABASE IF EXISTS \"form-custom-test\";"
psql -U postgres -c "CREATE DATABASE \"form-custom-test\";"

# Run migrations on test database
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/form-custom-test?schema=public"
pnpm prisma migrate deploy

echo "Test database setup complete!"
