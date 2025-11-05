#!/usr/bin/env python3
"""
Import ports from Excel file to PostgreSQL database.
Filters for sea ports (Function contains '1') and merges DNV + UNLOCODE data.
"""

import pandas as pd
import psycopg2
from psycopg2.extras import execute_values
import sys

# Database connection (via Docker exec)
# We'll use docker exec to run SQL commands instead of direct connection
import subprocess
import json

def execute_sql_via_docker(sql_command):
    """Execute SQL via docker exec."""
    cmd = [
        'docker', 'exec', 'nh_vessels',
        'psql', '-U', 'postgres', '-d', 'nautilus_vessels',
        '-c', sql_command
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    return result

def read_and_process_ports(excel_file):
    """Read Excel file and process port data."""
    print(f"Reading Excel file: {excel_file}")
    
    # Read both sheets
    dnv_df = pd.read_excel(excel_file, sheet_name='DNV')
    unlocode_df = pd.read_excel(excel_file, sheet_name='UNLOCODE')
    
    print(f"DNV rows: {len(dnv_df)}, UNLOCODE rows: {len(unlocode_df)}")
    
    # Filter for sea ports (Function contains '1')
    sea_ports = unlocode_df[unlocode_df['Function'].str.contains('1', na=False)].copy()
    print(f"Sea ports found: {len(sea_ports)}")
    
    # Create UNLOCODE from Country + Location (convert to string first)
    sea_ports['UNLOCODE'] = sea_ports['Country'].astype(str) + sea_ports['Location'].astype(str)
    
    # Select and rename columns
    ports_data = sea_ports[[
        'UNLOCODE',
        'Name',
        'Country',
        'Lat in Decimal Degrees',
        'Long in Decimal Degrees',
        'Function',
        'IATA',
        'Subdivision'
    ]].copy()
    
    # Rename columns to match database schema
    ports_data.columns = [
        'unlocode',
        'name',
        'country_code',
        'latitude',
        'longitude',
        'function_code',
        'iata_code',
        'subdivision'
    ]
    
    # Clean data
    ports_data['latitude'] = pd.to_numeric(ports_data['latitude'], errors='coerce')
    ports_data['longitude'] = pd.to_numeric(ports_data['longitude'], errors='coerce')
    
    # Remove rows with missing coordinates
    ports_data = ports_data.dropna(subset=['latitude', 'longitude'])
    
    print(f"Ports with valid coordinates: {len(ports_data)}")
    
    return ports_data

def create_ports_table(conn):
    """Create ports table if it doesn't exist."""
    cursor = conn.cursor()
    
    create_table_sql = """
    CREATE TABLE IF NOT EXISTS ports (
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
    
    CREATE INDEX IF NOT EXISTS idx_ports_unlocode ON ports(unlocode);
    CREATE INDEX IF NOT EXISTS idx_ports_name ON ports(name);
    CREATE INDEX IF NOT EXISTS idx_ports_country ON ports(country_code);
    CREATE INDEX IF NOT EXISTS idx_ports_location ON ports(latitude, longitude);
    """
    
    cursor.execute(create_table_sql)
    conn.commit()
    print("Ports table created successfully")

def import_ports(conn, ports_data):
    """Import ports data into database."""
    cursor = conn.cursor()
    
    # Clear existing data
    cursor.execute("TRUNCATE TABLE ports RESTART IDENTITY CASCADE;")
    
    # Prepare data for insertion
    values = [
        (
            row['unlocode'],
            row['name'],
            row['country_code'],
            row['latitude'],
            row['longitude'],
            row['function_code'],
            row['iata_code'] if pd.notna(row['iata_code']) else None,
            row['subdivision'] if pd.notna(row['subdivision']) else None
        )
        for _, row in ports_data.iterrows()
    ]
    
    # Batch insert
    insert_sql = """
    INSERT INTO ports (
        unlocode, name, country_code, latitude, longitude,
        function_code, iata_code, subdivision
    ) VALUES %s
    ON CONFLICT (unlocode) DO UPDATE SET
        name = EXCLUDED.name,
        latitude = EXCLUDED.latitude,
        longitude = EXCLUDED.longitude,
        function_code = EXCLUDED.function_code,
        updated_at = CURRENT_TIMESTAMP;
    """
    
    execute_values(cursor, insert_sql, values)
    conn.commit()
    
    print(f"Successfully imported {len(values)} ports")

def main():
    excel_file = r'C:\Users\Lenovo\OneDrive\Documents\UNLOCODE Comparision Sep 2025.xlsx'
    
    try:
        # Read and process Excel file
        ports_data = read_and_process_ports(excel_file)
        
        # Connect to database
        print("\nConnecting to database...")
        conn = psycopg2.connect(**DB_CONFIG)
        
        # Create table
        create_ports_table(conn)
        
        # Import data
        print("\nImporting ports...")
        import_ports(conn, ports_data)
        
        # Verify
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM ports;")
        count = cursor.fetchone()[0]
        print(f"\nTotal ports in database: {count}")
        
        cursor.execute("""
            SELECT unlocode, name, country_code, latitude, longitude 
            FROM ports 
            LIMIT 10;
        """)
        print("\nSample ports:")
        for row in cursor.fetchall():
            print(f"  {row[0]} - {row[1]} ({row[2]}) at {row[3]}, {row[4]}")
        
        conn.close()
        print("\n✓ Port database created successfully!")
        
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    main()

