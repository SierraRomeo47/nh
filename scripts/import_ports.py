#!/usr/bin/env python3
"""
Import ports from ports.sql into the database
Adapts the INSERT statements to match the actual table schema
"""

import re

def extract_and_convert_ports(sql_file_path):
    """Extract INSERT statements and convert to match actual schema"""
    
    with open(sql_file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    converted_inserts = []
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        
        # Look for INSERT INTO ports
        if line.startswith('INSERT INTO ports'):
            # Get column list
            cols_line = line
            if '(' in cols_line:
                # Find the VALUES part
                values_start = cols_line.find('VALUES')
                if values_start == -1:
                    # VALUES might be on next line
                    if i + 1 < len(lines):
                        values_line = lines[i + 1].strip()
                        if values_line.startswith('VALUES'):
                            # Extract values
                            values_part = values_line[6:].strip()  # Remove 'VALUES'
                            # Remove trailing semicolon
                            if values_part.endswith(';'):
                                values_part = values_part[:-1]
                            
                            # Parse the INSERT columns
                            cols_part = cols_line[cols_line.find('(')+1:cols_line.find(')')]
                            cols = [c.strip() for c in cols_part.split(',')]
                            
                            # Parse values - handle NULL and strings
                            # Remove outer parentheses
                            values_part = values_part.strip()
                            if values_part.startswith('(') and values_part.endswith(')'):
                                values_part = values_part[1:-1]
                            
                            # Split by comma, but respect quoted strings
                            values = []
                            current = ""
                            in_quotes = False
                            for char in values_part:
                                if char == "'" and (not current or current[-1] != '\\'):
                                    in_quotes = not in_quotes
                                    current += char
                                elif char == ',' and not in_quotes:
                                    values.append(current.strip())
                                    current = ""
                                else:
                                    current += char
                            if current:
                                values.append(current.strip())
                            
                            # Map to actual schema: unlocode, name, country_code, latitude, longitude
                            if len(values) >= 5:
                                unlocode = values[0].strip("'")
                                name = values[1].strip("'")
                                country_code = values[2].strip("'")
                                lat = values[3].strip()
                                lon = values[4].strip()
                                
                                # Escape single quotes in name
                                name_escaped = name.replace("'", "''")
                                
                                # Create INSERT for actual schema
                                insert_sql = f"INSERT INTO ports (unlocode, name, country_code, latitude, longitude) VALUES ('{unlocode}', '{name_escaped}', '{country_code}', {lat}, {lon});"
                                converted_inserts.append(insert_sql)
                            
                            i += 1  # Skip VALUES line
        i += 1
    
    return converted_inserts

if __name__ == '__main__':
    sql_file = 'scripts/ports.sql'
    
    inserts = extract_and_convert_ports(sql_file)
    
    # Write to output file
    output_file = 'scripts/ports_import.sql'
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write("-- Import ports data (converted to match actual schema)\n")
        f.write("-- Generated from ports.sql\n\n")
        for insert in inserts:
            f.write(insert + '\n')
    
    print(f"Converted {len(inserts)} ports to {output_file}")
    if inserts:
        print(f"Sample INSERT: {inserts[0][:100]}...")
