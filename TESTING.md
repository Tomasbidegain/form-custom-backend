# Testing Guide

## Setup Test Database

1. Create the test database:
```bash
pnpm test:setup-db
```

Or manually:
```bash
psql -U postgres -c "CREATE DATABASE \"form-custom-test\";"
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/form-custom-test?schema=public"
pnpm prisma migrate deploy
```

2. Run tests:
```bash
pnpm test           # Run all tests once
pnpm test:watch     # Run tests in watch mode
pnpm test:coverage  # Run tests with coverage report
```

## Test Structure

```
tests/
├── setup.ts              # Environment setup
├── auth.test.ts          # Authentication tests
├── forms.test.ts         # Form CRUD tests
├── responses.test.ts     # Response tests
└── files.test.ts         # File upload tests
```

## Test Database

Tests use a separate database (`form-custom-test`) to avoid affecting development data.

The test database is automatically cleaned up after each test suite runs.

## Environment Variables

Test environment variables are loaded from `.env.test`:

- `NODE_ENV=test`
- `DATABASE_URL` (points to test database)
- `JWT_SECRET` (test-specific secret)
- Other services use test/mock credentials

## Running Specific Tests

```bash
# Run only auth tests
pnpm test tests/auth.test.ts

# Run only form tests
pnpm test tests/forms.test.ts

# Run with verbose output
pnpm test --reporter=verbose
```

## Coverage

Generate coverage report:
```bash
pnpm test:coverage
```

Coverage reports are generated in:
- `coverage/` directory (HTML)
- Console output (text)
- `coverage/coverage.json` (JSON)

## Mocking External Services

For tests that interact with external services (Resend, Cloudinary, Turnstile), consider:

1. **Environment variables**: Use test credentials in `.env.test`
2. **Mock libraries**: Use `vitest.mock()` to mock service modules
3. **Test doubles**: Create mock implementations for testing

## Best Practices

1. **Unique test data**: Use timestamps or UUIDs to avoid conflicts
2. **Cleanup**: Always clean up test data in `afterAll` hooks
3. **Isolation**: Each test should be independent
4. **Assertions**: Test both success and error cases
5. **Database state**: Use transactions or cleanup to maintain clean state
