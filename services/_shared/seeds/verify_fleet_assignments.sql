-- Verify Fleet Assignments
-- This script checks that all 30 vessels are assigned to fleets

-- Check total vessels and fleet assignments
SELECT 
    'Total Vessels' as metric,
    COUNT(*)::text as value
FROM ships
UNION ALL
SELECT 
    'Vessels in Fleets' as metric,
    COUNT(DISTINCT ship_id)::text as value
FROM fleet_vessels
UNION ALL
SELECT 
    'Unassigned Vessels' as metric,
    COUNT(*)::text as value
FROM ships s
WHERE NOT EXISTS (
    SELECT 1 FROM fleet_vessels fv WHERE fv.ship_id = s.id
);

-- Show vessels by fleet
SELECT 
    f.name as fleet_name,
    COUNT(fv.ship_id) as vessel_count,
    STRING_AGG(s.name, ', ' ORDER BY s.name) as vessels
FROM fleets f
LEFT JOIN fleet_vessels fv ON f.id = fv.fleet_id
LEFT JOIN ships s ON fv.ship_id = s.id
GROUP BY f.id, f.name
ORDER BY f.name;

-- Show any unassigned vessels (should be none)
SELECT 
    s.id,
    s.name,
    s.ship_type,
    s.imo_number
FROM ships s
WHERE NOT EXISTS (
    SELECT 1 FROM fleet_vessels fv WHERE fv.ship_id = s.id
)
ORDER BY s.name;


