from prompts import plan, specify_filePaths, generate_code
from utils import generate_folder, writeFile
import os
import sys

def main(app_prompt, generateFolder = "generated", debug=False):
  # create generateFolder folder if doesnt exist
  generate_folder(generateFolder)

  # plan sharedDeps
  if debug: print('--------sharedDeps---------')
  sharedDeps = plan(app_prompt)
  if debug: print(sharedDeps)
  writeFile(f"{generateFolder}/shared_deps.md", sharedDeps)
  if debug: print('--------sharedDeps---------')
  
  # specify filePaths
  if debug: print('--------specify_filePaths---------')
  filePaths = specify_filePaths(app_prompt, sharedDeps)
  if debug: print(filePaths)
  if debug: print('--------filePaths---------')

  # loop through filePaths array and generate code for each file
  for filePath in filePaths:
    filePath = f"{generateFolder}/{filePath}" # just append prefix
    if debug: print(f'--------generate_code: {filePath} ---------')
    code = generate_code(app_prompt, sharedDeps, filePath)
    if debug: print(code)
    if debug: print(f'--------generate_code: {filePath} ---------')
    # create file with code content
    writeFile(filePath, code)


# for local testing
if __name__ == "__main__":
  app_prompt = sys.argv[1] if len(sys.argv) >= 2 else """
  a simple JavaScript/HTML/CSS/Canvas app that is a one player game of PONG, using keyboard controls for the player, and a simple algorithm for their opponent.
  Make the canvas a 400 x 400 square and center it in the app.
  Make the paddles 100px long, yellow and the ball small and red.
  Make sure to render the paddles and name them so they can controlled in javascript.
  Implement the collision detection and scoring as well.
  The AI should slowly move the paddle toward the ball at every frame, with some probability of error.
  It is meant to run in Chrome browser, so dont use anything that is not supported by Chrome, and don't use the import and export keywords.
  """
  print(app_prompt)
  generateFolder = "generated"

  main(app_prompt, generateFolder, debug=True)
