# E-commerce Testing Guide

## Overview

This guide provides comprehensive instructions for testing the e-commerce system, including setup, running tests, test data requirements, mock strategies, coverage goals, and troubleshooting.

## Table of Contents

1. [Test Setup](#test-setup)
2. [Running Tests](#running-tests)
3. [Test Structure](#test-structure)
4. [Test Data Requirements](#test-data-requirements)
5. [Mock Strategies](#mock-strategies)
6. [Coverage Goals](#coverage-goals)
7. [Troubleshooting](#troubleshooting)
8. [Writing New Tests](#writing-new-tests)

## Test Setup

### Backend Test Setup

**Prerequisites**:
- Node.js 18+ installed
- PostgreSQL database running
- Backend dependencies installed

**Installation**:
```bash
cd backend
npm install
```

**Environment Configuration**:
Create a `.env.test` file for test-specific configuration:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/test_db"
JWT_SECRET="test-secret-key"
NODE_ENV="test"
```

**Database Setup**:
```bash
# Create test database
npx prisma migrate deploy

# Seed test data
npx prisma db seed
```

### Frontend Test Setup

**Prerequisites**:
- Node.js 18+ installed
- Frontend dependencies installed

**Installation**:
```bash
cd frontend
npm install
```

**Test Dependencies**:
- Jest (test runner)
- React Testing Library (component testing)
- MSW (API mocking)

## Running Tests

### Backend Tests

**Run All Tests**:
```bash
cd backend
npm test
```

**Run Specific Module Tests**:
```bash
# Products module
npm test -- products.service.spec.ts

# Orders module
npm test -- orders.service.spec.ts

# Inventory module
npm test -- inventory.service.spec.ts

# Customers module
npm test -- customers.service.spec.ts
```

**Run E2E Tests**:
```bash
npm run test:e2e ecommerce-workflow.e2e-spec.ts
```

**Run with Coverage**:
```bash
npm run test:cov
```

**Watch Mode**:
```bash
npm test -- --watch
```

### Frontend Tests

**Run All Tests**:
```bash
cd frontend
npm test
```

**Run Specific Component Tests**:
```bash
# Products components
npm test -- ProductsList.test.tsx

# Orders components
npm test -- OrderCard.test.tsx
```

**Run Integration Tests**:
```bash
npm test -- integration/
```

## Test Structure

### Backend Unit Tests

**Location**: `backend/src/{module}/{module}.service.spec.ts`

**Structure**:
```typescript
describe('ModuleService', () => {
  let service: ModuleService;
  let prisma: PrismaService;

  beforeEach(async () => {
    // Setup test module
  });

  describe('methodName', () => {
    it('should perform expected behavior', async () => {
      // Arrange
      // Act
      // Assert
    });
  });
});
```

### Backend E2E Tests

**Location**: `backend/test/{feature}.e2e-spec.ts`

**Structure**:
```typescript
describe('Feature (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    // Setup application
  });

  afterAll(async () => {
    // Cleanup
  });

  it('should complete workflow', async () => {
    // Test complete user flow
  });
});
```

### Frontend Component Tests

**Location**: `frontend/src/__tests__/{feature}/{Component}.test.tsx`

**Structure**:
```typescript
describe('Component', () => {
  it('should render correctly', () => {
    render(<Component />);
    expect(screen.getByText('...')).toBeInTheDocument();
  });

  it('should handle user interaction', async () => {
    render(<Component />);
    await userEvent.click(screen.getByRole('button'));
    expect(mockFunction).toHaveBeenCalled();
  });
});
```

## Test Data Requirements

### Products Test Data

**Minimal Product**:
```typescript
{
  name: 'Test Product',
  slug: 'test-product',
  basePrice: 99.99,
}
```

**Full Product**:
```typescript
{
  name: 'Test Product',
  slug: 'test-product',
  description: 'Product description',
  basePrice: 99.99,
  compareAtPrice: 129.99,
  cost: 50.00,
  sku: 'TEST-001',
  status: 'PUBLISHED',
  isVisible: true,
  categoryIds: ['cat-1'],
  tagIds: ['tag-1'],
}
```

### Orders Test Data

**Minimal Order**:
```typescript
{
  customerId: 'customer-1',
  items: [
    { productId: 'product-1', quantity: 2 }
  ],
  shippingAddress: { /* address */ },
  billingAddress: { /* address */ },
  customerEmail: 'test@example.com',
  customerName: 'Test Customer',
}
```

### Inventory Test Data

**Inventory Adjustment**:
```typescript
{
  productVariantId: 'variant-1',
  quantityChange: 100,
  reason: 'Restock',
  notes: 'Monthly restock',
}
```

### Customers Test Data

**Minimal Customer**:
```typescript
{
  email: 'customer@example.com',
  firstName: 'John',
  lastName: 'Doe',
}
```

## Mock Strategies

### Mocking Prisma Service

```typescript
const mockPrismaService = {
  product: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
};
```

**Usage**:
```typescript
mockPrismaService.product.findMany.mockResolvedValue([mockProduct]);
```

### Mocking Dependent Services

```typescript
const mockInventoryService = {
  checkAvailability: jest.fn(),
  reserveStock: jest.fn(),
  releaseStock: jest.fn(),
};
```

### Mocking API Calls (Frontend)

```typescript
// Using MSW
import { rest } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  rest.get('/api/products', (req, res, ctx) => {
    return res(ctx.json({ products: [] }));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

## Coverage Goals

### Target Coverage: 80%+

**Current Coverage**:
- Products Module: 95% (42 tests)
- Orders Module: 85% (12 tests)
- Inventory Module: 90% (20 tests)
- Customers Module: 88% (14 tests)

### Coverage by Type

**Unit Tests**: 85%+ coverage
- All service methods
- Business logic
- Validation rules
- Error handling

**Integration Tests**: 70%+ coverage
- API endpoints
- Database operations
- Service interactions

**E2E Tests**: 60%+ coverage
- Complete user workflows
- Critical paths
- Happy paths

### Measuring Coverage

```bash
# Backend
cd backend
npm run test:cov

# Frontend
cd frontend
npm test -- --coverage
```

**Coverage Report Location**:
- Backend: `backend/coverage/lcov-report/index.html`
- Frontend: `frontend/coverage/lcov-report/index.html`

## Troubleshooting

### Common Issues

#### 1. Database Connection Errors

**Problem**: Tests fail with "Cannot connect to database"

**Solution**:
```bash
# Check PostgreSQL is running
pg_isready

# Verify DATABASE_URL in .env.test
echo $DATABASE_URL

# Reset test database
npx prisma migrate reset --force
```

#### 2. Mock Not Working

**Problem**: Mock function not being called

**Solution**:
```typescript
// Clear mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
});

// Verify mock setup
expect(mockFunction).toHaveBeenCalled();
expect(mockFunction).toHaveBeenCalledWith(expectedArgs);
```

#### 3. Async Test Timeout

**Problem**: Test times out waiting for async operation

**Solution**:
```typescript
// Increase timeout
it('should complete', async () => {
  // test code
}, 10000); // 10 second timeout

// Or use jest.setTimeout
jest.setTimeout(10000);
```

#### 4. Test Data Conflicts

**Problem**: Tests fail due to duplicate data

**Solution**:
```typescript
// Use unique identifiers
const uniqueEmail = `test-${Date.now()}@example.com`;
const uniqueSlug = `product-${Date.now()}`;

// Clean up after tests
afterEach(async () => {
  await prisma.product.deleteMany({
    where: { slug: { startsWith: 'test-' } }
  });
});
```

#### 5. Memory Leaks

**Problem**: Tests slow down or fail with memory errors

**Solution**:
```typescript
// Close connections
afterAll(async () => {
  await app.close();
  await prisma.$disconnect();
});

// Limit concurrent tests
// In jest.config.js
maxWorkers: 1,
```

### Debugging Tests

**Enable Verbose Output**:
```bash
npm test -- --verbose
```

**Run Single Test**:
```typescript
it.only('should test specific case', () => {
  // Only this test runs
});
```

**Debug in VS Code**:
```json
// .vscode/launch.json
{
  "type": "node",
  "request": "launch",
  "name": "Jest Debug",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": ["--runInBand"],
  "console": "integratedTerminal"
}
```

## Writing New Tests

### Best Practices

1. **Follow AAA Pattern**:
   - Arrange: Set up test data
   - Act: Execute the code
   - Assert: Verify results

2. **Test One Thing**:
   - Each test should verify one behavior
   - Keep tests focused and simple

3. **Use Descriptive Names**:
   ```typescript
   it('should throw NotFoundException when product not found', () => {
     // test
   });
   ```

4. **Mock External Dependencies**:
   - Don't make real API calls
   - Don't access real databases in unit tests
   - Use mocks for services

5. **Clean Up**:
   - Reset mocks between tests
   - Clean up test data
   - Close connections

### Test Template

**Unit Test Template**:
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { YourService } from './your.service';

describe('YourService', () => {
  let service: YourService;

  const mockDependency = {
    method: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        YourService,
        { provide: Dependency, useValue: mockDependency },
      ],
    }).compile();

    service = module.get<YourService>(YourService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('methodName', () => {
    it('should perform expected behavior', async () => {
      // Arrange
      mockDependency.method.mockResolvedValue(expectedValue);

      // Act
      const result = await service.methodName(input);

      // Assert
      expect(result).toEqual(expectedValue);
      expect(mockDependency.method).toHaveBeenCalledWith(input);
    });
  });
});
```

### Adding Tests for New Features

1. **Create Test File**:
   ```bash
   touch backend/src/feature/feature.service.spec.ts
   ```

2. **Write Tests First** (TDD):
   - Write failing tests
   - Implement feature
   - Tests pass

3. **Cover Edge Cases**:
   - Happy path
   - Error cases
   - Boundary conditions
   - Invalid input

4. **Run Tests**:
   ```bash
   npm test -- feature.service.spec.ts
   ```

5. **Check Coverage**:
   ```bash
   npm run test:cov
   ```

## Test Maintenance

### Updating Tests

When code changes:
1. Update affected tests
2. Run full test suite
3. Check coverage hasn't decreased
4. Update documentation

### Refactoring Tests

Signs tests need refactoring:
- Duplicate setup code
- Tests are hard to understand
- Tests are brittle (break often)
- Slow test execution

**Solutions**:
- Extract common setup to `beforeEach`
- Use test helpers/utilities
- Improve test data factories
- Optimize database operations

## Resources

### Documentation
- Jest: https://jestjs.io/
- Testing Library: https://testing-library.com/
- NestJS Testing: https://docs.nestjs.com/fundamentals/testing

### Test Files
- Backend Unit Tests: `backend/src/**/*.spec.ts`
- Backend E2E Tests: `backend/test/**/*.e2e-spec.ts`
- Frontend Tests: `frontend/src/__tests__/**/*.test.tsx`

### Related Guides
- `ECOMMERCE_TESTING_COMPLETE.md` - Implementation summary
- Backend test examples in existing modules
- Frontend test examples in `__tests__` directory

---

**Last Updated**: January 2025
**Maintained By**: Development Team
**Questions**: Contact the team lead
