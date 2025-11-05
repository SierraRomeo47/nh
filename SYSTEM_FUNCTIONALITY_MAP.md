# Nautilus Horizon - Complete System Functionality Map

## Table of Contents
1. [User Roles](#user-roles)
2. [Pages by Role](#pages-by-role)
3. [Task Types](#task-types)
4. [League Systems](#league-systems)
5. [Buttons & Actions](#buttons--actions)
6. [Widgets & Components](#widgets--components)
7. [Permissions Matrix](#permissions-matrix)

---

## User Roles

### 1. **CREW** - Crew Member
- Basic operational crew member
- Focus: Daily tasks, fuel logging, vessel performance

### 2. **OFFICER** - Deck Officer
- Navigation and deck operations
- Focus: Voyage management, crew oversight, navigation

### 3. **ENGINEER** - Marine Engineer
- Technical systems and maintenance
- Focus: Engine status, WHR systems, emissions

### 4. **CAPTAIN** - Captain
- Overall vessel responsibility
- Focus: Operations, crew management, safety

### 5. **CHIEF_ENGINEER** - Chief Engineer
- Technical department leadership
- Focus: Technical systems, compliance, crew tasks

### 6. **MANAGER** - Fleet Manager
- Operational and financial oversight
- Focus: Fleet operations, RFQ, financial data

### 7. **COMPLIANCE_OFFICER** - Compliance Officer
- Regulatory compliance focus
- Focus: Compliance monitoring, verification, deadlines

### 8. **TRADER** - Emissions Trader
- Emissions trading specialist
- Focus: RFQ board, trading opportunities, market data

### 9. **TECHNICAL_SUPERINTENDENT** - Technical Superintendent
- Technical oversight across fleet
- Focus: Fleet-wide technical performance, maintenance

### 10. **ADMIN** - Administrator
- Full system access
- Focus: User management, system settings, all features

### 11. **GUEST** - Guest
- Limited access
- Focus: Basic dashboard view only

---

## Pages by Role

### CREW (5 pages)
1. **Dashboard** - Personal vessel overview
2. **My Tasks** (`/crew/tasks`) - Daily tasks and assignments
3. **Crew League** (`/crew/league`) - Performance ranking
4. **Fuel Logging** (`/fuel-logging`) - Log fuel consumption
5. **Safety** (`/safety`) - Safety protocols and inspections

### OFFICER (5 pages)
1. **Dashboard** - Vessel operations overview
2. **Voyages** (`/voyages`) - Manage voyages
3. **Crew Management** (`/crew/tasks`) - Assign crew tasks
4. **Navigation** (`/navigation`) - Navigation status
5. **Fuel Management** (`/fuel-management`) - Fuel data
6. **Safety & Security** (`/safety`) - Safety management

### ENGINEER (6 pages)
1. **Dashboard** - Engine performance overview
2. **Engine Status** (`/engine-status`) - Monitor engines
3. **Waste Heat Recovery** (`/waste-heat-recovery`) - WHR systems
4. **Maintenance** (`/maintenance`) - Maintenance schedules
5. **Emissions** (`/emissions`) - Emissions monitoring
6. **Fuel Consumption** (`/fuel-consumption`) - Track fuel

### CAPTAIN (5 pages)
1. **Dashboard** - Operations overview
2. **Voyages** (`/voyages`) - Manage voyages
3. **Crew Management** (`/crew/tasks`) - Assign tasks
4. **Navigation** (`/navigation`) - Navigation status
5. **Safety & Security** (`/safety`) - Safety management
6. **Compliance** (`/compliance`) - Compliance status

### CHIEF_ENGINEER (6 pages)
1. **Dashboard** - Technical overview
2. **Engine Status** (`/engine-status`) - Monitor engines
3. **Waste Heat Recovery** (`/waste-heat-recovery`) - WHR systems
4. **Maintenance** (`/maintenance`) - Maintenance schedules
5. **Emissions** (`/emissions`) - Emissions monitoring
6. **Engineering Tasks** (`/crew/tasks`) - Assign tasks

### MANAGER (6 pages)
1. **Dashboard** - Fleet overview
2. **Voyages** (`/voyages`) - Manage voyages
3. **RFQ Board** (`/rfq-board`) - Emissions trading
4. **Scenario Pad** (`/scenario-pad`) - Financial modeling
5. **Fleet Management** (`/fleet-management`) - Fleet operations
6. **Crew Management** (`/crew/tasks`) - Crew oversight

### COMPLIANCE_OFFICER (6 pages)
1. **Dashboard** - Compliance overview
2. **Compliance Monitoring** (`/compliance-monitoring`) - Monitor compliance
3. **Marine Regulations** (`/regulations`) - View regulations
4. **Data Verification** (`/verification`) - Verify data
5. **Regulatory Deadlines** (`/regulatory-deadlines`) - Track deadlines
6. **Emissions Trading** (`/rfq-board`) - RFQ board

### TRADER (5 pages)
1. **Dashboard** - Trading overview
2. **Emissions Trading** (`/rfq-board`) - RFQ board
3. **Trading Opportunities** (`/trading-opportunities`) - Opportunities
4. **Market Data** (`/market-data`) - Market information
5. **Trading Portfolio** (`/portfolio`) - Portfolio management

### TECHNICAL_SUPERINTENDENT (5 pages)
1. **Dashboard** - Fleet technical overview
2. **Fleet Management** (`/fleet-management`) - Fleet operations
3. **Technical Performance** (`/technical-performance`) - Performance metrics
4. **Maintenance** (`/maintenance`) - Maintenance oversight
5. **Compliance** (`/compliance`) - Compliance status

### ADMIN (6 pages)
1. **Dashboard** - System overview
2. **Voyages** (`/voyages`) - Manage voyages
3. **RFQ Board** (`/rfq-board`) - RFQ management
4. **Scenario Pad** (`/scenario-pad`) - Financial tools
5. **User Management** (`/user-management`) - User administration
6. **System Settings** (`/system-settings`) - System configuration

### Common Pages (All Roles)
- **Profile** (`/profile`) - User profile
- **Customization** (`/profile-settings`) - Dashboard customization
- **Settings** (`/settings`) - App settings
- **Support** - Help and support

---

## Task Types

### Energy Saving Tasks
- **WHR Optimization** - Optimize waste heat recovery systems (+45 pts)
- **Shaft Generator Motor** - Monitor and maintain generator (+50 pts)
- **Lights Off Protocol** - Maintain energy-efficient lighting (+15 pts)
- **Environmental Checks** - Conduct environmental assessments (+10 pts)
- **Water Conservation** - Implement water-saving measures (+40 pts)

### Operational Tasks
- **Fuel Log Entry** - Log current fuel consumption
- **Safety Check** - Complete safety inspection
- **Engine Maintenance** - Routine engine inspection
- **Voyage Status** - Check current voyage progress
- **Crew Assignments** - Assign crew responsibilities

### Points & Rewards
- Tasks award points for completion
- Points contribute to league rankings
- Points tracked weekly (resets Monday)
- Environmental impact measured in CO₂ and fuel saved

---

## League Systems

### Crew League (Vessel Performance)
- **Ranking By:**
  - Total points earned
  - Efficiency percentage
  - Environmental impact (CO₂ saved)
  
- **Scoring Events:**
  - Task completion (+15 to +50 pts)
  - Efficiency achievements
  - Badge awards (Energy Saver, Environmental Champion)
  
- **Reset Schedule:**
  - Weekly reset (Monday)
  - Seasonal tracking
  
- **Display:**
  - Top 3 vessels ranked
  - Current vessel status
  - Recent score events

### Fleet Performance (Manager View)
- **Overall Fleet Ranking**
- **Fleet Efficiency: 95.2%**
- **Active Vessels: 12**
- **Performance comparison across fleet**

---

## Buttons & Actions

### CREW Actions
- **Fuel Log Entry** - Log current fuel consumption
- **Safety Check** - Complete safety inspection
- **Start Task** - Begin a task
- **Complete Task** - Finish and submit task
- **View All Tasks** - Navigate to full task list
- **View Performance** - Check league position

### OFFICER Actions
- **Voyage Status** - Check current voyage progress
- **Crew Tasks** - Assign crew responsibilities
- **Navigation Management** - Access navigation tools
- **Fuel Management** - Review fuel data

### ENGINEER Actions
- **Engine Status** - Check main engine performance
- **Fuel Log** - Update fuel consumption data
- **WHR Optimization** - Optimize waste heat recovery
- **Maintenance Alert** - Review maintenance requirements

### CAPTAIN Actions
- **Voyage Management** - Manage active voyages
- **Crew Assignment** - Assign crew responsibilities
- **Safety Overview** - Review safety status
- **Compliance Check** - Verify compliance status

### MANAGER Actions
- **Fleet Overview** - View fleet operations
- **RFQ Creation** - Create new RFQ
- **Financial Analysis** - Analyze financial data
- **Scenario Planning** - Run financial scenarios

### COMPLIANCE_OFFICER Actions
- **Verify Data** - Verify fuel consumption data
- **Generate Report** - Create compliance reports
- **Track Deadlines** - Monitor regulatory deadlines
- **Create RFQ** - Post emissions trading RFQ

### TRADER Actions
- **Create RFQ** - Post trading request
- **Respond to RFQ** - Submit responses
- **Market Analysis** - Analyze market trends
- **Portfolio Management** - Manage trading portfolio

### ADMIN Actions
- **User Management** - Add/edit/remove users
- **System Configuration** - Configure system settings
- **Role Assignment** - Assign user roles
- **Permission Management** - Manage permissions

---

## Widgets & Components

### Dashboard Widgets

#### Fleet Overview Widget
- Active voyages count
- FuelEU surplus/deficit
- Total EUA exposure
- Vessel-specific: Active voyages, vessel status, fuel consumption, efficiency

#### TCC Meter Widget
- Fuel costs
- ETS costs
- FuelEU costs
- Total cost breakdown

#### EUA Price Widget
- Real-time EUA pricing
- Price trends
- Market ticker

#### My Tasks Widget
- Available tasks
- In-progress tasks
- Points per task
- Expected fuel/CO₂ savings

#### Crew League Widget
- Vessel performance ranking
- Fleet performance (managers)
- Current position
- Efficiency percentage

#### Compliance Status Widget
- EU ETS compliance status
- FuelEU status
- Regulatory compliance
- Verification status

#### Financial Summary Widget
- Total fuel costs
- ETS costs
- FuelEU costs
- Total TCC

#### Compliance Alerts Widget
- Approaching deadlines
- Verification requirements
- Action items

#### RFQ Board Widget
- Available surpluses
- Deficit requests
- Expiration dates

#### Engine Status Widget
- Main engine status
- Auxiliary engine status
- Fuel consumption rate

#### Fuel Consumption Widget
- Daily consumption
- Weekly consumption
- Efficiency trends

#### Waste Heat Recovery Widget
- WHR system status
- Energy savings
- Optimization tasks

#### Emissions Monitoring Widget
- CO₂ emissions
- SOx emissions
- NOx emissions
- CII rating

#### Regulations Compliance Widget
- IMO 2024 GHG Strategy
- EU ETS Maritime
- FuelEU Maritime

#### Technical Performance Widget
- Propulsion efficiency
- Engine load
- Hull condition
- Propeller efficiency

#### Safety Metrics Widget
- Safety score
- Incident count
- Safety drills
- Certification status

#### Marine Weather Widget
- Wind speed
- Wave height
- Visibility
- Sea state

#### Navigation Status Widget
- GPS status
- AIS status
- Current speed
- Course

#### Cargo Management Widget
- Cargo load percentage
- Stability status
- Ballast status
- Trim

---

## Permissions Matrix

### Permission Levels by Role

| Permission | CREW | OFFICER | ENGINEER | CAPTAIN | CHIEF_ENG | MANAGER | COMPLIANCE | TRADER | TECH_SUP | ADMIN |
|------------|------|---------|----------|---------|-----------|---------|------------|--------|----------|-------|
| **VIEW_DASHBOARD** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **VIEW_FLEET_OVERVIEW** | ❌ | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |
| **VIEW_FINANCIAL_DATA** | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ | ✅ |
| **VIEW_COMPLIANCE_DATA** | ❌ | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |
| **VIEW_VOYAGES** | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |
| **CREATE_VOYAGES** | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ |
| **EDIT_VOYAGES** | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ |
| **DELETE_VOYAGES** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **VIEW_FUEL_DATA** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |
| **ENTER_FUEL_CONSUMPTION** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| **EDIT_FUEL_DATA** | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ |
| **VERIFY_FUEL_DATA** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ |
| **VIEW_RFQ_BOARD** | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ | ✅ |
| **CREATE_RFQ** | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ | ✅ |
| **RESPOND_TO_RFQ** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ |
| **MANAGE_RFQ** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ✅ |
| **VIEW_CREW_TASKS** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ |
| **ASSIGN_TASKS** | ❌ | ✅ | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ |
| **COMPLETE_TASKS** | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **VIEW_LEAGUE** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| **VIEW_SETTINGS** | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **EDIT_USER_PROFILE** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **MANAGE_USERS** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **SYSTEM_ADMIN** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **MANAGE_WHR_SYSTEMS** | ❌ | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **VIEW_ENGINE_STATUS** | ❌ | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **MANAGE_MAINTENANCE** | ❌ | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **VIEW_EMISSIONS_DATA** | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **VIEW_REGULATIONS** | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ | ✅ |
| **MANAGE_COMPLIANCE** | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |
| **GENERATE_COMPLIANCE_REPORTS** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ |
| **CUSTOMIZE_DASHBOARD** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **MANAGE_PROFILE_SETTINGS** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## Quick Actions by Role

### CREW Quick Actions
- Log fuel consumption
- Complete safety checks
- View daily tasks
- Check performance ranking

### OFFICER Quick Actions
- Manage voyages
- Assign crew tasks
- Monitor navigation
- Review safety status

### ENGINEER Quick Actions
- Check engine status
- Update fuel logs
- Monitor WHR systems
- Review maintenance schedules

### CAPTAIN Quick Actions
- Manage voyages
- Assign crew responsibilities
- Review safety overview
- Check compliance status

### MANAGER Quick Actions
- View fleet overview
- Create RFQ
- Analyze financial data
- Manage crew across fleet

### COMPLIANCE_OFFICER Quick Actions
- Verify fuel data
- Generate compliance reports
- Track regulatory deadlines
- Create emissions trading RFQ

### TRADER Quick Actions
- Create RFQ
- Respond to RFQ
- Analyze market data
- Manage trading portfolio

### ADMIN Quick Actions
- Manage users
- Configure system
- Assign roles
- Monitor system health

---

## Key Features Summary

### Gamification (CREW Focus)
- **Points System**: Earn points for energy-saving tasks
- **League Ranking**: Compete with other vessels
- **Badges**: Achieve badges for milestones
- **Environmental Impact**: Track CO₂ and fuel savings

### Operational Management
- **Voyage Tracking**: Monitor active voyages
- **Crew Tasks**: Assign and track crew responsibilities
- **Fuel Logging**: Log fuel consumption data
- **Safety Management**: Track safety protocols

### Technical Monitoring
- **Engine Status**: Real-time engine monitoring
- **WHR Systems**: Waste heat recovery optimization
- **Emissions**: Track CO₂, SOx, NOx emissions
- **Maintenance**: Schedule and track maintenance

### Compliance & Trading
- **EU ETS**: Monitor ETS compliance
- **FuelEU**: Track FuelEU Maritime compliance
- **RFQ Board**: Create and respond to trading requests
- **Deadlines**: Track regulatory deadlines

### Financial Management
- **TCC Meter**: Total cost of compliance tracking
- **Scenario Planning**: Financial modeling
- **Market Data**: Real-time market information
- **Portfolio**: Trading portfolio management

---

## Notes

- **Vessel-Specific Data**: CREW, ENGINEER, CAPTAIN, CHIEF_ENGINEER see vessel-specific data
- **Fleet-Wide Data**: MANAGER, TECHNICAL_SUPERINTENDENT see fleet-wide data
- **Weekly Reset**: League points reset every Monday
- **Environmental Focus**: All tasks contribute to environmental savings tracking
- **Permission-Based Access**: Each role has specific permissions for security
- **Customizable Dashboards**: Users can customize their dashboard layout


