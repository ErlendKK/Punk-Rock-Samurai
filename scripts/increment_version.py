
import json
import re

# Increment version number in package.json
def increment_version_in_package(version):
    major, minor, patch = map(int, version.split('.'))
    patch += 1 
    return f"{major}.{minor}.{patch}"

# Increment version number in preload.js
def increment_version_in_preload(file_path, old_version, new_version):
    with open(file_path, 'r') as file:
        filedata = file.read()
    
    filedata = re.sub(f'gameState.version = "{old_version}"',
                      f'gameState.version = "{new_version}"', filedata)

    with open(file_path, 'w') as file:
        file.write(filedata)

package_json_path = 'package.json'
preload_js_path = 'src/preload.js'

with open(package_json_path, 'r') as file:
    data = json.load(file)

# Increment the version number and write the updated package.json file
current_version = data['version']
new_version = increment_version_in_package(current_version)
data['version'] = new_version

with open(package_json_path, 'w') as file:
    json.dump(data, file, indent=2, sort_keys=True)


increment_version_in_preload(preload_js_path, current_version, new_version)

print(f"Version updated to {new_version}")
