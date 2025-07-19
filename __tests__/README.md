# Email Feature Test Suite

This directory contains comprehensive unit tests for the email functionality in EduVibe.

## 📁 Test Structure

```
__tests__/
├── email/
│   ├── templates/
│   │   └── welcome.test.ts       # Welcome email template tests
│   ├── config.test.ts            # Email configuration tests
│   ├── service.test.ts           # Email service tests
│   └── utils.test.ts             # Email utility function tests
└── api/
    └── email/
        └── route.test.ts         # API route tests
```

## 🧪 Test Coverage

### Welcome Email Templates (`welcome.test.ts`)
- ✅ HTML template generation for students
- ✅ HTML template generation for mentors  
- ✅ Plain text template generation
- ✅ Proper HTML structure validation
- ✅ Responsive CSS validation
- ✅ Role-specific content testing

### Email Configuration (`config.test.ts`)
- ✅ Default configuration values
- ✅ Environment variable usage
- ✅ Required properties validation

### Email Service (`service.test.ts`)
- ✅ Welcome email sending (success/failure)
- ✅ Password reset email sending
- ✅ Booking confirmation emails
- ✅ Error handling for SMTP failures
- ✅ Correct subject lines for different roles

### Email Utilities (`utils.test.ts`)
- ✅ Client-side API calls for all email types
- ✅ Network error handling
- ✅ API error response handling
- ✅ Email service status checking

### API Routes (`route.test.ts`)
- ✅ POST endpoint for all email types
- ✅ GET endpoint for status checking
- ✅ Request validation
- ✅ Error responses (400, 500, 503)
- ✅ Email service availability checks

## 🚀 Running Tests

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

### Run Specific Test Files
```bash
# Test email templates only
npm test welcome.test.ts

# Test API routes only  
npm test route.test.ts

# Test email service only
npm test service.test.ts
```

## 🎯 Test Philosophy

### Simple & Focused
- Each test focuses on one specific behavior
- Clear, descriptive test names
- Minimal setup and teardown

### Mocked Dependencies
- Nodemailer transporter is mocked
- HTTP fetch calls are mocked
- Environment variables are set in test setup

### Real-World Scenarios
- Tests cover both success and failure cases
- Validation edge cases are tested
- Network errors are handled

## 📊 Expected Test Results

When running the tests, you should see:

```
 PASS  __tests__/email/templates/welcome.test.ts
 PASS  __tests__/email/config.test.ts
 PASS  __tests__/email/service.test.ts
 PASS  __tests__/email/utils.test.ts
 PASS  __tests__/api/email/route.test.ts

Test Suites: 5 passed, 5 total
Tests:       XX passed, XX total
```

## 🛠️ Test Configuration

### Jest Setup (`jest.config.js`)
- Uses Next.js Jest configuration
- Node environment for API testing
- Path mapping for `@/` imports
- Coverage collection from relevant files

### Global Setup (`jest.setup.js`)
- Mock environment variables
- 10-second test timeout
- Global test configuration

## 🔍 What These Tests Validate

### ✅ Functional Requirements
- Welcome emails are sent correctly
- Email templates render properly
- API endpoints work as expected
- Error handling works correctly

### ✅ Integration Points
- Email service integrates with templates
- API routes integrate with email service
- Utils integrate with API endpoints

### ✅ Edge Cases
- Missing required fields
- Invalid email types
- Network failures
- SMTP connection issues

## 🚨 Troubleshooting Tests

### Common Issues

1. **Import Errors**
   - Check that all imports use correct paths
   - Ensure `@/` path mapping is configured

2. **Mock Issues**
   - Verify mocks are cleared between tests
   - Check mock implementations match real interfaces

3. **Async Test Issues**
   - Ensure all async operations are awaited
   - Use proper jest timeout settings

### Debug Tips

```bash
# Run tests with verbose output
npm test -- --verbose

# Run a single test file
npm test welcome.test.ts

# Run tests with debugging
npm test -- --detectOpenHandles --forceExit
```

## 📈 Future Test Additions

Consider adding tests for:
- Email rate limiting
- Template performance
- Email delivery confirmation
- Internationalization
- Email analytics

---

These tests ensure the email system is reliable, maintainable, and bug-free! 🎉 