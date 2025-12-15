# Error Logging Improvements

## Overview

The application now has a comprehensive, centralized error logging system that provides structured logging, error tracking, and better debugging capabilities.

## New Components

### 1. Centralized Logger Service (`services/logger.ts`)

A robust logging service with:
- **Log Levels**: DEBUG, INFO, WARN, ERROR, CRITICAL
- **Structured Logging**: All logs include context (user, component, action, etc.)
- **Log History**: In-memory log history (last 100 entries)
- **Error Tracking**: Automatic error reporting for critical errors
- **Context Awareness**: Automatically captures user context, URL, user agent

**Usage:**
```typescript
import { logger } from '../services/logger';

// Basic logging
logger.info('User logged in', { userId: '123', action: 'login' });
logger.error('Failed to fetch data', error, { component: 'Dashboard' });

// Specialized logging
logger.apiError('/api/voyages', 'GET', 500, error, response);
logger.componentError('Dashboard', error, props);
logger.navigationError('/dashboard', error);
```

### 2. Enhanced Error Boundary (`components/ErrorBoundary.tsx`)

Improved error boundary with:
- **Error ID Generation**: Unique error IDs for tracking
- **Detailed Error Display**: Stack traces and component stacks
- **Better User Experience**: User-friendly error messages
- **Automatic Logging**: All errors are automatically logged with context

**Features:**
- Shows unique error ID for support tracking
- Expandable error details (stack trace, component stack)
- Retry functionality
- Automatic error logging to logger service

### 3. Error Handler Utilities (`utils/errorHandler.ts`)

Consistent error handling patterns:
- **API Error Handling**: Standardized API error processing
- **User-Friendly Messages**: Maps technical errors to user-friendly messages
- **Error Wrappers**: Safe async operations and JSON parsing

**Usage:**
```typescript
import { handleApiError, getUserFriendlyError, safeAsync } from '../utils/errorHandler';

// Handle API errors
try {
  const response = await fetch('/api/data');
  const data = await response.json();
} catch (error) {
  const apiError = handleApiError(error, '/api/data', 'GET');
  const userMessage = getUserFriendlyError(apiError);
  // Show userMessage to user
}

// Safe async operations
const result = await safeAsync(
  () => fetchData(),
  defaultValue,
  { component: 'MyComponent' }
);
```

### 4. API Client with Error Handling (`services/apiClient.ts`)

Centralized API client with:
- **Automatic Error Logging**: All API errors are logged
- **Request/Response Logging**: Debug logging for all API calls
- **Error Context**: Automatic context capture for errors
- **Consistent Error Format**: Standardized error responses

**Usage:**
```typescript
import { apiClient } from '../services/apiClient';

// All errors are automatically logged
const response = await apiClient.get('/api/voyages');
const data = response.data;
```

## Improvements Made

### 1. Error Boundary
- ✅ Added error ID generation
- ✅ Enhanced error display with stack traces
- ✅ Integrated with logger service
- ✅ Better user experience with retry options

### 2. Dashboard Components
- ✅ Updated `Dashboard.tsx` to use logger
- ✅ Updated `ComprehensiveDashboard.tsx` to use logger
- ✅ Updated `BunkerBargePerformance.tsx` to use logger
- ✅ All errors now include component context

### 3. Error Context
All errors now include:
- User ID and role
- Component name
- Action being performed
- URL and user agent
- Timestamp
- Stack traces (for errors)

## Log Levels

- **DEBUG**: Development-only detailed information
- **INFO**: General information (user actions, etc.)
- **WARN**: Warning messages (non-critical issues)
- **ERROR**: Error messages (failed operations)
- **CRITICAL**: Critical errors (system failures)

## Error Tracking

### Development Mode
- All logs are displayed in console
- Log history stored in memory
- Critical errors stored in localStorage

### Production Mode
- Error reporting can be integrated with services like:
  - Sentry
  - LogRocket
  - Custom error tracking API

## Best Practices

### 1. Always Include Context
```typescript
logger.error('Failed to load data', error, {
  component: 'MyComponent',
  action: 'loadData',
  userId: user?.id,
});
```

### 2. Use Appropriate Log Levels
```typescript
logger.debug('Detailed debug info'); // Development only
logger.info('User action completed');
logger.warn('Non-critical issue');
logger.error('Operation failed');
logger.critical('System failure');
```

### 3. Handle Errors Gracefully
```typescript
try {
  await operation();
} catch (error) {
  logger.error('Operation failed', error, context);
  // Show user-friendly message
  showError(getUserFriendlyError(error));
}
```

### 4. Use API Client for All API Calls
```typescript
// Instead of raw fetch
const response = await fetch('/api/data');

// Use API client
const response = await apiClient.get('/api/data');
```

## Error Log History

Access log history programmatically:
```typescript
import { logger } from '../services/logger';

// Get all errors
const errors = logger.getHistory(LogLevel.ERROR);

// Get last 20 logs
const recentLogs = logger.getHistory(undefined, 20);
```

## Future Enhancements

1. **Error Analytics Dashboard**: Visualize error trends
2. **Error Notifications**: Alert developers of critical errors
3. **Error Grouping**: Group similar errors together
4. **Performance Monitoring**: Track error rates and response times
5. **User Feedback**: Allow users to report errors with context

## Migration Guide

### Before
```typescript
try {
  const response = await fetch('/api/data');
} catch (error) {
  console.error('Error:', error);
}
```

### After
```typescript
import { logger } from '../services/logger';
import { apiClient } from '../services/apiClient';

try {
  const response = await apiClient.get('/api/data');
} catch (error) {
  logger.error('Failed to fetch data', error, {
    component: 'MyComponent',
    action: 'fetchData',
  });
}
```

## Testing Error Logging

1. **Trigger an error** in development mode
2. **Check console** for structured log output
3. **Check ErrorBoundary** for user-friendly error display
4. **Check log history** using `logger.getHistory()`

## Support

For issues with error logging:
1. Check browser console for log output
2. Review error details in ErrorBoundary
3. Check localStorage for critical errors
4. Review log history using logger service

