## smol-dev

this is a stub for a smol developer package. dont use for now.


## running as script

```bash
# make sure all requirements installed
python smol_dev/main.py
```

## publishing

```bash
pip install build

make

python3 -m pip install --upgrade twine
python3 -m twine upload dist/*
```
