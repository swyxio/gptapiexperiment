## smol-dev

this is a stub for a smol developer package. dont use for now.


## publishing

```bash
pip install build

make

python3 -m pip install --upgrade twine
python3 -m twine upload --repository testpypi dist/*
```