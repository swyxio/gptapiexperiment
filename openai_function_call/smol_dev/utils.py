import os

def generate_folder(folder_path: str):
    if not os.path.exists(folder_path):
        os.makedirs(folder_path)
        # print(f"Folder '{folder_path}' created successfully.")
    else:
        import shutil

        shutil.rmtree(folder_path)
        os.makedirs(folder_path)
        # print(f"Folder '{folder_path}' already exists.")


def write_file(file_path: str, content: str):
    # if filepath doesn't exist, create it
    if not os.path.exists(os.path.dirname(file_path)):
        os.makedirs(os.path.dirname(file_path))
    with open(file_path, "w") as f:
        f.write(content)
