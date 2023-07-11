import sys

from smol_dev.prompts import plan, specify_file_paths, generate_code_sync
from smol_dev.utils import generate_folder, write_file


def main(app_prompt, generate_folder_path="generated", debug=False):
    # create generateFolder folder if doesnt exist
    generate_folder(generate_folder_path)

    # plan shared_deps
    if debug:
        print("--------shared_deps---------")
    with open(f"{generate_folder_path}/shared_deps.md", "wb") as f:

        def stream_handler(chunk):
            f.write(chunk)
            print("chunk", chunk)

        shared_deps = plan(app_prompt, stream_handler)
    if debug:
        print(shared_deps)
    write_file(f"{generate_folder_path}/shared_deps.md", shared_deps)
    if debug:
        print("--------shared_deps---------")

    # specify file_paths
    if debug:
        print("--------specify_filePaths---------")
    file_paths = specify_file_paths(app_prompt, shared_deps)
    if debug:
        print(file_paths)
    if debug:
        print("--------file_paths---------")

    # loop through file_paths array and generate code for each file
    for file_path in file_paths:
        file_path = f"{generate_folder_path}/{file_path}"  # just append prefix
        if debug:
            print(f"--------generate_code: {file_path} ---------")
        code = generate_code_sync(app_prompt, shared_deps, file_path)
        if debug:
            print(code)
        if debug:
            print(f"--------generate_code: {file_path} ---------")
        # create file with code content
        write_file(file_path, code)


# for local testing
if __name__ == "__main__":
    app_prompt = (
        sys.argv[1]
        if len(sys.argv) >= 2
        else """
  a simple JavaScript/HTML/CSS/Canvas app that is a one player game of PONG, using keyboard controls for the player, and a simple algorithm for their opponent.
  Make the canvas a 400 x 400 square and center it in the app.
  Make the paddles 100px long, yellow and the ball small and red.
  Make sure to render the paddles and name them so they can controlled in javascript.
  Implement the collision detection and scoring as well.
  The AI should slowly move the paddle toward the ball at every frame, with some probability of error.
  It is meant to run in Chrome browser, so dont use anything that is not supported by Chrome, and don't use the import and export keywords.
  """
    )
    print(app_prompt)
    generateFolder = "generated"

    main(app_prompt, generateFolder, debug=True)
