# User Profile and Role-Based Dashboard System

## Overview

The Nautilus Horizon application now features a comprehensive user profile system with role-based dashboards that automatically customize the interface based on the user's role and permissions. This system ensures that each user sees only the information and functionality relevant to their responsibilities.

## User Roles and Permissions

### Supported User Roles

1. **CREW** - Deck crew members and general ship personnel
2. **OFFICER** - Ship officers and department heads
3. **ENGINEER** - Engine room personnel and technical staff
4. **MANAGER** - Fleet managers and operational supervisors
5. **COMPLIANCE_OFFICER** - Regulatory compliance specialists
6. **TRADER** - Trading and RFQ management personnel
7. **ADMIN** - System administrators with full access
8. **GUEST** - Limited access for visitors

### Role-Based Permissions

Each role has specific permissions that control:
- **Dashboard Access**: What widgets and data they can see
- **Navigation**: Which menu items are available
- **Actions**: What operations they can perform
- **Data Access**: Which reports and information they can view

## Dashboard Customization

### Crew Member Dashboard
- **Focus**: Personal tasks and performance
- **Widgets**: My Tasks, Crew League, Fuel Consumption
- **Layout**: Compact 2-column layout
- **Features**: Task completion, performance tracking, fuel logging

### Officer Dashboard
- **Focus**: Vessel operations and crew management
- **Widgets**: Fleet Overview, Active Voyages, Crew Tasks, Compliance Status
- **Layout**: 3-column grid layout
- **Features**: Voyage monitoring, crew task assignment, compliance oversight

### Engineer Dashboard
- **Focus**: Technical operations and maintenance
- **Widgets**: Engine Status, Fuel Consumption, Efficiency Metrics, Maintenance Alerts
- **Layout**: 2-column grid layout
- **Features**: Engine monitoring, fuel efficiency tracking, maintenance scheduling

### Manager Dashboard
- **Focus**: Fleet operations and financial performance
- **Widgets**: Fleet Overview, TCC Meter, Financial Summary, Compliance Alerts
- **Layout**: 3-column grid layout
- **Features**: Fleet management, financial oversight, compliance monitoring

### Compliance Officer Dashboard
- **Focus**: Regulatory compliance and verification
- **Widgets**: Compliance Status, EUA Price, Compliance Alerts, Verification Status, Regulatory Deadlines
- **Layout**: 3-column grid layout
- **Features**: Compliance monitoring, verification management, deadline tracking

### Trader Dashboard
- **Focus**: Trading operations and market data
- **Widgets**: RFQ Board, Market Data, Trading Opportunities
- **Layout**: 2-column grid layout
- **Features**: RFQ management, market analysis, trading opportunities

### Admin Dashboard
- **Focus**: System overview and administration
- **Widgets**: All available widgets with full access
- **Layout**: 4-column grid layout
- **Features**: System management, user administration, full system access

## Navigation Customization

### Role-Based Menu Items

Each role sees different navigation options:

**Crew Members** see:
- Dashboard
- My Tasks
- League
- Fuel Logging

**Officers** see:
- Dashboard
- Voyages
- Crew Tasks
- Crew League
- Fuel Management

**Engineers** see:
- Dashboard
- Engine Status
- Fuel Consumption
- Maintenance
- League

**Managers** see:
- Dashboard
- Voyages
- RFQ Board
- Scenario Pad
- Fleet Management
- Crew Management

**Compliance Officers** see:
- Dashboard
- Compliance Monitoring
- RFQ Board
- Verification
- Regulatory Deadlines
- Voyage Reports

**Traders** see:
- Dashboard
- RFQ Board
- Trading Opportunities
- Market Data
- Portfolio

**Admins** see:
- All navigation items with full access

## User Profile Management

### Profile Information
- **Personal Details**: Name, email, phone, position, rank
- **Role Assignment**: User role and department
- **Organization**: Company and ship assignment
- **Preferences**: Language, timezone, theme preferences

### Profile Customization
- **Editable Fields**: Personal information, contact details, preferences
- **Read-Only Fields**: Role, permissions, system-generated data
- **Avatar Support**: User profile pictures
- **Certification Tracking**: Professional certifications and licenses

## Authentication System

### Mock Authentication
- **Demo Users**: Pre-configured users for each role
- **Password**: Simple "password" for all demo users
- **Session Management**: Local storage-based session handling
- **Auto-Login**: Defaults to Compliance Officer for demo

### Production Ready
- **API Integration**: Ready for real authentication APIs
- **Token Management**: JWT token support structure
- **Session Security**: Secure session handling
- **Password Policies**: Configurable password requirements

## User Switcher

### Development Feature
- **Role Testing**: Easy switching between user roles
- **Visual Indicator**: Current role display
- **Quick Access**: Dropdown menu for role selection
- **Demo Purpose**: For testing different user experiences

## Widget System

### Available Widgets
1. **Fleet Overview** - Vessel and voyage statistics
2. **TCC Meter** - Total Compliance Cost visualization
3. **EUA Price** - Real-time EUA price ticker
4. **My Tasks** - Personal task management
5. **Crew League** - Performance leaderboard
6. **Compliance Status** - Regulatory compliance overview
7. **Financial Summary** - Cost breakdown and totals
8. **Compliance Alerts** - Regulatory deadline notifications
9. **RFQ Board** - Trading opportunities
10. **Engine Status** - Technical system status
11. **Fuel Consumption** - Fuel usage tracking

### Widget Configuration
- **Positioning**: Grid-based layout system
- **Visibility**: Role-based widget visibility
- **Customization**: User-configurable dashboard layouts
- **Responsive**: Adaptive to screen sizes

## Implementation Details

### Context System
- **UserContext**: Centralized user state management
- **Permission Checking**: Real-time permission validation
- **Role Switching**: Dynamic role and permission updates
- **State Persistence**: Local storage for user preferences

### Component Architecture
- **RoleBasedDashboard**: Main dashboard component
- **RoleBasedSidebar**: Navigation component
- **UserProfile**: Profile management component
- **UserSwitcher**: Development role switching tool

### Data Flow
1. **User Login**: Authentication and role assignment
2. **Permission Loading**: Role-based permission setup
3. **Dashboard Configuration**: Widget and layout setup
4. **Navigation Filtering**: Menu item visibility
5. **Content Rendering**: Role-appropriate content display

## Usage Examples

### Switching User Roles
1. Click on the user profile in the header
2. Select a different role from the dropdown
3. The interface automatically updates to match the new role
4. Navigation and dashboard content change accordingly

### Customizing Dashboard
1. Navigate to Profile settings
2. Edit dashboard preferences
3. Configure widget visibility
4. Save changes to persist layout

### Managing Permissions
1. Admin users can modify user roles
2. Permissions are automatically updated
3. Interface reflects new permission set
4. Access is immediately restricted/expanded

## Security Considerations

### Permission Validation
- **Client-Side**: UI element visibility control
- **Server-Side**: API endpoint protection (ready for implementation)
- **Route Protection**: Navigation access control
- **Data Filtering**: Role-based data access

### Session Management
- **Secure Storage**: Encrypted local storage
- **Session Expiry**: Configurable session timeouts
- **Token Refresh**: Automatic token renewal
- **Logout Handling**: Secure session cleanup

## Future Enhancements

### Planned Features
1. **Advanced Permissions**: Granular permission system
2. **Team Management**: Department and team organization
3. **Audit Logging**: User action tracking
4. **Multi-Tenant**: Organization-level isolation
5. **SSO Integration**: Single sign-on support
6. **Mobile Optimization**: Mobile-specific interfaces

### Scalability
- **Database Integration**: User data persistence
- **API Services**: Backend user management
- **Caching**: Performance optimization
- **Load Balancing**: Multi-user support

## Testing

### Demo Users
- **Crew**: crew@poseidon.com
- **Officer**: officer@poseidon.com
- **Engineer**: engineer@poseidon.com
- **Manager**: manager@poseidon.com
- **Compliance**: compliance@poseidon.com
- **Trader**: trader@poseidon.com
- **Admin**: admin@poseidon.com

### Password
- All demo users use: `password`

### Testing Scenarios
1. **Role Switching**: Test all user roles
2. **Permission Validation**: Verify access restrictions
3. **Dashboard Customization**: Test widget visibility
4. **Navigation Filtering**: Confirm menu item access
5. **Profile Management**: Test profile editing

This user profile system provides a comprehensive foundation for role-based access control and personalized user experiences in the Nautilus Horizon application.
