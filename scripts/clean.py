import os
import shutil

directory_to_clean = "lib"
file_to_keep = "game.min.js"
abs_directory_path = os.path.abspath(directory_to_clean)

try:
    for item in os.listdir(abs_directory_path):
        item_path = os.path.join(abs_directory_path, item)
        
        if item == file_to_keep:
            continue
        
        if os.path.isdir(item_path):
            shutil.rmtree(item_path)
            print(f"Deleted directory: {item}")

        elif os.path.isfile(item_path):
            os.remove(item_path)
            print(f"Deleted file: {item}")

except Exception as e:
    print(f"An error occurred: {e}")

print("Cleanup completed.")
