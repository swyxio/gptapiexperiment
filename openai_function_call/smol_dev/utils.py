
import os
def generate_folder(folder_path):
    if not os.path.exists(folder_path):
        os.makedirs(folder_path)
        # print(f"Folder '{folder_path}' created successfully.")
    else:
        import shutil
        shutil.rmtree(folder_path)
        os.makedirs(folder_path)
        # print(f"Folder '{folder_path}' already exists.")
        
def writeFile(filePath, content):
    # if filepath doesnt exist, create it
    if not os.path.exists(os.path.dirname(filePath)):
      os.makedirs(os.path.dirname(filePath))
    with open(filePath, 'w') as f:
        f.write(content)
