# Testing Guide

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Test Structure

```
src/__tests__/
├── setup.ts              # Test setup and teardown
├── utils/
│   └── testHelpers.ts    # Helper functions for tests
├── routes/
│   ├── auth.test.ts      # Authentication tests
│   ├── tasks.test.ts     # Task CRUD tests
│   └── health.test.ts    # Health check tests
└── utils/
    ├── password.test.ts  # Password utility tests
    └── dateUtils.test.ts # Date utility tests
```

## Test Coverage Goals

- **Unit Tests**: 80%+ coverage
- **Integration Tests**: All endpoints tested
- **Edge Cases**: Error scenarios covered

## Writing Tests

### Example Test Structure

```typescript
import request from "supertest";
import { app } from "../../index";
import { createTestUser, getAuthToken } from "../utils/testHelpers";

describe("Feature Name", () => {
  beforeEach(async () => {
    // Setup before each test
  });

  it("should do something", async () => {
    // Test implementation
  });
});
```

## Test Helpers

- `createTestUser()` - Create test user
- `createTestTask()` - Create test task
- `getAuthToken()` - Get auth token for requests
- `cleanupDatabase()` - Clean database between tests

## CI/CD Integration

Tests run automatically on:
- Push to main/develop branches
- Pull requests
- Multiple Node.js versions (18.x, 20.x)

