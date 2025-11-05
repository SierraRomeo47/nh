# Role-Based Access Control (RBAC) Configuration

## Overview
This document defines the complete role-based access control system for the Nautilus Horizon maritime platform. Each user role has specific permissions and page access tailored to their responsibilities.

## User Roles & Page Access

### 1. **System Administrator** (Sumit Redu)
**Access: ALL PAGES** ✅

The System Administrator has full access to every page and feature:
- ✅ Dashboard
- ✅ User Management
- ✅ System Settings
- ✅ Fleet Management
- ✅ Voyages
- ✅ Crew Tasks
- ✅ Crew League
- ✅ Fuel Logging
- ✅ Fuel Consumption
- ✅ Engine Status
- ✅ Waste Heat Recovery
- ✅ Maintenance
- ✅ Compliance Monitoring
- ✅ Verification
- ✅ Regulatory Deadlines
- ✅ Trading Opportunities
- ✅ Market Data
- ✅ Portfolio
- ✅ RFQ Board
- ✅ Scenario Pad
- ✅ Profile Settings

---

### 2. **Ops Superintendent** (Nitin Singh)
**Focus: Fleet Operations & Compliance**

Pages accessible:
- ✅ Dashboard
- ✅ Fleet Management
- ✅ Voyages
- ✅ Crew Management
- ✅ Compliance Monitoring
- ✅ Fuel Consumption
- ✅ Scenario Planning
- ✅ Profile Settings

---

### 3. **Tech Superintendent** (Nitesh Chandak)
**Focus: Technical Operations & Maintenance**

Pages accessible:
- ✅ Dashboard
- ✅ Fleet Management
- ✅ Engine Status
- ✅ Waste Heat Recovery
- ✅ Maintenance
- ✅ Compliance Monitoring
- ✅ Fuel Consumption
- ✅ Profile Settings

---

### 4. **Fleet Manager** (Sarafaraz Akhtar)
**Focus: Fleet Operations & Financial Oversight**

Pages accessible:
- ✅ Dashboard
- ✅ Fleet Management
- ✅ Voyages
- ✅ Crew Management
- ✅ RFQ Board
- ✅ Scenario Pad
- ✅ Fuel Consumption
- ✅ Crew League
- ✅ Compliance Monitoring
- ✅ Profile Settings

---

### 5. **Compliance Manager** (Vinay Chandra)
**Focus: Regulatory Compliance & Verification**

Pages accessible:
- ✅ Dashboard
- ✅ Compliance Monitoring
- ✅ Marine Regulations
- ✅ Data Verification
- ✅ Regulatory Deadlines
- ✅ Emissions Trading (RFQ Board)
- ✅ Fleet Overview
- ✅ Voyages (view only)
- ✅ Fuel Data (verify)
- ✅ Profile Settings

---

### 6. **Emissions Trader** (Sravan Padavala)
**Focus: Emissions Trading & Market Data**

Pages accessible:
- ✅ Dashboard
- ✅ Emissions Trading (RFQ Board)
- ✅ Trading Opportunities
- ✅ Market Data
- ✅ Trading Portfolio
- ✅ Profile Settings

---

### 7. **Captain** (Jane Smith)
**Focus: Vessel Command & Navigation**

Pages accessible:
- ✅ Dashboard
- ✅ Voyages (full access)
- ✅ Crew Management
- ✅ Navigation
- ✅ Safety & Security
- ✅ Compliance
- ✅ Fuel Data
- ✅ Crew League
- ✅ Profile Settings

---

### 8. **Chief Engineer** (David Engineer)
**Focus: Engineering Department Leadership**

Pages accessible:
- ✅ Dashboard
- ✅ Engine Status
- ✅ Waste Heat Recovery
- ✅ Maintenance
- ✅ Emissions Monitoring
- ✅ Engineering Tasks
- ✅ Fuel Consumption
- ✅ Regulations Compliance
- ✅ Fleet Overview
- ✅ Voyages (view)
- ✅ Profile Settings

---

### 9. **Second Officer** (James Walker)
**Focus: Navigation & Deck Operations**

Pages accessible:
- ✅ Dashboard
- ✅ Voyages
- ✅ Crew Management
- ✅ Navigation
- ✅ Fuel Management
- ✅ Safety & Security
- ✅ Crew League
- ✅ Profile Settings

---

### 10. **Second Engineer** (Rob M)
**Focus: Engineering Operations**

Pages accessible:
- ✅ Dashboard
- ✅ Engine Status
- ✅ Waste Heat Recovery
- ✅ Maintenance
- ✅ Emissions Monitoring
- ✅ Fuel Consumption
- ✅ Crew Tasks
- ✅ Crew League
- ✅ Profile Settings

---

### 11. **Able Seaman** (John Doe)
**Focus: Operational Crew Duties**

Pages accessible:
- ✅ Dashboard
- ✅ My Tasks
- ✅ Crew League
- ✅ Fuel Logging
- ✅ Safety
- ✅ Profile Settings

---

### 12. **Ordinary Seaman** (Mike Mariner)
**Focus: Basic Crew Duties**

Pages accessible:
- ✅ Dashboard
- ✅ My Tasks
- ✅ Crew League
- ✅ Fuel Logging
- ✅ Safety
- ✅ Profile Settings

---

## Permission Model

Each page is protected by specific permissions. The permission system ensures:

1. **Authentication Required**: All pages require user login
2. **Permission-Based Access**: Each route checks for specific permissions
3. **Role-Based Permissions**: Each role has a predefined set of permissions
4. **Admin Override**: ADMIN role has ALL permissions automatically

### Core Permissions by Category:

**Dashboard & Overview:**
- `VIEW_DASHBOARD` - Access to main dashboard
- `VIEW_FLEET_OVERVIEW` - Fleet-wide data access
- `VIEW_FINANCIAL_DATA` - Financial metrics access

**Voyage Management:**
- `VIEW_VOYAGES` - View voyage data
- `CREATE_VOYAGES` - Create new voyages
- `EDIT_VOYAGES` - Modify voyage details
- `DELETE_VOYAGES` - Remove voyages

**Fuel Management:**
- `VIEW_FUEL_DATA` - View fuel consumption
- `ENTER_FUEL_CONSUMPTION` - Log fuel data
- `EDIT_FUEL_DATA` - Modify fuel records
- `VERIFY_FUEL_DATA` - Verify and approve fuel data

**Compliance:**
- `VIEW_COMPLIANCE_DATA` - View compliance status
- `VIEW_REGULATIONS` - Access regulation database
- `MANAGE_COMPLIANCE` - Manage compliance processes
- `GENERATE_COMPLIANCE_REPORTS` - Generate reports

**Trading:**
- `VIEW_RFQ_BOARD` - View RFQ board
- `CREATE_RFQ` - Create new RFQs
- `RESPOND_TO_RFQ` - Respond to RFQs
- `MANAGE_RFQ` - Manage RFQ lifecycle

**Engineering:**
- `VIEW_ENGINE_STATUS` - View engine data
- `MANAGE_WHR_SYSTEMS` - Manage waste heat recovery
- `MANAGE_MAINTENANCE` - Maintenance planning
- `VIEW_EMISSIONS_DATA` - Emissions monitoring

**Crew & Tasks:**
- `VIEW_CREW_TASKS` - View assigned tasks
- `ASSIGN_TASKS` - Assign tasks to crew
- `COMPLETE_TASKS` - Mark tasks complete
- `VIEW_LEAGUE` - View crew performance

**Administration:**
- `MANAGE_USERS` - User management
- `SYSTEM_ADMIN` - System configuration
- `VIEW_SETTINGS` - Settings access
- `EDIT_USER_PROFILE` - Profile customization
- `CUSTOMIZE_DASHBOARD` - Dashboard personalization

---

## Implementation Details

### Route Protection
All routes use the `ProtectedRoute` component which:
1. Checks if user is authenticated
2. Verifies required permission
3. Shows "Access Denied" page if unauthorized
4. Allows access if permission granted

### Example Route Configuration:
```tsx
<Route path="/fleet-management" element={
  <RequireAuth>
    <ProtectedRoute requiredPermission={Permission.VIEW_FLEET_OVERVIEW}>
      <FleetManagement />
    </ProtectedRoute>
  </RequireAuth>
} />
```

### Dynamic Navigation
The sidebar navigation is dynamically generated based on user role and permissions:
- Only shows menu items the user has permission to access
- Filters out restricted pages automatically
- Provides role-specific quick access to relevant features

---

## Security Features

1. **Server-Side Validation**: All permissions must also be validated on the backend
2. **Permission Checking**: Every page component can check `hasPermission()` for feature flags
3. **Unauthorized Redirect**: Users without permission see a friendly "Access Denied" message
4. **Audit Trail**: All access attempts should be logged for security compliance

---

## Testing RBAC

To test different role access:
1. Use the User Switcher in the header (avatar dropdown)
2. Select different user roles
3. Observe which menu items and pages are accessible
4. Verify "Access Denied" shows for restricted pages

---

## Backend Integration

**Important**: This frontend RBAC must be mirrored in the backend services:

```
services/auth/src/middleware/authz.ts
```

The backend should:
- Validate JWT tokens contain role information
- Check permissions before serving data
- Return 403 Forbidden for unauthorized requests
- Log access attempts for audit compliance

---

## Maintenance

When adding new pages or features:
1. Define required permission in `types/user.ts` (Permission enum)
2. Add permission to appropriate roles in `ROLE_PERMISSIONS`
3. Add route with `<ProtectedRoute requiredPermission={...}>` in `App.tsx`
4. Add menu item to role-specific navigation in `RoleBasedSidebar.tsx`
5. Update this documentation

---

Last Updated: November 2, 2025

