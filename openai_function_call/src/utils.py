
import os
def generate_folder(folder_path):
    if not os.path.exists(folder_path):
        os.makedirs(folder_path)
        # print(f"Folder '{folder_path}' created successfully.")
    else:
        # empty folder
        os.rmdir(folder_path)
        os.makedirs(folder_path)
        # print(f"Folder '{folder_path}' already exists.")