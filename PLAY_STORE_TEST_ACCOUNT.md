# Play Store Test Account Configuration

## 🎯 Demo Account for Google Play Reviewers

### Test Account Details
- **Email**: `playstore.test@ddabattalion.com`
- **Mobile**: `+91 9876543210`
- **Password**: `PlayStore2024!`
- **Status**: Non-expiring access for all tests

### Backend Configuration Required

Add this test account to your backend with the following properties:

1. **Never expires**: Set enrollment expiration to `NULL` or far future date
2. **All tests approved**: Auto-approve all test enrollments
3. **Admin privileges**: Allow access to all features

### Database Updates Needed

```sql
-- Insert test account
INSERT INTO students (first_name, last_name, mobile, email, password, is_verified, created_at) 
VALUES ('PlayStore', 'Tester', '9876543210', 'playstore.test@ddabattalion.com', 'hashed_password', true, NOW());

-- Get the student ID
SET @test_student_id = LAST_INSERT_ID();

-- Auto-approve all test enrollments for this account
INSERT INTO test_enrollments (student_id, test_id, status, request_message, approved_at, expires_at)
SELECT @test_student_id, id, 'approved', 'Play Store Test Account', NOW(), NULL
FROM tests WHERE status = true;

-- Set all enrollments to never expire
UPDATE test_enrollments 
SET expires_at = NULL 
WHERE student_id = @test_student_id;
```

### API Endpoint Whitelist

Add this account to your backend whitelist:

```javascript
// In your authentication middleware
const PLAY_STORE_TEST_EMAIL = 'playstore.test@ddabattalion.com';

// Skip expiration checks for test account
if (user.email === PLAY_STORE_TEST_EMAIL) {
  return next(); // Allow access
}
```

### Play Console Instructions

Add these instructions to your Play Console "App Access Instructions":

```
Test Account Credentials:
Email: playstore.test@ddabattalion.com
Password: PlayStore2024!

This account has non-expiring access to all test content.
Please use this account to test all app features.
```

## 🔧 Additional Fixes Applied

### 1. Error Handling Improvements
- ✅ 403 errors now return safe responses instead of crashing
- ✅ Network errors show user-friendly messages
- ✅ API failures don't crash the app

### 2. Graceful Degradation
- ✅ App shows "Unable to load content" instead of crashing
- ✅ Retry buttons for failed requests
- ✅ Offline-friendly error messages

### 3. Play Store Compliance
- ✅ No crashes on API errors
- ✅ Proper error boundaries
- ✅ User-friendly error messages
- ✅ Test account for reviewers

## 🚀 Next Steps

1. **Update Backend**: Add the test account configuration
2. **Test Locally**: Verify no crashes with expired access
3. **Build & Upload**: Create new build with fixes
4. **Internal Testing**: Test with the demo account
5. **Submit for Review**: Include test account instructions

## 📱 Testing Checklist

- [ ] App doesn't crash with 403 errors
- [ ] App shows proper error messages
- [ ] Demo account works for all features
- [ ] No crashes when offline
- [ ] Retry functionality works
- [ ] All screens load without errors
