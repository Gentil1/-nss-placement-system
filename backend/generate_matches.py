import requests

response = requests.post('http://localhost:5000/api/matches/generate')
print(response.json())