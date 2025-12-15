-- Populate port_code column with UN/LOCODE-style codes for major ports
-- UN/LOCODE format: 2-letter country code + 3-letter location code (e.g., NLRTM for Rotterdam, Netherlands)

-- Update major global ports with standard UN/LOCODE codes
UPDATE ports SET port_code = 'RTM' WHERE name = 'Rotterdam' AND country_code = 'NL';
UPDATE ports SET port_code = 'SIN' WHERE name = 'Singapore' AND country_code = 'SG';
UPDATE ports SET port_code = 'SHA' WHERE name = 'Shanghai' AND country_code = 'CN';
UPDATE ports SET port_code = 'HOU' WHERE name = 'Houston' AND country_code = 'US';
UPDATE ports SET port_code = 'HAM' WHERE name = 'Hamburg' AND country_code = 'DE';
UPDATE ports SET port_code = 'ANR' WHERE name = 'Antwerp' AND country_code = 'BE';
UPDATE ports SET port_code = 'PIR' WHERE name = 'Piraeus' AND country_code = 'GR';
UPDATE ports SET port_code = 'HKG' WHERE name = 'Hong Kong' AND country_code = 'HK';
UPDATE ports SET port_code = 'DXB' WHERE name = 'Dubai' AND country_code = 'AE';
UPDATE ports SET port_code = 'BUS' WHERE name = 'Busan' AND country_code = 'KR';
UPDATE ports SET port_code = 'LAX' WHERE name = 'Los Angeles' AND country_code = 'US';
UPDATE ports SET port_code = 'NYC' WHERE name = 'New York' AND country_code = 'US';
UPDATE ports SET port_code = 'LON' WHERE name = 'London' AND country_code = 'GB';
UPDATE ports SET port_code = 'TYO' WHERE name = 'Tokyo' AND country_code = 'JP';
UPDATE ports SET port_code = 'YOK' WHERE name = 'Yokohama' AND country_code = 'JP';
UPDATE ports SET port_code = 'SAI' WHERE name = 'Port Said' AND country_code = 'EG';
UPDATE ports SET port_code = 'SUZ' WHERE name = 'Suez Canal' AND country_code = 'EG';
UPDATE ports SET port_code = 'JEA' WHERE name = 'Jebel Ali' AND country_code = 'AE';
UPDATE ports SET port_code = 'BRE' WHERE name = 'Bremen' AND country_code = 'DE';
UPDATE ports SET port_code = 'GOT' WHERE name = 'Gothenburg' AND country_code = 'SE';
UPDATE ports SET port_code = 'STO' WHERE name = 'Stockholm' AND country_code = 'SE';
UPDATE ports SET port_code = 'HEL' WHERE name = 'Helsinki' AND country_code = 'FI';
UPDATE ports SET port_code = 'OSL' WHERE name = 'Oslo' AND country_code = 'NO';
UPDATE ports SET port_code = 'CPH' WHERE name = 'Copenhagen' AND country_code = 'DK';
UPDATE ports SET port_code = 'MRS' WHERE name = 'Marseille' AND country_code = 'FR';
UPDATE ports SET port_code = 'GEN' WHERE name = 'Genoa' AND country_code = 'IT';
UPDATE ports SET port_code = 'NAP' WHERE name = 'Naples' AND country_code = 'IT';
UPDATE ports SET port_code = 'BCN' WHERE name = 'Barcelona' AND country_code = 'ES';
UPDATE ports SET port_code = 'VLC' WHERE name = 'Valencia' AND country_code = 'ES';
UPDATE ports SET port_code = 'LIS' WHERE name = 'Lisbon' AND country_code = 'PT';
UPDATE ports SET port_code = 'ATH' WHERE name = 'Athens' AND country_code = 'GR';
UPDATE ports SET port_code = 'IST' WHERE name = 'Istanbul' AND country_code = 'TR';
UPDATE ports SET port_code = 'ALX' WHERE name = 'Alexandria' AND country_code = 'EG';
UPDATE ports SET port_code = 'LAG' WHERE name = 'Lagos' AND country_code = 'NG';
UPDATE ports SET port_code = 'CPT' WHERE name = 'Cape Town' AND country_code = 'ZA';
UPDATE ports SET port_code = 'DUR' WHERE name = 'Durban' AND country_code = 'ZA';
UPDATE ports SET port_code = 'MUM' WHERE name = 'Mumbai' AND country_code = 'IN';
UPDATE ports SET port_code = 'KHI' WHERE name = 'Karachi' AND country_code = 'PK';
UPDATE ports SET port_code = 'BKK' WHERE name = 'Bangkok' AND country_code = 'TH';
UPDATE ports SET port_code = 'MNL' WHERE name = 'Manila' AND country_code = 'PH';
UPDATE ports SET port_code = 'SYD' WHERE name = 'Sydney' AND country_code = 'AU';
UPDATE ports SET port_code = 'MEL' WHERE name = 'Melbourne' AND country_code = 'AU';
UPDATE ports SET port_code = 'AKL' WHERE name = 'Auckland' AND country_code = 'NZ';
UPDATE ports SET port_code = 'VAN' WHERE name = 'Vancouver' AND country_code = 'CA';
UPDATE ports SET port_code = 'MTL' WHERE name = 'Montreal' AND country_code = 'CA';
UPDATE ports SET port_code = 'RIO' WHERE name = 'Rio de Janeiro' AND country_code = 'BR';
UPDATE ports SET port_code = 'SSZ' WHERE name = 'Santos' AND country_code = 'BR';
UPDATE ports SET port_code = 'BUE' WHERE name = 'Buenos Aires' AND country_code = 'AR';
UPDATE ports SET port_code = 'VLV' WHERE name = 'Valparaiso' AND country_code = 'CL';

-- For ports without specific UN/LOCODE, generate one based on first 3 letters (uppercase)
UPDATE ports 
SET port_code = UPPER(SUBSTRING(REGEXP_REPLACE(name, '[^A-Za-z]', '', 'g'), 1, 3))
WHERE port_code IS NULL 
  AND name IS NOT NULL 
  AND country_code IS NOT NULL
  AND LENGTH(REGEXP_REPLACE(name, '[^A-Za-z]', '', 'g')) >= 3;

-- Show summary of ports with UN/LOCODE
SELECT 
    'Total ports' as metric,
    COUNT(*) as count
FROM ports
UNION ALL
SELECT 
    'Ports with UN/LOCODE',
    COUNT(*)
FROM ports
WHERE port_code IS NOT NULL AND port_code != '';

