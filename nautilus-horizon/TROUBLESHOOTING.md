# Troubleshooting Guide - User Profile System

## Common Issues and Solutions

### 1. Blank Pages When Switching User Profiles

**Symptoms:**
- Page goes completely blank when selecting certain user roles
- White screen or loading spinner that never resolves
- Console errors related to missing components

**Causes & Solutions:**

#### Missing Components
- **Issue**: Some components referenced in the dashboard might not exist
- **Solution**: All required components have been created:
  - `TaskCard.tsx` ✅
  - `LoadingSpinner.tsx` ✅
  - `ErrorBoundary.tsx` ✅
  - `SimpleDashboard.tsx` ✅

#### Import Errors
- **Issue**: Incorrect import paths or missing exports
- **Solution**: All imports have been verified and corrected

#### Context Errors
- **Issue**: UserContext not properly initialized
- **Solution**: Error boundary and loading states added

### 2. User Profile Switching Not Working

**Symptoms:**
- Clicking on different roles doesn't change the interface
- User information doesn't update
- Permissions don't change

**Solutions:**

#### Check UserContext
```typescript
// Verify the user context is working
const { user, updateProfile } = useUser();
console.log('Current user:', user);
```

#### Verify Role Switching
```typescript
// Test role switching
await updateProfile({ role: UserRole.CREW });
```

### 3. Navigation Not Updating

**Symptoms:**
- Sidebar navigation doesn't change when switching roles
- Menu items don't appear/disappear based on permissions

**Solutions:**

#### Check Permissions
```typescript
// Verify permissions are working
const { hasPermission } = useUser();
console.log('Has VIEW_DASHBOARD:', hasPermission(Permission.VIEW_DASHBOARD));
```

#### Verify Navigation Items
- Each role has specific navigation items defined
- Permissions control visibility of menu items

### 4. Dashboard Not Loading

**Symptoms:**
- Dashboard shows loading spinner indefinitely
- No content appears on the dashboard

**Solutions:**

#### Use SimpleDashboard
- Fallback dashboard component created
- Works for all user roles
- Provides basic functionality

#### Check Dashboard Config
```typescript
// Verify dashboard configuration
const { dashboardConfig } = useUser();
console.log('Dashboard config:', dashboardConfig);
```

## Testing User Profiles

### Available Test Users

1. **Crew Member**
   - Email: `crew@poseidon.com`
   - Role: CREW
   - Features: Tasks, League, Fuel Logging

2. **Officer**
   - Email: `officer@poseidon.com`
   - Role: OFFICER
   - Features: Voyages, Crew Management, Fuel Management

3. **Engineer**
   - Email: `engineer@poseidon.com`
   - Role: ENGINEER
   - Features: Engine Status, Fuel Consumption, Maintenance

4. **Manager**
   - Email: `manager@poseidon.com`
   - Role: MANAGER
   - Features: Fleet Management, Financial Overview, RFQ Board

5. **Compliance Officer**
   - Email: `compliance@poseidon.com`
   - Role: COMPLIANCE_OFFICER
   - Features: Compliance Monitoring, Verification, Regulatory Deadlines

6. **Trader**
   - Email: `trader@poseidon.com`
   - Role: TRADER
   - Features: RFQ Board, Market Data, Trading Opportunities

7. **Administrator**
   - Email: `admin@poseidon.com`
   - Role: ADMIN
   - Features: Full system access

### Testing Steps

1. **Start the Application**
   ```bash
   npm run dev
   ```

2. **Access User Switcher**
   - Click on the user profile in the top-right header
   - Select different roles from the dropdown

3. **Verify Changes**
   - Check that the sidebar navigation updates
   - Verify the dashboard content changes
   - Confirm user information updates in the header

4. **Test Each Role**
   - Switch to each role and verify functionality
   - Check that role-specific features are available
   - Ensure permissions are properly enforced

## Debugging Tools

### Console Logging
```typescript
// Add to components for debugging
console.log('Current user:', user);
console.log('Dashboard config:', dashboardConfig);
console.log('Has permission:', hasPermission(Permission.VIEW_DASHBOARD));
```

### Error Boundary
- Catches and displays errors
- Prevents blank pages
- Shows error details for debugging

### Loading States
- LoadingSpinner component for better UX
- Prevents blank screens during loading
- Shows progress to users

## Common Fixes

### 1. Clear Browser Storage
```javascript
// Clear localStorage to reset user state
localStorage.clear();
window.location.reload();
```

### 2. Reset User Context
```typescript
// Force user context reset
const { logout } = useUser();
logout();
```

### 3. Check Network Requests
- Open browser DevTools
- Check Network tab for failed requests
- Verify all resources are loading

### 4. Verify Dependencies
```bash
# Reinstall dependencies
npm install

# Check for missing packages
npm list
```

## Performance Optimization

### 1. Lazy Loading
- Components load only when needed
- Reduces initial bundle size
- Improves loading times

### 2. Memoization
- React.memo for expensive components
- useMemo for complex calculations
- useCallback for event handlers

### 3. Code Splitting
- Route-based code splitting
- Component-based code splitting
- Dynamic imports for large components

## Production Considerations

### 1. Authentication
- Replace mock authentication with real API
- Implement JWT token management
- Add session timeout handling

### 2. Security
- Server-side permission validation
- API endpoint protection
- Data access control

### 3. Monitoring
- Error tracking (Sentry, LogRocket)
- Performance monitoring
- User analytics

## Support

If you continue to experience issues:

1. **Check Browser Console**
   - Look for JavaScript errors
   - Check network requests
   - Verify component rendering

2. **Test in Different Browser**
   - Try Chrome, Firefox, Safari
   - Check for browser-specific issues

3. **Clear Cache**
   - Hard refresh (Ctrl+F5)
   - Clear browser cache
   - Disable browser extensions

4. **Check Dependencies**
   - Verify all packages are installed
   - Check for version conflicts
   - Update outdated packages

The user profile system is now robust with error handling, loading states, and fallback components to prevent blank pages and ensure a smooth user experience.
