#!/usr/bin/env python3
"""
Create SQL file to import ports into PostgreSQL.
Filters for sea ports (Function contains '1').
"""

import pandas as pd

def create_ports_sql(excel_file, output_file):
    """Read Excel and create SQL file."""
    print(f"Reading Excel file: {excel_file}")
    
    # Read UNLOCODE sheet
    df = pd.read_excel(excel_file, sheet_name='UNLOCODE')
    
    # Filter for sea ports (Function contains '1')
    sea_ports = df[df['Function'].str.contains('1', na=False)].copy()
    print(f"Sea ports found: {len(sea_ports)}")
    
    # Create UNLOCODE
    sea_ports['UNLOCODE'] = sea_ports['Country'].astype(str) + sea_ports['Location'].astype(str)
    
    # Clean coordinates
    sea_ports['Lat in Decimal Degrees'] = pd.to_numeric(sea_ports['Lat in Decimal Degrees'], errors='coerce')
    sea_ports['Long in Decimal Degrees'] = pd.to_numeric(sea_ports['Long in Decimal Degrees'], errors='coerce')
    
    # Remove rows with missing coordinates
    sea_ports = sea_ports.dropna(subset=['Lat in Decimal Degrees', 'Long in Decimal Degrees'])
    print(f"Ports with valid coordinates: {len(sea_ports)}")
    
    # Create SQL file
    with open(output_file, 'w', encoding='utf-8') as f:
        # Create table
        f.write("""
-- Create ports table
DROP TABLE IF EXISTS ports CASCADE;

CREATE TABLE ports (
    id SERIAL PRIMARY KEY,
    unlocode VARCHAR(5) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    country_code VARCHAR(2) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    function_code VARCHAR(10),
    iata_code VARCHAR(3),
    subdivision VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ports_unlocode ON ports(unlocode);
CREATE INDEX idx_ports_name ON ports(name);
CREATE INDEX idx_ports_country ON ports(country_code);
CREATE INDEX idx_ports_location ON ports(latitude, longitude);

-- Insert ports
""")
        
        # Insert data
        for idx, row in sea_ports.iterrows():
            unlocode = row['UNLOCODE'].replace("'", "''")
            name = str(row['Name']).replace("'", "''")
            country = str(row['Country']).replace("'", "''")
            lat = row['Lat in Decimal Degrees']
            lon = row['Long in Decimal Degrees']
            function = str(row['Function']).replace("'", "''")
            iata = str(row['IATA']) if pd.notna(row['IATA']) else 'NULL'
            if iata != 'NULL':
                iata = f"'{iata.replace(chr(39), chr(39)+chr(39))}'"
            subdivision = str(row['Subdivision']) if pd.notna(row['Subdivision']) else 'NULL'
            if subdivision != 'NULL':
                subdivision = f"'{subdivision.replace(chr(39), chr(39)+chr(39))}'"
            
            f.write(f"""
INSERT INTO ports (unlocode, name, country_code, latitude, longitude, function_code, iata_code, subdivision)
VALUES ('{unlocode}', '{name}', '{country}', {lat}, {lon}, '{function}', {iata}, {subdivision});
""")
        
    print(f"\n[OK] SQL file created: {output_file}")
    print(f"[OK] Total ports to import: {len(sea_ports)}")

if __name__ == '__main__':
    excel_file = r'C:\Users\Lenovo\OneDrive\Documents\UNLOCODE Comparision Sep 2025.xlsx'
    output_file = 'scripts/ports.sql'
    create_ports_sql(excel_file, output_file)

