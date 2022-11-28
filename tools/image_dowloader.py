import requests
import shutil

file1 = open('imagenes.txt', 'r')
Lines = file1.readlines()

for index in range(0, len(Lines), 3):
    name = Lines[index].strip()
    url = Lines[index+1].strip()
    print(f'Downloading {name} from {url}')
    r = requests.get(url, stream=True)
    r.raw.decode_content = True
    # Open a local file with wb ( write binary ) permission.
    with open(f'{name}.png', 'wb') as f:
        shutil.copyfileobj(r.raw, f)
