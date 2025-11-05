# Quick Reference: Role-to-Page Access Mapping

## 📊 Visual Access Matrix

| Page/Feature | Admin | Ops Super | Tech Super | Fleet Mgr | Compliance | Trader | Captain | Chief Eng | 2nd Officer | 2nd Engineer | Able Seaman | Ord Seaman |
|--------------|:-----:|:---------:|:----------:|:---------:|:----------:|:------:|:-------:|:---------:|:-----------:|:------------:|:-----------:|:----------:|
| **Dashboard** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **User Management** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **System Settings** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Fleet Management** | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Voyages** | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Crew Tasks** | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Crew League** | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Fuel Logging** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Fuel Consumption** | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Engine Status** | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ |
| **Waste Heat Recovery** | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ |
| **Maintenance** | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ |
| **Compliance Monitoring** | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Verification** | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Regulatory Deadlines** | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Trading Opportunities** | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Market Data** | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Portfolio** | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **RFQ Board** | ✅ | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Scenario Pad** | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Profile Settings** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## 🎯 Role Descriptions

### **Administrative Roles**

**System Administrator**
- Full system access
- User and system management
- All features enabled
- Security and audit oversight

**Ops Superintendent**
- Operational oversight across fleet
- Voyage planning and execution
- Crew coordination
- Compliance monitoring
- Scenario planning

**Tech Superintendent**
- Technical operations oversight
- Engineering systems monitoring
- Maintenance coordination
- Performance optimization
- Compliance for technical operations

---

### **Management Roles**

**Fleet Manager**
- Fleet-wide operational management
- Voyage planning
- Crew management
- Financial oversight via RFQ board
- Scenario planning

**Compliance Manager**
- Regulatory compliance leadership
- Data verification and approval
- Deadline tracking
- Emissions trading oversight
- Audit coordination

---

### **Trading Roles**

**Emissions Trader**
- Emissions trading operations
- Market analysis and monitoring
- Portfolio management
- Trading opportunities identification
- RFQ board participation

---

### **Vessel Command Roles**

**Captain**
- Overall vessel responsibility
- Voyage execution and planning
- Crew management and leadership
- Safety and security
- Compliance oversight
- Navigation oversight

**Chief Engineer**
- Engineering department leadership
- Technical systems oversight
- Maintenance planning and execution
- Environmental compliance
- Crew task assignment (engineering)

---

### **Officer Roles**

**Second Officer (Deck)**
- Navigation duties
- Deck operations
- Crew coordination
- Safety compliance
- Fuel logging
- Performance monitoring

**Second Engineer**
- Engineering operations
- Systems monitoring
- Maintenance execution
- Fuel consumption tracking
- Emissions monitoring
- Task completion

---

### **Crew Roles**

**Able Seaman**
- Operational tasks execution
- Fuel data logging
- Safety participation
- Performance tracking via crew league
- Limited system access

**Ordinary Seaman**
- Basic operational tasks
- Fuel data logging
- Safety participation
- Performance tracking
- Limited system access

---

## 🔐 Security Implementation

### Frontend Protection
- Routes protected by `ProtectedRoute` component
- Permission checks via `hasPermission()` function
- Dynamic menu based on user permissions
- "Access Denied" page for unauthorized access

### Backend Protection (Required)
All backend APIs must implement matching RBAC:

```typescript
// services/auth/src/middleware/authz.ts
export const requirePermission = (permission: Permission) => {
  return (req, res, next) => {
    if (!req.user.hasPermission(permission)) {
      return res.status(403).json({
        code: 'FORBIDDEN',
        message: 'Insufficient permissions'
      });
    }
    next();
  };
};
```

---

## 📝 Testing Checklist

- [ ] Admin can access all 21 pages
- [ ] Ops Superintendent sees 7 appropriate pages
- [ ] Tech Superintendent sees 7 technical pages
- [ ] Fleet Manager sees 10 management pages
- [ ] Compliance Manager sees 10 compliance pages
- [ ] Emissions Trader sees 5 trading pages
- [ ] Captain sees 9 command pages
- [ ] Chief Engineer sees 11 engineering pages
- [ ] Second Officer sees 8 deck pages
- [ ] Second Engineer sees 9 engineering pages
- [ ] Able Seaman sees 5 crew pages
- [ ] Ordinary Seaman sees 5 crew pages
- [ ] All roles can access Profile Settings
- [ ] Unauthorized access shows "Access Denied"
- [ ] Backend validates permissions for all API calls

---

## 🚀 How to Test

1. **Start the application**: `http://localhost:3000`
2. **Click your avatar** in the top right
3. **Select "Switch User"** from dropdown
4. **Choose different roles** to test access
5. **Verify sidebar menu** shows only permitted pages
6. **Try accessing restricted URLs** directly to see "Access Denied"

---

Last Updated: November 2, 2025
System: Nautilus Horizon v1.3

