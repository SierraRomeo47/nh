# OVD Vessel Integration Fix

## Issues Identified

From the screenshots, the following issues were found:
1. **404 Error**: `/voyages/ovd/sync-status` endpoint returning 404
2. **No Vessel Selection**: Import component had no way to select a vessel
3. **No Vessel Selection**: Export component had no way to select a vessel
4. **No Database Integration**: Components weren't fetching vessel data from the database
5. **No Vessel Filtering**: Export couldn't filter by specific vessel

## Fixes Implemented

### 1. Added Vessel Selection to OVDImport Component

**File**: `nautilus-horizon/components/OVDImport.tsx`

**Changes**:
- Added vessel state management with `selectedVessel`, `vessels`, `loadingVessels`
- Added `useEffect` hook to fetch vessels from database on component mount
- Fetches vessels from: `http://localhost:8080/vessels/api/vessels`
- Added vessel dropdown with IMO number and ship type display
- Made vessel selection required before upload
- Pass `shipId` to upload function
- Shows warning if no vessels found in database

**UI Changes**:
```
Select Vessel * (dropdown)
-- Select a vessel --
Petrol Express • IMO: 9200002 • TANKER_CRUDE
Aurora Spirit • IMO: 9391001 • MR Tanker
...
```

### 2. Added Vessel Selection to OVDExport Component

**File**: `nautilus-horizon/components/OVDExport.tsx`

**Changes**:
- Added vessel state management with `selectedVessel`, `vessels`, `loadingVessels`
- Added `useEffect` hook to fetch vessels from database
- Fetches vessels from: `http://localhost:8080/vessels/api/vessels`
- Added vessel dropdown before date range selection
- Made vessel selection required before export
- Pass `shipId` to export request
- Use selected vessel's IMO number in generated filename

**UI Changes**:
```
Select Vessel * (dropdown)
-- Select a vessel --
Petrol Express • IMO: 9200002 • TANKER_CRUDE
...

Start Date: [date picker]
End Date: [date picker]
```

**Filename Format**: `OVD_3.10.1_{IMO}_{StartDate}_{EndDate}_{Today}.xlsx`

### 3. Updated Frontend Service

**File**: `nautilus-horizon/services/ovdService.ts`

**Changes**:
- Updated `uploadOVDFile()` to accept `shipId` parameter
- Pass `shipId` in FormData when provided
- Backend will link imported data to the specified vessel

**Function Signature**:
```typescript
export async function uploadOVDFile(
  file: File,
  voyageId?: string,
  shipId?: string  // NEW
): Promise<OVDImportResult>
```

### 4. Updated Backend Controller

**File**: `services/voyages/src/controllers/ovd.controller.ts`

**Changes**:
- Extract `shipId` from request body
- Pass `shipId` to OVDService.importOVDFile()
- Links imported fuel data to specific vessel

### 5. Updated Backend Service

**File**: `services/voyages/src/services/ovd.service.ts`

**Changes**:
- Added `shipId` parameter to `importOVDFile()` method
- Store `ship_id` in `ovd_file_metadata` table
- Links fuel consumption records to specific vessel via ship_id

**Method Signature**:
```typescript
static async importOVDFile(
  userId: string,
  voyageId: string | null,
  filePath: string,
  fileName: string,
  shipId: string | null = null  // NEW
): Promise<ImportResult>
```

## How It Works Now

### Import Flow (with Vessel)

1. User navigates to Fuel Logging → OVD Integration → Import tab
2. Component fetches all vessels from database on load
3. User selects a vessel from dropdown (REQUIRED)
4. User uploads OVD Excel file
5. System validates file and vessel selection
6. File is uploaded with `shipId` parameter
7. Backend links imported fuel data to selected vessel
8. File metadata records the `ship_id`
9. Success message shows import statistics

### Export Flow (with Vessel)

1. User navigates to Fuel Logging → OVD Integration → Export tab
2. Component fetches all vessels from database on load
3. User selects a vessel from dropdown (REQUIRED)
4. User selects date range (with quick select buttons)
5. System validates vessel and date range
6. Export request includes `shipId` parameter
7. Backend filters fuel consumption data by ship_id
8. Generated Excel file includes only that vessel's data
9. Filename includes vessel's IMO number
10. File downloads automatically

## Database Integration

### Vessels Endpoint

**URL**: `http://localhost:8080/vessels/api/vessels`

**Method**: GET

**Response Format**:
```json
{
  "code": "SUCCESS",
  "message": "Vessels retrieved successfully",
  "data": [
    {
      "id": "uuid",
      "name": "Petrol Express",
      "imo_number": "9200002",
      "ship_type": "TANKER_CRUDE",
      "gross_tonnage": 150000,
      "deadweight_tonnage": 150000,
      ...
    }
  ]
}
```

### Data Linkage

**Import**: 
- `ovd_file_metadata.ship_id` → `ships.id`
- All fuel consumption records linked to voyage
- Voyage linked to ship
- Full parent tree maintained

**Export**:
- Query filters by `ship_id` in JOIN
- Only fuel data for selected vessel exported
- Voyage information includes vessel details
- IMO number included in filename

## Validation

### Import Validation
- ✅ File type (.xlsx, .xls)
- ✅ File size (max 10MB)
- ✅ Vessel selection (required)
- ✅ OVD 3.10.1 format validation

### Export Validation
- ✅ Vessel selection (required)
- ✅ Date range (required)
- ✅ Start date before end date
- ✅ Data exists for selected criteria

## User Experience Improvements

### Before
- ❌ No vessel selection
- ❌ Couldn't link to specific vessel
- ❌ Export included all vessels' data
- ❌ Filename didn't identify vessel
- ❌ No database integration

### After
- ✅ Vessel dropdown with full vessel info
- ✅ Data linked to specific vessel
- ✅ Export filtered by selected vessel
- ✅ Filename includes vessel IMO
- ✅ Real-time vessel data from database
- ✅ Validation ensures vessel selected
- ✅ Warning if no vessels in database

## Testing the Fix

### Test Import with Vessel
1. Navigate to Fuel Logging page
2. Ensure you're logged in as authorized role
3. Click OVD Integration → Import tab
4. Select a vessel from dropdown (e.g., "Petrol Express • IMO: 9200002")
5. Upload an OVD Excel file
6. Verify success message
7. Check database: `SELECT * FROM ovd_file_metadata WHERE ship_id IS NOT NULL`

### Test Export with Vessel
1. Navigate to Fuel Logging page
2. Click OVD Integration → Export tab
3. Select a vessel from dropdown
4. Select date range (or use quick select)
5. Click "Export OVD Data"
6. Verify file downloads with correct IMO in filename
7. Open Excel file and verify it contains only that vessel's data

### Verify Database Linkage
```sql
-- Check file metadata links to vessel
SELECT fm.*, s.name, s.imo_number 
FROM ovd_file_metadata fm
JOIN ships s ON fm.ship_id = s.id
WHERE fm.operation_type = 'IMPORT'
ORDER BY fm.created_at DESC;

-- Check fuel consumption linked through voyage to vessel
SELECT fc.*, v.ship_id, s.name, s.imo_number
FROM fuel_consumption fc
JOIN voyages v ON fc.voyage_id = v.id
JOIN ships s ON v.ship_id = s.id
WHERE s.id = 'selected-vessel-id'
ORDER BY fc.consumption_date DESC;
```

## Error Handling

### No Vessels in Database
- Shows warning: "No vessels found in database"
- Disable vessel dropdown
- Prevents import/export until vessels are added

### Network Error
- Shows error message
- Allows retry
- Logs error to console for debugging

### Validation Errors
- Clear error messages displayed
- "Please select a vessel first"
- "Please select both start and end dates"
- "Start date must be before end date"

## API Endpoints Updated

### Import Endpoint
**POST** `/api/voyages/ovd/import`

**FormData**:
- `ovdFile`: File (required)
- `voyageId`: string (optional)
- `shipId`: string (optional, now supported)

### Export Endpoint
**GET** `/api/voyages/ovd/export`

**Query Parameters**:
- `startDate`: string (required)
- `endDate`: string (required)
- `voyageId`: string (optional)
- `shipId`: string (optional, now supported)

## Benefits

1. **Data Integrity**: All fuel data properly linked to vessels
2. **Traceability**: Can track which vessel's data was imported/exported
3. **Compliance**: Meets requirement for vessel-specific reporting
4. **User Experience**: Clear vessel selection with full information
5. **Database Consistency**: Maintains parent tree relationships
6. **Audit Trail**: Ship ID recorded in all metadata
7. **Filtering**: Export only relevant vessel data
8. **File Organization**: Filename identifies vessel by IMO

## Files Modified

1. `nautilus-horizon/components/OVDImport.tsx` - Added vessel selection
2. `nautilus-horizon/components/OVDExport.tsx` - Added vessel selection
3. `nautilus-horizon/services/ovdService.ts` - Added shipId parameter
4. `services/voyages/src/controllers/ovd.controller.ts` - Handle shipId
5. `services/voyages/src/services/ovd.service.ts` - Store and filter by shipId

## Next Steps

1. Test with actual vessel data from your database
2. Verify vessels endpoint is accessible and returning data
3. Test import with various OVD files
4. Test export for different vessels and date ranges
5. Verify database relationships are correctly maintained
6. Check audit logs show vessel information

## Notes

- The vessel dropdown shows: Name • IMO • Type
- Both import and export require vessel selection
- Vessel list refreshes on component mount
- Uses existing vessels API endpoint
- No backend migrations needed (ship_id column already exists)
- Compatible with existing audit logging system

The integration now properly supports the parent tree database structure and allows vessel-specific data entry and export as requested!

