from AQIPython import calculate_aqi

# Test different standards and pollutants
print("Testing AQIPython library...")

# Test US standard
try:
    result = calculate_aqi('US', 'PM25', 50, 'ug/m3')
    print(f"US PM25 50: {result}")
except Exception as e:
    print(f"US PM25 50 Error: {e}")

# Test Indian standard
try:
    result = calculate_aqi('IN', 'PM25', 50, 'ug/m3')
    print(f"IN PM25 50: {result}")
except Exception as e:
    print(f"IN PM25 50 Error: {e}")

# Test problematic concentrations
try:
    result = calculate_aqi('IN', 'PM25', 298.0, 'ug/m3')
    print(f"IN PM25 298: {result}")
except Exception as e:
    print(f"IN PM25 298 Error: {e}")

try:
    result = calculate_aqi('IN', 'NO2', 40.875, 'ug/m3')
    print(f"IN NO2 40.875: {result}")
except Exception as e:
    print(f"IN NO2 40.875 Error: {e}")

# Test other standards
try:
    result = calculate_aqi('CN', 'PM25', 50, 'ug/m3')
    print(f"CN PM25 50: {result}")
except Exception as e:
    print(f"CN PM25 50 Error: {e}")

print("Test complete.")
