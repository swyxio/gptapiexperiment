from prompts import plan, specify_filePaths, generate_code
from utils import generate_folder

def main(app_prompt, generateFolder):
  # create generateFolder folder if doesnt exist
  generate_folder(generateFolder)

  # specify filePaths
  filePaths = specify_filePaths(app_prompt)

  # plan sharedDeps
  sharedDeps = plan(app_prompt, filePaths)

  # loop through filePaths array and generate code for each file
  for filePath in filePaths:
    code = generate_code(app_prompt, sharedDeps, filePath)

    # create file with code content
    f = open(f"{generateFolder}/{filePath}", "w")
    f.write(code)
    f.close()


# # for local testing
# app_prompt = """
# a simple JavaScript/HTML/CSS app that plays the game of tic tac toe.
# """

# generateFolder = "generated"

# print('------------------1')
# sharedDeps = plan(app_prompt)
# print(sharedDeps)
# print('------------------1')
# print('------------------2')
# filePaths = specify_filePaths(app_prompt, sharedDeps)
# print(filePaths)
# print('------------------2')

# # create generateFolder folder if doesnt exist
# generate_folder(generateFolder)

# # loop through filePaths array and generate code for each file
# for filePath in filePaths:
#   print('------------------4: ' + filePath)
#   code = generate_code(app_prompt, sharedDeps, filePath)
#   print(code)

#   # create file with code content
#   f = open(f"{generateFolder}/{filePath}", "w")
#   f.write(code)
#   f.close()